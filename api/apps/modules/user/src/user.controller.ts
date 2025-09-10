import { BadRequestException, Controller } from '@nestjs/common';
import { Prisma, type user } from 'generated/prisma';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import UsersService from './user.service';
import { canSignupPattern, signupPattern } from '@share/pattern';
import { type SignupUserPayload } from '@share/interfaces';
import { createMessage } from '@share/utils';

@Controller('user')
export default class UsersController {
  constructor(private readonly userService: UsersService) {}

  @MessagePattern(canSignupPattern)
  canSignup(): Promise<number> {
    return this.userService.canSignup();
  }

  @MessagePattern(signupPattern)
  signup(signupUser: SignupUserPayload): Promise<user> {
    return this.userService.signup(signupUser.user, signupUser.canSignup).catch((error: Error) => {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new RpcException(new BadRequestException(createMessage(error.message)));
      }
      throw new RpcException(error);
    });
  }
}
