import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { USER_SERVICE } from 'apps/share/di-token';
import { createMicroserviceEvent } from 'apps/share/utils';

@Injectable()
export default class UserService {
  constructor(@Inject(USER_SERVICE) private user: ClientProxy) {}

  getHello(): Observable<string> {
    return this.user.send<string>(createMicroserviceEvent('hello'), 'nam');
  }
}
