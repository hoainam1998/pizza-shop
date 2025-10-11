import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { createProductPattern, getProductPattern, paginationPattern } from '@share/pattern';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCT_SERVICE } from '@share/di-token';
import { product } from 'generated/prisma';
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

  getProduct(select: GetProduct): Observable<any> {
    return this.product.send<any>(getProductPattern, select);
  }
}
