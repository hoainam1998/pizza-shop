import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import ShareModule from 'apps/share/module';

@Module({
  imports: [ShareModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
