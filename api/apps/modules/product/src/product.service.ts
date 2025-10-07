import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '@share/di-token';
import * as prisma from 'generated/prisma';
import { ProductSelect } from '@share/dto/validators/product.dto';
import { HandlePrismaError } from '@share/decorators';
import { ProductPaginationPrismaResponse } from '@share/interfaces';
import { calcSkip } from '@share/utils';
import messages from '@share/constants/messages';

@Injectable()
export default class ProductService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: prisma.PrismaClient) {}

  @HandlePrismaError(messages.PRODUCT)
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
        select: select.query,
        where: condition,
        orderBy: {
          product_id: 'desc',
        },
      }),
      this.prismaClient.product.count({
        where: condition,
      }),
    ]);
  }
}
