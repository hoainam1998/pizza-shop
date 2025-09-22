import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { createProductPattern } from '@share/pattern';
import * as prisma from 'generated/prisma';
import ProductService from './product.service';

@Controller()
export default class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern(createProductPattern)
  createProduct(product: prisma.product): Promise<prisma.product> {
    return this.productService.createProduct(product).catch((error: Error) => {
      this.logger.log('Create product', error.message);
      throw new RpcException(new BadRequestException(error));
    });
  }
}
