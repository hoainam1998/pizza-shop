import { Module } from '@nestjs/common';
import UsersController from './user.controller';
import UsersService from './user.service';
import ShareModule from 'apps/share/module';

@Module({
  imports: [ShareModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export default class UsersModule {}
