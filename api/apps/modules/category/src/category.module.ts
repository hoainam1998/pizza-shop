import { Module } from '@nestjs/common';
import ShareModule from '@share/module';
import CategoryController from './category.controller';
import CategoryService from './category.service';
import LoggingModule from '@share/libs/logging/logging.module';

@Module({
  imports: [ShareModule, LoggingModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export default class CategoryModule {}
