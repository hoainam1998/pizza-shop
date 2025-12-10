import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@share/decorators/auths';
import { LoginSessionPayload } from '@share/dto/validators/user.dto';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    } else {
      return new LoginSessionPayload(request.session.user).validate().then((errors) => {
        if (errors.length) {
          throw new UnauthorizedException(createMessage(messages.USER.DID_NOT_LOGIN));
        }
        return true;
      });
    }
  }
}
