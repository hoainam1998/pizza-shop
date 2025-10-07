import { Module } from '@nestjs/common';
import ShareModule from '@share/module';
import CategoryController from './category.controller';
import CategoryService from './category.service';

@Module({
  imports: [ShareModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export default class CategoryModule {}
