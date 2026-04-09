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
  Param,
  Delete,
  Put,
  Res,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import express from 'express';
import { map, Observable, tap } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
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
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import SendEmailService from '@share/libs/mailer/mailer.service';
import type { UserLoggedSerializerType, UserCreatedReturnType } from '@share/interfaces';
import { MessageSerializer } from '@share/dto/serializer/common';
import LoggingService from '@share/libs/logging/logging.service';
import { UserRouter } from '@share/router';
import { HandleHttpError, UploadImage } from '@share/decorators';
import { Public, Roles } from '@share/decorators/auths';
import BaseController from '../controller';
import CanSignupGuard from '@share/guards/can-signup.service';
import OnlyAllowSelfGuard from '@share/guards/only-allow-self.service';
import { POWER_NUMERIC } from '@share/enums';
import RolesGuard from '@share/guards/roles.service';
import DoNotAllowUpdateSelfGuard from '@share/guards/do-not-allow-self.service';

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
      map(async (response) => {
        const canSignupSerializer = new CanSignupSerializer(response);
        const errors = await canSignupSerializer.validate();

        if (errors.length === 0) {
          req.session.user = canSignupSerializer;
          return canSignupSerializer;
        }
        this.logError(errors, this.canSignup.name);
        throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
      }),
    );
  }

  @Public()
  @UseGuards(CanSignupGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(UserRouter.relative.signup)
  @HandleHttpError
  signup(@Body() user: SignupDTO): Observable<Promise<MessageSerializer>> {
    return this.userService.signup(instanceToPlain(user)).pipe(
      map(async (user: UserCreatedReturnType) => {
        try {
          await this.sendEmailService.sendPassword(user.email, user.reset_password_link, user.plain_password);
          return MessageSerializer.create(messages.USER.SIGNUP_SUCCESS);
        } catch (error) {
          Logger.error(this.signup.name, error);
          throw new BadRequestException(MessageSerializer.create(messages.USER.SIGNUP_FAILED));
        }
      }),
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post(UserRouter.relative.login)
  @HandleHttpError
  login(@Req() req: Express.Request, @Body() loginInfo: LoginInfo): Observable<Promise<UserLoggedSerializerType>> {
    Object.assign(loginInfo, { session_id: req.sessionID });
    return this.userService.login(loginInfo).pipe(
      map(async (user) => {
        const loginResult = new LoginSerializer(user);
        const errors = await loginResult.validate();

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
          return LoginSerializer.serializer(serializerResponse);
        }
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

  @Roles(POWER_NUMERIC.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(UserRouter.relative.create)
  @HandleHttpError
  create(@Body() user: CreateUser): Observable<Promise<MessageSerializer>> {
    const plainUser = CreateUser.plain(user);
    return this.userService.signup(plainUser).pipe(
      map(async (user: UserCreatedReturnType) => {
        try {
          await this.sendEmailService.sendPassword(user.email, user.reset_password_link, user.plain_password);
          return MessageSerializer.create(messages.USER.CREATE_USER_SUCCESS);
        } catch (error) {
          Logger.error(this.create.name, error);
          throw new BadRequestException(MessageSerializer.create(messages.USER.CREATE_USER_FAILED));
        }
      }),
    );
  }

  @Roles(POWER_NUMERIC.SUPER_ADMIN)
  @UseGuards(RolesGuard, DoNotAllowUpdateSelfGuard)
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

  @Roles(POWER_NUMERIC.SUPER_ADMIN)
  @UseGuards(RolesGuard, DoNotAllowUpdateSelfGuard)
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

  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Post(UserRouter.relative.pagination)
  @HandleHttpError
  pagination(@Body() select: UserPagination): Observable<Promise<Record<string, any>>> {
    const query = UserQuery.plain(select.query);
    return this.userService.pagination({ ...select, query }).pipe(
      map(async (result) => {
        const response = new PaginationUserSerializer(result);
        const errors = await response.validate();
        if (errors.length) {
          this.logError(errors, this.pagination.name);
          throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
        }
        return {
          total: response.total,
          list: instanceToPlain(response.list),
        };
      }),
    );
  }

  @Roles(POWER_NUMERIC.SUPER_ADMIN)
  @UseGuards(RolesGuard, DoNotAllowUpdateSelfGuard)
  @HttpCode(HttpStatus.OK)
  @Post(UserRouter.relative.detail)
  @HandleHttpError
  getUserDetail(@Body() select: UserDetail): Observable<Promise<Record<string, any>>> {
    return this.userService.getUserDetail(UserDetail.plain(select)).pipe(
      map(async (user) => {
        const errors = await new UserSerializer(user).validate();
        if (errors.length) {
          this.logError(errors, this.getUserDetail.name);
          throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
        }
        return UserSerializer.plain(user);
      }),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Get(UserRouter.relative.logout)
  @HandleHttpError
  logout(@Req() req: Express.Request, @Res() res: express.Response): Observable<null> | void {
    return this.userService.logout(req.session.user!.userId!).pipe(
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
  }

  @UseGuards(OnlyAllowSelfGuard)
  @HttpCode(HttpStatus.CREATED)
  @Put(UserRouter.relative.updatePersonalInfo)
  @UseInterceptors(FileInterceptor('avatar'))
  @HandleHttpError
  updatePersonalInfo(
    @Req() req: Express.Request,
    @Body() personalInfo: UpdatePersonalInfo,
    @UploadImage('avatar', ImageTransformPipe) avatar: string,
  ): Observable<MessageSerializer> {
    Object.assign(personalInfo, { avatar, userId: req.session.user!.userId });
    return this.userService
      .updatePersonalInfo(UpdatePersonalInfo.plain(personalInfo))
      .pipe(map(() => MessageSerializer.create(messages.USER.UPDATE_PERSONAL_INFO_SUCCESS)));
  }
}
