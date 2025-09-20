import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { Prisma, type user } from 'generated/prisma';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import UsersService from './user.service';
import { canSignupPattern, signupPattern } from '@share/pattern';
import { type SignupUserPayloadType } from '@share/interfaces';
import { createMessage } from '@share/utils';

@Controller('user')
export default class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern(canSignupPattern)
  canSignup(): Promise<number> {
    return this.userService.canSignup();
  }

  @MessagePattern(signupPattern)
  signup(signupUser: SignupUserPayloadType): Promise<user> {
    return this.userService.signup(signupUser.user, signupUser.canSignup).catch((error: Error) => {
      Logger.error('Signup', error.message);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new RpcException(new BadRequestException(createMessage(error.message)));
      }
      throw new RpcException(error);
    });
  }
}
