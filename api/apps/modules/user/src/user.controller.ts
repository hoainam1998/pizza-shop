import { Controller } from '@nestjs/common';
import { type user } from 'generated/prisma';
import { MessagePattern } from '@nestjs/microservices';
import UsersService from './user.service';
import LoggingService from '@share/libs/logging/logging.service';
import { HandleServiceError } from '@share/decorators';
import { canSignupPattern, signupPattern } from '@share/pattern';
import { type SignupUserPayloadType } from '@share/interfaces';

@Controller('user')
export default class UserController {
  constructor(
    private readonly userService: UsersService,
    private readonly logger: LoggingService,
  ) {}

  @MessagePattern(canSignupPattern)
  @HandleServiceError
  canSignup(): Promise<number> {
    return this.userService.canSignup();
  }

  @MessagePattern(signupPattern)
  @HandleServiceError
  signup(signupUser: SignupUserPayloadType): Promise<user> {
    return this.userService.signup(signupUser.user);
  }
}
