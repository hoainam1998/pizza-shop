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
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
import { user } from 'generated/prisma';
import UserService from './user.service';
import { CanSignupSerializer, LoginSerializer } from '@share/dto/serializer/user';
import { LoginInfo, SignupDTO, ResetPassword } from '@share/dto/validators/user.dto';
import { createMessage, getAdminResetPasswordLink } from '@share/utils';
import messages from '@share/constants/messages';
import SendEmailService from '@share/libs/mailer/mailer.service';
import { type UserCreatedType } from '@share/interfaces';
import { MessageSerializer } from '@share/dto/serializer/common';
import LoggingService from '@share/libs/logging/logging.service';
import ErrorCode from '@share/error-code';
import { UserRouter } from '@share/router';
import { HandleHttpError } from '@share/decorators';
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
    return this.userService.signup(instanceToPlain(user) as user).pipe(
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
    return this.userService.login(loginInfo).pipe(
      map((user) => {
        const loginResult = new LoginSerializer(user);
        return loginResult.validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.canSignup.name);
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
}
