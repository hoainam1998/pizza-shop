import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
import { Observable } from 'rxjs';
import { ROLES } from '@share/di-token';
import { POWER_NUMERIC } from '@share/enums';

@Injectable()
export default class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride<POWER_NUMERIC[]>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles.some((power) => request.session.user.power === power)) {
      return true;
    } else {
      throw new UnauthorizedException(createMessage(messages.USER.DO_NOT_PERMISSION));
    }
  }
}
