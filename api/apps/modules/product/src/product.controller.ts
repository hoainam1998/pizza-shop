import { BadRequestException, Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { createProductPattern, paginationPattern } from '@share/pattern';
import * as prisma from 'generated/prisma';
import ProductService from './product.service';
import { ProductSelect } from '@share/dto/validators/product.dto';
import { ProductPaginationResponse } from '@share/interfaces';
import { checkArrayHaveValues } from '@share/utils';
import LoggingService from '@share/libs/logging/logging.service';
import { HandleServiceError } from '@share/decorators';

@Controller()
export default class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly logger: LoggingService,
  ) {}

  @MessagePattern(createProductPattern)
  @HandleServiceError
  createProduct(product: prisma.product): Promise<prisma.product> {
    return this.productService.createProduct(product);
  }

  @MessagePattern(paginationPattern)
  pagination(select: ProductSelect): Promise<ProductPaginationResponse> {
    return this.productService
      .pagination(select)
      .then((results) => {
        const [list, total] = results;
        if (!checkArrayHaveValues(list as prisma.product[])) {
          throw new NotFoundException({
            list: [],
            total: 0,
          });
        }
        return {
          list,
          total,
        } as ProductPaginationResponse;
      })
      .catch((error: Error) => {
        this.logger.log('Product pagination', error.message);
        if (error instanceof NotFoundException) {
          throw new RpcException(error);
        }
        throw new RpcException(new BadRequestException(error));
      });
  }
}
