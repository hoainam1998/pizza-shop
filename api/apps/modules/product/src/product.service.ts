import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRISMA_CLIENT, SOCKET_SERVICE } from '@share/di-token';
import * as prisma from 'generated/prisma';
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachDayOfInterval,
  eachHourOfInterval,
  sub,
  add,
  set,
  endOfDay,
} from 'date-fns';
import {
  GetProductsInCart,
  ProductCreate,
  ProductPagination,
  ProductPaginationForSale,
  Cart,
  ChartRequestPayload,
} from '@share/dto/validators/product.dto';
import { HandlePrismaError } from '@share/decorators';
import {
  BillErrors,
  BestSellingProductDataChartItem,
  RevenueDataChart,
  PurchaseVolumeDataChart,
} from '@share/dto/serializer/product';
import { ProductPaginationPrismaResponse, DataChartType } from '@share/interfaces';
import { calcSkip } from '@share/utils';
import messages from '@share/constants/messages';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import ProductCachingService from '@share/libs/caching/product/product.service';
import ErrorCode from '@share/error-code';
import { CHART_BY } from '@share/enums';
import { action } from './chart-helper.helper';
import { addDataChartEventPattern, refreshProductInfoPattern } from '@share/pattern';

const billMessages = messages.BILL;

type ActionFnType = (start: number, end: number, coreDate: DataChartType) => void;
type StepFnType = (action: ActionFnType, startIndex?: number, coreData?: DataChartType) => DataChartType;

@Injectable()
export default class ProductService {
  private readonly _jobName: string = 'update_product_expired_product';

  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: prisma.PrismaClient,
    @Inject(SOCKET_SERVICE) private readonly socketGateway: ClientProxy,
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
  updateProduct(product: ProductCreate): Promise<prisma.product> {
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
            const visitorIds = await this.productCachingService.getVisitor(product.product_id);
            visitorIds.forEach((visitorId) => this.socketGateway.emit(refreshProductInfoPattern, visitorId));
            return product;
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

  private async insertCartItemsToBill(userId: string, carts: Cart[], total: number): Promise<prisma.bill> {
    const billId = Date.now().toString();
    const productIds: string[] = [];
    const bills = carts.map((cart) => {
      productIds.push(cart.productId);
      return {
        product_id: cart.productId,
        count: cart.quantity,
        total: cart.total,
      };
    });

    const originPrice = await this.prismaClient.product
      .findMany({
        where: {
          product_id: {
            in: productIds,
          },
        },
        select: {
          original_price: true,
          product_id: true,
        },
      })
      .then((products) => {
        return products.reduce((originPrice, product) => {
          const quantity = carts.find((cart) => cart.productId === product.product_id)?.quantity || 0;
          originPrice += product.original_price * quantity;
          return originPrice;
        }, 0);
      });

    return this.prismaClient.bill.create({
      data: {
        bill_id: billId,
        user_id: userId,
        capital: originPrice,
        complete_total: total,
        created_at: billId,
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

  @HandlePrismaError(messages.PRODUCT)
  loadDataBestSellingProductsChart(payload: ChartRequestPayload): Promise<BestSellingProductDataChartItem[]> {
    const { time, by } = payload;
    let timeRange: {
      start?: string;
      end?: string;
    } = {};

    const assignTimeRange = (startDate: Date, endDate: Date): void => {
      timeRange = {
        start: startDate.getTime().toString(),
        end: endDate.getTime().toString(),
      };
    };

    switch (by) {
      case CHART_BY.DAY: {
        const startDate = new Date(time);
        const endDate = new Date(time);
        startDate.setHours(7, 0, 0, 0);
        endDate.setHours(23, 59, 0, 0);
        assignTimeRange(startDate, endDate);
        break;
      }
      case CHART_BY.MONTH: {
        const selectedDate = new Date(time);
        const startDateOfMonth = startOfMonth(selectedDate);
        const endDateOfMonth = endOfMonth(selectedDate);
        assignTimeRange(startDateOfMonth, endDateOfMonth);
        break;
      }
      case CHART_BY.QUARTER: {
        const selectedDate = new Date(time);
        const startDateOfQuarter = startOfQuarter(selectedDate);
        const endDateOfQuarter = endOfQuarter(selectedDate);
        assignTimeRange(startDateOfQuarter, endDateOfQuarter);
        break;
      }
      case CHART_BY.YEAR: {
        const selectedDate = new Date(time);
        const startDateOfYear = startOfYear(selectedDate);
        const endDateOfYear = endOfYear(selectedDate);
        assignTimeRange(startDateOfYear, endDateOfYear);
        break;
      }
      default:
        break;
    }

    return this.prismaClient.bill
      .findMany({
        where: {
          created_at: {
            gte: timeRange.start,
            lt: timeRange.end,
          },
        },
        select: {
          bill_detail: {
            select: {
              product: {
                select: {
                  name: true,
                },
              },
              product_id: true,
              count: true,
            },
          },
          created_at: true,
        },
      })
      .then((bills) => {
        return bills.reduce<BestSellingProductDataChartItem[]>((products, bill) => {
          products = products.concat(
            Array.from(
              bill.bill_detail
                .reduce((collect, productInBill) => {
                  if (collect.has(productInBill.product_id)) {
                    const item = collect.get(productInBill.product_id);
                    item.count += productInBill.count;
                    collect.set(productInBill.product_id, item);
                  } else {
                    collect.set(productInBill.product_id, {
                      id: productInBill.product_id,
                      name: productInBill.product.name,
                      count: productInBill.count,
                    });
                  }
                  return collect;
                }, new Map())
                .values(),
            ).flat(),
          );
          return products;
        }, []);
      })
      .then((products) => {
        return Array.from(
          products
            .reduce((mergedCollection, product) => {
              if (mergedCollection.has(product.id)) {
                const item = mergedCollection.get(product.id);
                item.count += product.count;
                mergedCollection.set(product.id, item);
              } else {
                mergedCollection.set(product.id, product);
              }
              return mergedCollection;
            }, new Map())
            .values(),
        ).flat();
      });
  }

  @HandlePrismaError(messages.PRODUCT)
  loadDataRevenueChart(payload: ChartRequestPayload): Promise<Omit<RevenueDataChart, 'validate'>> {
    const { time, by } = payload;

    function step(
      action: ActionFnType,
      startIndex: number = 0,
      coreData: DataChartType = { revenue: [], capital: [], labels: [] },
    ) {
      const nextIndex = startIndex + 1;
      if (nextIndex < this.range.length) {
        const start: number = this.range[startIndex].getTime();
        const next: number = this.range[nextIndex].getTime();
        action(start, next, coreData);
        this.step(action, nextIndex, coreData);
        if (nextIndex === this.range.length - 1) {
          action(next, +this.end, coreData);
        }
      }
      return coreData;
    }

    const timeRange: {
      start?: string;
      end?: string;
      range?: Date[];
      step: StepFnType;
    } = {
      step,
    };

    const assignTimeRange = (start: Date, end: Date, range: Date[]): void => {
      Object.assign(timeRange, {
        start: start.getTime().toString(),
        end: end.getTime().toString(),
        range,
      });
    };

    switch (by) {
      case CHART_BY.DAY: {
        const startDate = new Date(time);
        const endDate = new Date(time);
        startDate.setHours(7, 0, 0, 0);
        endDate.setHours(23, 59, 0, 0);
        const hoursInDay = eachHourOfInterval({ start: startDate, end: endDate });
        assignTimeRange(startDate, endDate, hoursInDay);
        break;
      }
      case CHART_BY.MONTH: {
        const selectedDate = new Date(time);
        const startDateOfMonth = startOfMonth(selectedDate);
        const endDateOfMonth = endOfMonth(selectedDate);
        const daysInMonth = eachDayOfInterval({ start: startDateOfMonth, end: endDateOfMonth });
        assignTimeRange(startDateOfMonth, endDateOfMonth, daysInMonth);
        break;
      }
      case CHART_BY.QUARTER: {
        const selectedDate = new Date(time);
        const startDateOfYear = startOfYear(selectedDate);
        const endDateOfYear = endOfYear(selectedDate);
        const quarters = eachQuarterOfInterval({ start: startDateOfYear, end: endDateOfYear });
        assignTimeRange(startDateOfYear, endDateOfYear, quarters);
        break;
      }
      case CHART_BY.YEAR: {
        const selectedDate = new Date(time);
        const startDateOfYear = startOfYear(selectedDate);
        const endDateOfYear = endOfYear(selectedDate);
        const monthsInYear = eachMonthOfInterval({ start: startDateOfYear, end: endDateOfYear });
        assignTimeRange(startDateOfYear, endDateOfYear, monthsInYear);
        break;
      }
      default:
        break;
    }

    return this.prismaClient.bill
      .findMany({
        where: {
          created_at: {
            gte: timeRange.start,
            lt: timeRange.end,
          },
        },
        select: {
          capital: true,
          complete_total: true,
          created_at: true,
        },
      })
      .then((bills) => timeRange.step(action(bills, by)) as RevenueDataChart);
  }

  private getBillsAtSpecificTime(
    start: number,
    end: number,
  ): Promise<Pick<prisma.bill, 'capital' | 'complete_total' | 'created_at'>[]> {
    return this.prismaClient.bill.findMany({
      where: {
        created_at: {
          gte: start.toString(),
          lt: end.toString(),
        },
      },
      select: {
        capital: true,
        complete_total: true,
        created_at: true,
      },
    });
  }

  private loadDataPurchaseVolumeChartAtSpecificTime(timeline: number): Promise<void> {
    const start = new Date(timeline);
    const end = new Date(timeline);
    start.setMinutes(0, 0, 0);
    end.setMinutes(59, 59, 59);
    const upperLimit = new Date();
    upperLimit.setHours(23, 59, 59, 59);
    const lowerLimit = new Date();
    lowerLimit.setHours(7, 0, 0, 0);

    if (timeline >= start.getTime() && timeline < end.getTime()) {
      return this.getBillsAtSpecificTime(start.getTime(), end.getTime())
        .then((bills) => {
          return bills.reduce(
            (data, bill) => {
              data.revenue += bill.complete_total - bill.capital;
              data.capital += bill.capital;
              return data;
            },
            { revenue: 0, capital: 0 },
          );
        })
        .then((payload) => {
          this.socketGateway.emit(addDataChartEventPattern, payload);
          const stepTime = set(add(start, { hours: 1 }), { minutes: 0, seconds: 0, milliseconds: 0 });
          this.executeActionAtTimeline(stepTime.getTime());
        });
    }
    return Promise.resolve();
  }

  private executeActionAtTimeline(timeline: number): void {
    this.schedulerService.takeActionAtSpecificTime(
      timeline,
      () => this.loadDataPurchaseVolumeChartAtSpecificTime(timeline),
      'adding_data_chart',
      this.loadDataPurchaseVolumeChart.name,
    );
  }

  @HandlePrismaError(messages.PRODUCT)
  loadDataPurchaseVolumeChart(): Promise<Omit<PurchaseVolumeDataChart, 'validate'>> {
    let end;
    let start;
    let executeTime: Date;
    const current = new Date();
    const limitTimestamp = set(new Date(), { hours: 23, minutes: 0, seconds: 0, milliseconds: 0 }).getTime();
    const minimumTimestamp = set(new Date(), { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 }).getTime();
    const currentTimestamp = current.getTime();

    if (current.getTime() <= limitTimestamp) {
      if (currentTimestamp <= minimumTimestamp) {
        start = sub(new Date(), { days: 1 });
        start.setHours(7, 0, 0, 0);
        end = sub(new Date(), { days: 1 });
        end.setHours(23, 59, 59, 59);
      } else {
        start = new Date();
        start.setHours(7, 0, 0, 0);
        end = new Date();
        end.setMinutes(59, 59, 59);
        executeTime = set(add(new Date(), { hours: 1 }), { minutes: 0, seconds: 0, milliseconds: 0 });
      }
    } else {
      const endOfDayTimestamp = endOfDay(current).getTime();
      if (current.getTime() <= endOfDayTimestamp) {
        end = set(new Date(), { hours: 23, minutes: 59, seconds: 59, milliseconds: 59 });
        start = set(new Date(), { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
      } else {
        end = set(sub(new Date(), { days: 1 }), { hours: 23, minutes: 59, seconds: 59, milliseconds: 59 });
        start = set(sub(new Date(), { days: 1 }), { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
      }
    }

    function step(
      action: ActionFnType,
      range: Date[],
      startIndex: number = 0,
      coreData: DataChartType = { revenue: [], capital: [] },
    ) {
      const nextIndex = startIndex + 1;
      if (nextIndex < range.length) {
        const start: number = range[startIndex].getTime();
        const next: number = range[nextIndex].getTime();
        action(start, next, coreData);
        step(action, range, nextIndex, coreData);
      }
      return coreData;
    }

    return this.getBillsAtSpecificTime(start.getTime(), end.getTime())
      .then((bills) => {
        const hours = eachHourOfInterval({ start, end });
        return step(action(bills), hours);
      })
      .then((result) => {
        if (executeTime) {
          this.executeActionAtTimeline(executeTime.getTime());
        }
        return { ...result, targetTime: start.getTime() } as PurchaseVolumeDataChart;
      });
  }
}
