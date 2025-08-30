import { Controller, Get } from '@nestjs/common';
import UserService from './user.service';
import { Observable } from 'rxjs';

@Controller('users')
export default class UserController {
  constructor(private readonly appService: UserService) {}

  @Get('hello')
  getHello(): Observable<string> {
    return this.appService.getHello();
  }
}
