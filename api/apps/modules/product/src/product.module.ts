import { Module } from '@nestjs/common';
import ProductController from './product.controller';
import ProductService from './product.service';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

@Module({
  imports: [ShareModule, LoggingModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export default class ProductModule {}
