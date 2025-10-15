import { Inject, Injectable } from '@nestjs/common';
import * as cron from 'cron';
import { PRISMA_CLIENT } from '@share/di-token';
import * as prisma from 'generated/prisma';
import { ProductCreate, ProductSelect } from '@share/dto/validators/product.dto';
import { HandlePrismaError } from '@share/decorators';
import { ProductPaginationPrismaResponse } from '@share/interfaces';
import { calcSkip } from '@share/utils';
import messages from '@share/constants/messages';
import { SchedulerRegistry } from '@nestjs/schedule';
import { formatDateTime } from '@share/utils';
import LoggingService from '@share/libs/logging/logging.service';

@Injectable()
export default class ProductService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: prisma.PrismaClient,
    private schedulerRegistry: SchedulerRegistry,
    private readonly logger: LoggingService,
  ) {}

  private deleteProductWhenExpired(product: prisma.product, actionName: string): void {
    const date = new Date(+product.expired_time);
    const dateStr = formatDateTime(date);
    const jobName = 'delete_expired_product';
    const job = new cron.CronJob(date, async () => {
      await this.delete(product.product_id);
      this.logger.log(messages.PRODUCT.PRODUCT_DELETED, actionName);
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();

    this.logger.log(`job "${jobName}" added at ${dateStr}!`, actionName);
  }

  @HandlePrismaError(messages.PRODUCT)
  createProduct(product: prisma.product): Promise<prisma.product> {
    return this.prismaClient.product
      .create({
        data: product,
      })
      .then((product) => {
        this.deleteProductWhenExpired(product, this.createProduct.name);
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
  getProduct(select: any): Promise<any> {
    return this.prismaClient.product.findUniqueOrThrow({
      where: {
        product_id: select.productId,
      },
      select: select.query,
    });
  }

  delete(id: string): Promise<prisma.product> {
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
      .then((results) => {
        return results[1];
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
      .then((results) => {
        const product = results[1];
        this.deleteProductWhenExpired(product, this.updateProduct.name);
        return product;
      });
  }
}
