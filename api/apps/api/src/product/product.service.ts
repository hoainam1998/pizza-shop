import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { product } from 'generated/prisma';
import { createProductPattern, getProductPattern, paginationPattern, updateProductPattern } from '@share/pattern';
import { PRODUCT_SERVICE } from '@share/di-token';
import { GetProduct, ProductSelect } from '@share/dto/validators/product.dto';
import { ProductPaginationResponse } from '@share/interfaces';

@Injectable()
export default class ProductService {
  constructor(@Inject(PRODUCT_SERVICE) private readonly product: ClientProxy) {}

  createProduct(product: product): Observable<product> {
    return this.product.send<product>(createProductPattern, product);
  }

  pagination(select: ProductSelect): Observable<ProductPaginationResponse> {
    return this.product.send<ProductPaginationResponse>(paginationPattern, select);
  }

  getProduct(select: GetProduct): Observable<product> {
    return this.product.send<product>(getProductPattern, select);
  }

  updateProduct(product: Record<string, any>): Observable<product> {
    return this.product.send<product>(updateProductPattern, product);
  }
}
