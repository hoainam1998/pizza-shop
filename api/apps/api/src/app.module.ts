import { Module } from '@nestjs/common';
import ShareModule from 'apps/share/module';
import CategoryModule from './category/category.module';
import UserModule from './user/user.module';

@Module({
  imports: [ShareModule, CategoryModule, UserModule],
  controllers: [],
  providers: [ShareModule],
})
export default class AppModule {}
