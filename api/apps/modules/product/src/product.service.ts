import { Inject, Injectable } from '@nestjs/common';
import * as cron from 'cron';
import { PRISMA_CLIENT } from '@share/di-token';
import * as prisma from 'generated/prisma';
import { ProductSelect } from '@share/dto/validators/product.dto';
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

  @HandlePrismaError(messages.PRODUCT)
  createProduct(product: prisma.product): Promise<prisma.product> {
    return this.prismaClient.product
      .create({
        data: product,
      })
      .then((product) => {
        const date = new Date(+product.expired_time);
        const dateStr = formatDateTime(date);
        const jobName = 'deleteExpiredProduct';
        const job = new cron.CronJob(date, async () => {
          await this.delete(product.product_id);
          this.logger.log('The product was deleted!', this.createProduct.name);
        });

        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();

        this.logger.log(`job "${jobName}" added at ${dateStr}!`, this.createProduct.name);
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
}
