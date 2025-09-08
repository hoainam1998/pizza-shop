import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { validate } from 'class-validator';
import UserService from './user.service';
import { CanSignupSerializer } from '@share/serializer/user';
import { SignupDTO } from '@share/validators/user.dto';
import { createMessage, getAdminResetPasswordLink } from '@share/utils';
import messages from '@share/constants/messages';
import { instanceToPlain } from 'class-transformer';
import { user } from 'generated/prisma';
import SendEmailService from '@share/libs/mailer/mailer.service';
import { MicroservicesErrorResponse, type UserCreated } from '@share/interfaces';
import { MessageSerializer } from '@share/serializer/common';
import ErrorCode from '@share/error-code';

@Controller('user')
export default class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sendEmailService: SendEmailService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('can-signup')
  canSignup(@Req() req: Express.Request): Observable<Promise<CanSignupSerializer>> {
    return this.userService.canSignup().pipe(
      map((response) => {
        const canSignupSerializer = new CanSignupSerializer(response);
        return validate(canSignupSerializer).then((result) => {
          if (result) {
            req.session.user = canSignupSerializer;
            return canSignupSerializer;
          }
          throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
        });
      }),
      catchError((error: MicroservicesErrorResponse) => {
        throw new BadRequestException(createMessage(error.message!));
      }),
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  signup(@Req() req: Express.Request, @Body() user: SignupDTO) {
    if (!req.session.user?.canSignup) {
      throw new UnauthorizedException(createMessage(messages.USER.CAN_NOT_SIGNUP, ErrorCode.CAN_NOT_SIGNUP));
    }
    return this.userService.signup(instanceToPlain(user) as user, true).pipe(
      map((user: UserCreated) => {
        const link = getAdminResetPasswordLink(user.reset_password_token!);
        return this.sendEmailService
          .sendPassword(user.email, link, user.plain_password)
          .then(() => MessageSerializer.create(messages.USER.SIGNUP_SUCCESS))
          .catch((error) => {
            Logger.error('Signup', error);
            MessageSerializer.create(messages.USER.SIGNUP_FAILED);
          });
      }),
      catchError((error: MicroservicesErrorResponse) => {
        if (error.status === HttpStatus.UNAUTHORIZED) {
          throw new UnauthorizedException(createMessage(error.message!, ErrorCode.EMAIL_REGIS_ALREADY_EXIST));
        }
        throw new BadRequestException(createMessage(error.message!));
      }),
    );
  }
}
