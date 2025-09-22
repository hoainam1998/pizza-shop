import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { createProductPattern } from '@share/pattern';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCT_SERVICE } from '@share/di-token';
import { product } from 'generated/prisma';

@Injectable()
export default class ProductService {
  constructor(@Inject(PRODUCT_SERVICE) private readonly product: ClientProxy) {}

  createProduct(product: product): Observable<product> {
    return this.product.send<product>(createProductPattern, product);
  }
}
