import { Module } from '@nestjs/common';
import UserController from './user.controller';
import UserService from './user.service';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

@Module({
  imports: [ShareModule, LoggingModule],
  controllers: [UserController],
  providers: [UserService],
})
export default class UserModule {}
