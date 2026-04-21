import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import messages from '@share/constants/messages';
import constants from '@share/constants';
import { createMessage, verifyApiKey } from '@share/utils';

@Injectable()
export default class OnlyAllowSelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies[constants.IMPACT_USER_API_KEY] as string;

    if (token) {
      const requester = verifyApiKey(token);
      if (requester.userId === request.session.user.userId) {
        return true;
      } else {
        throw new UnauthorizedException(createMessage(messages.USER.ONLY_ALLOW_YOUR_SELF));
      }
    }
    throw new UnauthorizedException(createMessage(messages.USER.API_KEY_INVALID));
  }
}
