import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '@share/di-token';
import * as prisma from 'generated/prisma';
import { ProductCreate, ProductSelect } from '@share/dto/validators/product.dto';
import { HandlePrismaError } from '@share/decorators';
import { ProductPaginationPrismaResponse } from '@share/interfaces';
import { calcSkip } from '@share/utils';
import messages from '@share/constants/messages';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';

@Injectable()
export default class ProductService {
  private readonly _jobName: string = 'delete_expired_product';

  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: prisma.PrismaClient,
    private readonly ingredientCachingService: IngredientCachingService,
    private readonly schedulerService: SchedulerService,
  ) {}

  private deleteProductWhenExpired(product: prisma.product, actionName: string): void {
    this.schedulerService.deleteItemExpired(
      +product.expired_time,
      () => this.delete(product.product_id),
      this._jobName,
      actionName,
    );
  }

  @HandlePrismaError(messages.PRODUCT)
  createProduct(product: prisma.product): Promise<prisma.product> {
    return this.prismaClient.product
      .create({
        data: product,
      })
      .then(async (product) => {
        this.deleteProductWhenExpired(product, this.createProduct.name);
        await this.ingredientCachingService.deleteAllProductIngredients(product.product_id);
        return product;
      });
  }

  @HandlePrismaError(messages.PRODUCT)
  pagination(select: ProductSelect): Promise<ProductPaginationPrismaResponse> {
    const skip = calcSkip(select.pageSize, select.pageNumber);
    const condition = select.search
      ? {
          name: {
            contains: select.search,
          },
        }
      : {};

    if (select.categoryId) {
      Object.assign(condition, {
        category_id: select.categoryId,
      });
    }

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

  @HandlePrismaError(messages.PRODUCT)
  getProduct(select: Record<string, any>): Promise<any> {
    return this.prismaClient.product.findUniqueOrThrow({
      where: {
        product_id: select.productId,
      },
      select: select.query,
    });
  }

  private delete(id: string): Promise<prisma.product> {
    return this.prismaClient
      .$transaction([
        this.prismaClient.product_ingredient.deleteMany({
          where: {
            product_id: id,
          },
        }),
        this.prismaClient.product.delete({
          where: {
            product_id: id,
          },
        }),
      ])
      .then((results) => results[1]);
  }

  @HandlePrismaError(messages.PRODUCT)
  deleteProduct(productId: string): Promise<prisma.product> {
    return this.delete(productId).then((product) => {
      this.schedulerService.deleteScheduler(this._jobName, this.deleteProduct.name);
      return product;
    });
  }

  @HandlePrismaError(messages.PRODUCT)
  updateProduct(product: ProductCreate): Promise<prisma.product> {
    return this.prismaClient
      .$transaction([
        this.prismaClient.product_ingredient.deleteMany({
          where: {
            product_id: product.product_id,
          },
        }),
        this.prismaClient.product.update({
          where: {
            product_id: product.product_id,
          },
          data: {
            name: product.name,
            avatar: product.avatar,
            count: product.count,
            price: product.price,
            original_price: product.price,
            expired_time: product.expired_time,
            category_id: product.category_id,
            product_ingredient: product.product_ingredient,
          },
        }),
      ])
      .then(async (results) => {
        const product = results[1];
        this.deleteProductWhenExpired(product, this.updateProduct.name);
        await this.ingredientCachingService.deleteAllProductIngredients(product.product_id);
        return product;
      });
  }
}
