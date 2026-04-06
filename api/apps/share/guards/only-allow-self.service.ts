import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { createMessage, verifyAdminApiKey } from '@share/utils';
import { Observable } from 'rxjs';

@Injectable()
export default class OnlyAllowSelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization as string;

    if (token) {
      const requester = verifyAdminApiKey(token);
      if (requester.userId === request.session.user.userId) {
        return true;
      } else {
        throw new UnauthorizedException(createMessage(messages.USER.ONLY_ALLOW_YOUR_SELF));
      }
    }
    throw new UnauthorizedException(createMessage(messages.USER.API_KEY_INVALID));
  }
}
