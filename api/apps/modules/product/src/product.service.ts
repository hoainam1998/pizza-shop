import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '@share/di-token';
import * as prisma from 'generated/prisma';
import { ProductSelect } from '@share/dto/validators/product.dto';
import HandlePrismaError from '@share/decorators/handle-prisma-error.decorator';
import { ProductPaginationPrismaResponse } from '@share/interfaces';
import { ProductQueryTransform } from '@share/dto/validators/product.dto';
import { calcSkip } from '@share/utils';

@Injectable()
export default class ProductService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: prisma.PrismaClient) {}

  @HandlePrismaError
  createProduct(product: prisma.product): Promise<prisma.product> {
    return this.prismaClient.product.create({
      data: product,
    });
  }

  pagination(select: ProductSelect): Promise<ProductPaginationPrismaResponse> {
    const skip = calcSkip(select.pageSize, select.pageNumber);
    const condition = select.search
      ? {
          name: {
            contains: select.search,
          },
        }
      : {};

    return this.prismaClient.$transaction([
      this.prismaClient.product.findMany({
        take: select.pageSize,
        skip,
        select: select.query as ProductQueryTransform,
        where: condition,
      }),
      this.prismaClient.product.count({
        where: condition,
      }),
    ]);
  }
}
