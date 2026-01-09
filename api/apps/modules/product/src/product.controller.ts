import { BadRequestException, Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  createProductPattern,
  paginationPattern,
  paginationForSalePattern,
  getProductPattern,
  getProductsInCartPattern,
  updateProductPattern,
  deleteProductPattern,
} from '@share/pattern';
import * as prisma from 'generated/prisma';
import ProductService from './product.service';
import { ProductCreate, ProductPagination } from '@share/dto/validators/product.dto';
import type { ProductPaginationResponse, ProductSelectForSaleType, ProductSelectInCartType } from '@share/interfaces';
import { checkArrayHaveValues, createMessage } from '@share/utils';
import LoggingService from '@share/libs/logging/logging.service';
import { HandleServiceError } from '@share/decorators';
import messages from '@share/constants/messages';

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
  @HandleServiceError
  pagination(select: ProductPagination): Promise<ProductPaginationResponse> {
    return this.productService.pagination(select).then((results) => {
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
    });
  }

  @MessagePattern(paginationForSalePattern)
  @HandleServiceError
  paginationForSale(payload: ProductSelectForSaleType): Promise<ProductPaginationResponse> {
    const { userId, select } = payload;
    return this.productService.paginationForSale(userId, select).then((results) => {
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
    });
  }

  @MessagePattern(getProductsInCartPattern)
  @HandleServiceError
  getProductsInCart(payload: ProductSelectInCartType): Promise<prisma.product[]> {
    const { userId, select } = payload;
    return this.productService.getProductsInCart(userId, select).then((products) => {
      if (!checkArrayHaveValues(products)) {
        throw new NotFoundException([]);
      } else if (products.length !== select.productIds.length) {
        throw new BadRequestException(createMessage(messages.PRODUCT.PRODUCTS_DID_NOT_EXIST));
      }
      return products;
    });
  }

  @MessagePattern(getProductPattern)
  @HandleServiceError
  getProduct(select: Record<string, any>): Promise<prisma.product> {
    return this.productService.getProduct(select);
  }

  @MessagePattern(updateProductPattern)
  @HandleServiceError
  updateProduct(product: ProductCreate): Promise<string[]> {
    return this.productService.updateProduct(product);
  }

  @MessagePattern(deleteProductPattern)
  @HandleServiceError
  deleteProduct(productId: string): Promise<prisma.product> {
    return this.productService.deleteProduct(productId);
  }
}
