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
} from '@share/pattern';
import { PRODUCT_SERVICE } from '@share/di-token';
import { GetProduct, ProductPagination } from '@share/dto/validators/product.dto';
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

  updateProduct(product: Record<string, any>): Observable<string[]> {
    return this.product.send<string[]>(updateProductPattern, product);
  }

  deleteProduct(productId: string): Observable<product> {
    return this.product.send<product>(deleteProductPattern, productId);
  }
}
