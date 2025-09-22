import { Module, Logger } from '@nestjs/common';
import ProductController from './product.controller';
import ProductService from './product.service';
import ShareModule from '@share/module';

@Module({
  imports: [ShareModule],
  controllers: [ProductController],
  providers: [ProductService, Logger],
})
export default class ProductModule {}
