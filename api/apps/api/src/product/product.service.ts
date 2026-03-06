import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { product } from 'generated/prisma';
import {
  createProductPattern,
  getProductPattern,
  paginationPattern,
  paginationForSalePattern,
  getProductsInCartPattern,
  updateProductPattern,
  deleteProductPattern,
  paymentPattern,
  validateProductsInCartPattern,
  loadDataBestSellingProductsChartPattern,
  loadDataRevenueChartPattern,
  loadDataPurchaseVolumeChartPattern,
} from '@share/pattern';
import { PRODUCT_SERVICE } from '@share/di-token';
import { GetProduct, ProductPagination, Carts, ChartRequestPayload } from '@share/dto/validators/product.dto';
import {
  BillErrors,
  BestSellingProductDataChartItem,
  RevenueDataChart,
  PurchaseVolumeDataChart,
} from '@share/dto/serializer/product';
import { ProductPaginationResponse } from '@share/interfaces';

@Injectable()
export default class ProductService {
  constructor(@Inject(PRODUCT_SERVICE) private readonly product: ClientProxy) {}

  createProduct(product: product): Observable<product> {
    return this.product.send<product>(createProductPattern, product);
  }

  pagination(select: ProductPagination): Observable<ProductPaginationResponse> {
    return this.product.send<ProductPaginationResponse>(paginationPattern, select);
  }

  paginationForSale(userId: string, select: Record<string, any>): Observable<ProductPaginationResponse> {
    return this.product.send<ProductPaginationResponse>(paginationForSalePattern, { userId, select });
  }

  getProductsInCart(userId: string, select: Record<string, any>): Observable<product[]> {
    return this.product.send<product[]>(getProductsInCartPattern, { userId, select });
  }

  getProduct(select: GetProduct): Observable<product> {
    return this.product.send<product>(getProductPattern, select);
  }

  updateProduct(product: Record<string, any>): Observable<product> {
    return this.product.send<product>(updateProductPattern, product);
  }

  deleteProduct(productId: string): Observable<product> {
    return this.product.send<product>(deleteProductPattern, productId);
  }

  validateProductsInCart(carts: Carts): Observable<Omit<BillErrors, 'validate'>> {
    return this.product.send<Omit<BillErrors, 'validate'>>(validateProductsInCartPattern, carts);
  }

  payment(userId: string, carts: Carts): Observable<Omit<BillErrors, 'validate'>> {
    return this.product.send<Omit<BillErrors, 'validate'>>(paymentPattern, { userId, bill: carts });
  }

  loadDataBestSellingProductsChart(payload: ChartRequestPayload): Observable<BestSellingProductDataChartItem[]> {
    return this.product.send(loadDataBestSellingProductsChartPattern, payload);
  }

  loadDataRevenueChart(payload: ChartRequestPayload): Observable<Omit<RevenueDataChart, 'validate'>> {
    return this.product.send(loadDataRevenueChartPattern, payload);
  }

  loadDataPurchaseVolumeChart(): Observable<Omit<PurchaseVolumeDataChart, 'validate'>> {
    return this.product.send(loadDataPurchaseVolumeChartPattern, {});
  }
}
