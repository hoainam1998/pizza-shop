import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '@share/di-token';
import * as prisma from 'generated/prisma';
import {
  GetProductsInCart,
  ProductCreate,
  ProductPagination,
  ProductPaginationForSale,
  Cart,
} from '@share/dto/validators/product.dto';
import { HandlePrismaError } from '@share/decorators';
import { BillErrors } from '@share/dto/serializer/product';
import { ProductPaginationPrismaResponse } from '@share/interfaces';
import { calcSkip } from '@share/utils';
import messages from '@share/constants/messages';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import ProductCachingService from '@share/libs/caching/product/product.service';
import ErrorCode from '@share/error-code';

const billMessages = messages.BILL;

@Injectable()
export default class ProductService {
  private readonly _jobName: string = 'update_product_expired_product';

  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: prisma.PrismaClient,
    private readonly ingredientCachingService: IngredientCachingService,
    private readonly productCachingService: ProductCachingService,
    private readonly schedulerService: SchedulerService,
  ) {}

  private updateProductStateWhenExpired(product: prisma.product, actionName: string): void {
    this.schedulerService.updateStateExpired(
      +product.expired_time,
      () => this.updateProductStateExpired(product.product_id),
      this._jobName,
      actionName,
    );
  }

  private updateProductStateExpired(productId: string): Promise<prisma.product> {
    return this.prismaClient.product.update({
      where: {
        product_id: productId,
      },
      data: {
        status: prisma.Status.EXPIRED,
      },
    });
  }

  @HandlePrismaError(messages.PRODUCT)
  createProduct(product: prisma.product): Promise<prisma.product> {
    return this.prismaClient.product
      .create({
        data: product,
      })
      .then(async (product) => {
        this.updateProductStateWhenExpired(product, this.createProduct.name);
        await this.ingredientCachingService.deleteAllProductIngredients(product.product_id);
        return product;
      });
  }

  private handlePagination(
    select: ProductPagination,
    where?: Record<string, any>,
  ): Promise<ProductPaginationPrismaResponse> {
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

    if (where) {
      Object.assign(condition, where);
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
  pagination(select: ProductPagination): Promise<ProductPaginationPrismaResponse> {
    return this.handlePagination(select);
  }

  private removeOldProductAccessByVisitor(userId: string): Promise<number> {
    return this.productCachingService.getProductsAccessByVisitor(userId).then((productIds) => {
      const promiseChain = productIds.map((productId) => {
        return this.productCachingService.removeVisitor(productId, userId);
      });
      return Promise.all(promiseChain).then(() => {
        return this.productCachingService.removeProductsAccessByVisitor(userId);
      });
    });
  }

  private setProductAccessByVisitor(products: prisma.product[], userId: string): Promise<number> {
    const promiseChain = products.map((product) => {
      return this.productCachingService.setVisitor(product.product_id, userId).then(() => product.product_id);
    });
    return Promise.all(promiseChain).then((productIds: string[]) => {
      return this.productCachingService.setProductsAccessByVisitor(productIds, userId);
    });
  }

  private removeProductAccessByVisitor(productId: string): void {
    void this.productCachingService.getVisitor(productId).then((userIds) => {
      const promises = userIds.map((userId) => {
        return this.productCachingService.removeProductAccessByVisitor(productId, userId);
      });
      void Promise.allSettled(promises).then(() => {
        void this.productCachingService.removeAllVisitorOfProduct(productId);
      });
    });
  }

  @HandlePrismaError(messages.PRODUCT)
  paginationForSale(userId: string, select: ProductPaginationForSale): Promise<ProductPaginationPrismaResponse> {
    const where = {
      OR: [
        {
          status: prisma.Status.IN_STOCK,
        },
        {
          status: prisma.Status.LESS,
        },
      ],
    };
    return this.handlePagination(select, where).then((results) => {
      return this.removeOldProductAccessByVisitor(userId).then(() => {
        return this.setProductAccessByVisitor(results[0] as prisma.product[], userId).then(() => results);
      });
    });
  }

  @HandlePrismaError(messages.PRODUCT)
  getProductsInCart(userId: string, select: GetProductsInCart): Promise<prisma.product[]> {
    return this.prismaClient.product
      .findMany({
        select: select.query,
        where: {
          OR: [
            {
              status: prisma.Status.IN_STOCK,
            },
            {
              status: prisma.Status.LESS,
            },
          ],
          product_id: {
            in: select.productIds,
          },
        },
      })
      .then((products) => {
        const promises = products.map((product) => {
          return this.productCachingService.setVisitor(product.product_id, userId).then(() => product.product_id);
        });
        return Promise.all(promises).then((productIds) => {
          return this.productCachingService.setProductsAccessByVisitor(productIds, userId).then(() => products);
        });
      });
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

  @HandlePrismaError(messages.PRODUCT)
  deleteProduct(productId: string): Promise<prisma.product> {
    return this.prismaClient
      .$transaction([
        this.prismaClient.product_ingredient.deleteMany({
          where: {
            product_id: productId,
          },
        }),
        this.prismaClient.product.delete({
          where: {
            product_id: productId,
          },
        }),
      ])
      .then((results) => {
        const product = results[1];
        this.schedulerService.deleteScheduler(this._jobName, this.deleteProduct.name);
        return product;
      });
  }

  @HandlePrismaError(messages.PRODUCT)
  updateProduct(product: ProductCreate): Promise<string[]> {
    return this.prismaClient.product_ingredient
      .deleteMany({
        where: {
          product_id: product.product_id,
        },
      })
      .then(() => {
        return this.prismaClient.product
          .update({
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
          })
          .then(async (product) => {
            this.updateProductStateWhenExpired(product, this.updateProduct.name);
            await this.ingredientCachingService.deleteAllProductIngredients(product.product_id);
            return this.productCachingService.getVisitor(product.product_id);
          });
      });
  }

  private validateCarts(carts: Cart[], total: number): Promise<Omit<BillErrors, 'validate'>> {
    const promises = carts.map((cart) => {
      return this.prismaClient.product.findUnique({
        where: {
          product_id: cart.productId,
        },
        select: {
          price: true,
          count: true,
          status: true,
        },
      });
    });

    return Promise.all(promises).then((products) => {
      let totalMerged = 0;
      const errors = products.reduce<any[]>((errors, product, index) => {
        const cart = carts[index];

        if (product) {
          let errorCode: string | undefined = undefined;
          const messages = [];

          if (product.status === prisma.Status.EXPIRED) {
            messages.push(billMessages.PRODUCT_EXPIRED);
            errorCode = ErrorCode.DISABLED_PRODUCT;
          } else {
            totalMerged += product.price * cart.quantity;

            if (cart.quantity > product.count) {
              messages.push(billMessages.OVERCOME_LIMIT);
              errorCode = ErrorCode.REFRESH_PRODUCT;
            }

            if (cart.price !== product.price) {
              messages.push(billMessages.PRICE_NOT_CONSISTENT);
              errorCode = ErrorCode.REFRESH_PRODUCT;
            }

            if (cart.total !== product.price * cart.quantity) {
              messages.push(billMessages.TOTAL_NOT_CONSISTENT);
              errorCode = ErrorCode.REFRESH_PRODUCT;
            }
          }

          if (messages.length) {
            errors.push({
              productId: cart.productId,
              messages,
              errorCode,
            });
          }
        } else {
          errors.push({
            productId: cart.productId,
            messages: [messages.PRODUCT.PRODUCT_DID_NOT_EXIST],
            errorCode: ErrorCode.DISABLED_PRODUCT,
          });
        }
        return errors;
      }, []);

      return {
        errors,
        totalErrorMessage: totalMerged !== total ? billMessages.FINISH_TOTAL_NOT_CONSISTENT : null,
        validateResult: errors.length === 0 && totalMerged === total,
      };
    });
  }

  private insertCartItemsToBill(userId: string, carts: Cart[], total: number): Promise<prisma.bill> {
    const billId = Date.now().toString();
    const bills = carts.map((cart) => {
      return {
        product_id: cart.productId,
        count: cart.quantity,
        total: cart.total,
      };
    });

    return this.prismaClient.bill.create({
      data: {
        bill_id: billId,
        user_id: userId,
        complete_total: total,
        created_at: Date.now().toString(),
        bill_detail: {
          createMany: {
            data: bills,
          },
        },
      },
    });
  }

  @HandlePrismaError(messages.PRODUCT)
  validateProductsInCart(carts: Cart[], total: number): Promise<Omit<BillErrors, 'validate'>> {
    return this.validateCarts(carts, total);
  }

  @HandlePrismaError(messages.PRODUCT)
  payment(userId: string, carts: Cart[], total: number): Promise<Omit<BillErrors, 'validate'>> {
    return this.validateCarts(carts, total).then(async (result) => {
      if (result.validateResult) {
        await this.insertCartItemsToBill(userId, carts, total);
      }
      return result;
    });
  }
}
