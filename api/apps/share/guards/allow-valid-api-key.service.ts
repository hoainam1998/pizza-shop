import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import messages from '@share/constants/messages';
import constants from '@share/constants';
import UserCachingService from '@share/libs/caching/user/user.service';
import { createMessage, verifyApiKey } from '@share/utils';

@Injectable()
export default class AllowValidApiKeyGuard implements CanActivate {
  constructor(private readonly userCachingService: UserCachingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies[constants.IMPACT_USER_API_KEY] as string;
    let hasExist = false;

    if (token) {
      const requester = verifyApiKey(token);
      const oldApiKey = await this.userCachingService.getUserApiKey(requester.userId as string);

      if (oldApiKey) {
        if (oldApiKey === token) {
          hasExist = true;
        }
      }

      if (hasExist) {
        request['requester'] = requester;
      }

      return hasExist;
    }
    throw new UnauthorizedException(createMessage(messages.USER.API_KEY_INVALID));
  }
}
