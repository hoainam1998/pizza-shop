import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '@share/di-token';
import * as prisma from 'generated/prisma';
import HandlePrismaError from '@share/decorators/handle-prisma-error.decorator';

@Injectable()
export default class ProductService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: prisma.PrismaClient) {}

  @HandlePrismaError
  createProduct(product: prisma.product): Promise<prisma.product> {
    return this.prismaClient.product.create({
      data: product,
    });
  }
}
