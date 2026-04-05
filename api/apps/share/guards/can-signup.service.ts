import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
import { Observable } from 'rxjs';
import ErrorCode from '@share/error-code';

@Injectable()
export default class CanSignupGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.session.user.canSignup) {
      throw new UnauthorizedException(createMessage(messages.USER.CAN_NOT_SIGNUP, ErrorCode.CAN_NOT_SIGNUP));
    }
    return true;
  }
}
