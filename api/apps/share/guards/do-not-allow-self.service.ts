import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
import { ALLOW_VALID_API_KEY_GUARD } from '@share/di-token';
import AllowValidApiKeyGuard from './allow-valid-api-key.service';

@Injectable()
export default class DoNotAllowUpdateSelfGuard implements CanActivate {
  constructor(@Inject(ALLOW_VALID_API_KEY_GUARD) private readonly allowValidApiKeyGuard: AllowValidApiKeyGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const previousValidateResult = await this.allowValidApiKeyGuard.canActivate(context);

    if (previousValidateResult) {
      const request = context.switchToHttp().getRequest();
      const requester = request['requester'];

      if (requester.userId !== request.session.user.userId) {
        return true;
      }
      throw new UnauthorizedException(createMessage(messages.USER.DO_NOT_CHANGE_YOURSELF));
    }
    throw new UnauthorizedException(createMessage(messages.USER.USER_INFO_OUT_OF_DATE));
  }
}
