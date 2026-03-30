import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Logger,
  UnauthorizedException,
  Param,
  Delete,
  Put,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import express from 'express';
import { map, Observable, tap } from 'rxjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import UserService from './user.service';
import {
  CanSignupSerializer,
  LoginSerializer,
  PaginationUserSerializer,
  UserSerializer,
} from '@share/dto/serializer/user';
import {
  LoginInfo,
  SignupDTO,
  ResetPassword,
  CreateUser,
  UserPagination,
  UserQuery,
  UserDetail,
  UpdateUser,
  UserDelete,
  UpdatePersonalInfo,
} from '@share/dto/validators/user.dto';
import { ImageTransformPipe } from '@share/pipes';
import { createMessage, getAdminResetPasswordLink } from '@share/utils';
import messages from '@share/constants/messages';
import SendEmailService from '@share/libs/mailer/mailer.service';
import { type UserCreatedType } from '@share/interfaces';
import { MessageSerializer } from '@share/dto/serializer/common';
import LoggingService from '@share/libs/logging/logging.service';
import ErrorCode from '@share/error-code';
import { UserRouter } from '@share/router';
import { HandleHttpError, UploadImage } from '@share/decorators';
import { Public } from '@share/decorators/auths';
import BaseController from '../controller';

@Controller(UserRouter.BaseUrl)
export default class UserController extends BaseController {
  constructor(
    private readonly userService: UserService,
    private readonly sendEmailService: SendEmailService,
    private readonly loggingService: LoggingService,
  ) {
    super(loggingService, 'user');
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get(UserRouter.relative.canSignup)
  @HandleHttpError
  canSignup(@Req() req: Express.Request): Observable<Promise<CanSignupSerializer>> {
    return this.userService.canSignup().pipe(
      map((response) => {
        const canSignupSerializer = new CanSignupSerializer(response);
        return canSignupSerializer.validate().then((errors) => {
          if (errors.length === 0) {
            req.session.user = canSignupSerializer;
            return canSignupSerializer;
          }
          this.logError(errors, this.canSignup.name);
          throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
        });
      }),
    );
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post(UserRouter.relative.signup)
  @HandleHttpError
  signup(@Req() req: Express.Request, @Body() user: SignupDTO): Observable<Promise<MessageSerializer>> {
    if (!req.session.user?.canSignup) {
      throw new UnauthorizedException(createMessage(messages.USER.CAN_NOT_SIGNUP, ErrorCode.CAN_NOT_SIGNUP));
    }
    return this.userService.signup(instanceToPlain(user)).pipe(
      map((user: UserCreatedType) => {
        const link = getAdminResetPasswordLink(user.reset_password_token!);
        return this.sendEmailService
          .sendPassword(user.email, link, user.plain_password)
          .then(() => MessageSerializer.create(messages.USER.SIGNUP_SUCCESS))
          .catch((error) => {
            Logger.error(this.signup.name, error);
            throw new BadRequestException(MessageSerializer.create(messages.USER.SIGNUP_FAILED));
          });
      }),
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post(UserRouter.relative.login)
  @HandleHttpError
  login(@Req() req: Express.Request, @Body() loginInfo: LoginInfo): Observable<Promise<Record<string, any>>> {
    Object.assign(loginInfo, { session_id: req.sessionID });
    return this.userService.login(loginInfo).pipe(
      map((user) => {
        const loginResult = new LoginSerializer(user);
        return loginResult.validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.login.name);
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          } else {
            const serializerResponse = instanceToPlain(loginResult);
            if (!serializerResponse.resetPasswordToken) {
              req.session.user = {
                canSignup: false,
                email: serializerResponse.email,
                power: serializerResponse.power,
                userId: serializerResponse.userId,
              };
            }
            return serializerResponse;
          }
        });
      }),
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post(UserRouter.relative.resetPassword)
  @HandleHttpError
  resetPassword(@Body() resetPasswordBody: ResetPassword): Observable<MessageSerializer> {
    return this.userService
      .resetPassword(resetPasswordBody)
      .pipe(map(() => MessageSerializer.create(messages.USER.RESET_PASSWORD_SUCCESS)));
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(UserRouter.relative.create)
  @HandleHttpError
  create(@Body() user: CreateUser): Observable<Promise<MessageSerializer>> {
    const plainUser = instanceToPlain(plainToInstance(CreateUser, user));
    return this.userService.signup(plainUser).pipe(
      map((user: UserCreatedType) => {
        const link = getAdminResetPasswordLink(user.reset_password_token!);
        return this.sendEmailService
          .sendPassword(user.email, link, user.plain_password)
          .then(() => MessageSerializer.create(messages.USER.CREATE_USER_SUCCESS))
          .catch((error) => {
            Logger.error(this.create.name, error);
            throw new BadRequestException(MessageSerializer.create(messages.USER.CREATE_USER_FAILED));
          });
      }),
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Put(UserRouter.relative.update)
  @HandleHttpError
  update(@Req() req: Express.Request, @Body() user: UpdateUser): Observable<MessageSerializer> {
    return this.userService.updateUser(UpdateUser.plain(user)).pipe(
      map((user) => {
        req.sessionStore.destroy(user.session_id as string);
        return MessageSerializer.create(messages.USER.UPDATE_USER_SUCCESS);
      }),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete(UserRouter.relative.delete)
  @HandleHttpError
  delete(@Req() req: Express.Request, @Param() user: UserDelete): Observable<MessageSerializer> {
    return this.userService.deleteUser(user.userId).pipe(
      map((user) => {
        req.sessionStore.destroy(user.session_id as string);
        return MessageSerializer.create(messages.USER.DELETE_USER_SUCCESS);
      }),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post(UserRouter.relative.pagination)
  @HandleHttpError
  pagination(@Body() select: UserPagination): Observable<Promise<Record<string, any>>> {
    const query = UserQuery.plain(select.query);
    return this.userService.pagination({ ...select, query }).pipe(
      map((result) => {
        const response = new PaginationUserSerializer(result);
        return response.validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.pagination.name);
            throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
          }

          return {
            total: response.total,
            list: instanceToPlain(response.list),
          };
        });
      }),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post(UserRouter.relative.detail)
  @HandleHttpError
  getUserDetail(@Body() select: UserDetail): Observable<Promise<Record<string, any>>> {
    return this.userService.getUserDetail(UserDetail.plain(select)).pipe(
      map((user) => {
        return new UserSerializer(user).validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.getUserDetail.name);
            throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
          }
          return instanceToPlain(plainToInstance(UserSerializer, user));
        });
      }),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Get(UserRouter.relative.logout)
  @HandleHttpError
  logout(@Req() req: Express.Request, @Res() res: express.Response): Observable<null> | void {
    if (req.session.user && req.session.user.userId) {
      return this.userService.logout(req.session.user.userId).pipe(
        tap(() => {
          req.session.destroy((error) => {
            if (error) {
              res.status(HttpStatus.BAD_REQUEST).json(MessageSerializer.create(messages.USER.LOGOUT_USER_FAIL));
            } else {
              res.json();
            }
          });
        }),
      );
    } else {
      res.status(HttpStatus.BAD_REQUEST).json(MessageSerializer.create(messages.USER.ALREADY_LOGOUT));
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Put(UserRouter.relative.updatePersonalInfo)
  @UseInterceptors(FileInterceptor('avatar'))
  @HandleHttpError
  updatePersonalInfo(
    @Body() personalInfo: UpdatePersonalInfo,
    @UploadImage('avatar', ImageTransformPipe) avatar: string,
  ): Observable<MessageSerializer> {
    Object.assign(personalInfo, { avatar });
    return this.userService
      .updatePersonalInfo(UpdatePersonalInfo.plain(personalInfo))
      .pipe(map(() => MessageSerializer.create(messages.USER.UPDATE_PERSONAL_INFO_SUCCESS)));
  }
}
