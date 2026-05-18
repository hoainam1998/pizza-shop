import { RpcException } from '@nestjs/microservices';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { PRISMA_CLIENT } from '@share/di-token';
import { CHART_BY } from '@share/enums';
import { billDetail } from '@share/test/pre-setup/mock/data/bill';
import { product } from '@share/test/pre-setup/mock/data/product';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import messages from '@share/constants/messages';

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
const payload = {
  by: CHART_BY.DAY,
  time: Date.now(),
};

const billDetailList = billDetail.map((bill) => {
  return { ...bill, product: { name: product.name } };
});

const bills: any[] = [
  {
    bill_detail: billDetailList,
    created_at: Date.now().toString(),
  },
  {
    bill_detail: billDetailList,
    created_at: Date.now().toString(),
  },
];

beforeAll(async () => {
  const moduleRef = await startUp();
  productController = moduleRef.get(ProductController);
  productService = moduleRef.get(ProductService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('load data best selling product chart', () => {
  it('load data best selling products chart success', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const loadDataBestSellingProductsChartController = jest.spyOn(
      productController,
      'loadDataBestSellingProductsChart',
    );
    const loadDataBestSellingProductsChartService = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
    await expect(productController.loadDataBestSellingProductsChart(payload)).resolves.toEqual(expect.any(Array));
    expect((await loadDataBestSellingProductsChartController.mock.results[0].value).length).toBeGreaterThan(0);
    expect(loadDataBestSellingProductsChartController).toHaveBeenCalledTimes(1);
    expect(loadDataBestSellingProductsChartService).toHaveBeenCalledTimes(1);
    expect(loadDataBestSellingProductsChartService).toHaveBeenCalledWith(payload);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: expect.any(String),
          lt: expect.any(String),
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
    });
  });

  it('load data best selling products chart failed with invalid select', async () => {
    expect.hasAssertions();
    const payloadWithInvalidSelect = {
      ...payload,
      by: '',
    };
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const loadDataBestSellingProductsChartController = jest.spyOn(
      productController,
      'loadDataBestSellingProductsChart',
    );
    const loadDataBestSellingProductsChartService = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
    await expect(productController.loadDataBestSellingProductsChart(payloadWithInvalidSelect)).resolves.toEqual(
      expect.any(Array),
    );
    expect((await loadDataBestSellingProductsChartController.mock.results[0].value).length).toBe(0);
    expect(loadDataBestSellingProductsChartController).toHaveBeenCalledTimes(1);
    expect(loadDataBestSellingProductsChartService).toHaveBeenCalledTimes(1);
    expect(loadDataBestSellingProductsChartService).toHaveBeenCalledWith(payloadWithInvalidSelect);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('load data best selling products chart failed with unknown error', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(UnknownError);
    const loadDataBestSellingProductsChartController = jest.spyOn(
      productController,
      'loadDataBestSellingProductsChart',
    );
    const loadDataBestSellingProductsChartService = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
    await expect(productController.loadDataBestSellingProductsChart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(loadDataBestSellingProductsChartController).toHaveBeenCalledTimes(1);
    expect(loadDataBestSellingProductsChartService).toHaveBeenCalledTimes(1);
    expect(loadDataBestSellingProductsChartService).toHaveBeenCalledWith(payload);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: expect.any(String),
          lt: expect.any(String),
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
    });
  });

  it('load data best selling products chart failed with database disconnect error', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(PrismaDisconnectError);
    const loadDataBestSellingProductsChartController = jest.spyOn(
      productController,
      'loadDataBestSellingProductsChart',
    );
    const loadDataBestSellingProductsChartService = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
    await expect(productController.loadDataBestSellingProductsChart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(loadDataBestSellingProductsChartController).toHaveBeenCalledTimes(1);
    expect(loadDataBestSellingProductsChartService).toHaveBeenCalledTimes(1);
    expect(loadDataBestSellingProductsChartService).toHaveBeenCalledWith(payload);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: expect.any(String),
          lt: expect.any(String),
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
    });
  });
});
