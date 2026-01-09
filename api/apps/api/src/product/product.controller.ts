import {
  BadRequestException,
  Controller,
  HttpStatus,
  HttpCode,
  Post,
  UseInterceptors,
  Body,
  Put,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { map, Observable } from 'rxjs';
import { product } from 'generated/prisma';
import { HandleHttpError, UploadImage } from '@share/decorators';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
  GetProduct,
  ProductCreate,
  ProductCreateTransform,
  ProductQuery,
  ProductPagination,
  ProductPaginationForSale,
  GetProductsInCart,
} from '@share/dto/validators/product.dto';
import { IdValidationPipe, ImageTransformPipe } from '@share/pipes';
import ProductService from './product.service';
import { MessageSerializer } from '@share/dto/serializer/common';
import messages from '@share/constants/messages';
import { PaginationProductSerializer, Products, ProductSerializer } from '@share/dto/serializer/product';
import LoggingService from '@share/libs/logging/logging.service';
import BaseController from '../controller';
import { ProductRouter } from '@share/router';
import { ProductPaginationResponse } from '@share/interfaces';
import { EventsGateway } from '@share/libs/socket/event-socket.gateway';
import { Throttle } from '@nestjs/throttler';
import { createMessage } from '@share/utils';

@Controller(ProductRouter.BaseUrl)
export default class ProductController extends BaseController {
  constructor(
    private readonly productService: ProductService,
    private readonly loggingService: LoggingService,
    private readonly socketEventGateway: EventsGateway,
  ) {
    super(loggingService, 'product');
  }

  @Post(ProductRouter.relative.create)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  @HandleHttpError
  createProduct(
    @Body() product: ProductCreate,
    @UploadImage('avatar', ImageTransformPipe) avatar: string,
  ): Observable<MessageSerializer> {
    product.avatar = avatar;
    const productCreate: product = plainToInstance(ProductCreateTransform, product, { groups: ['create'] });
    return this.productService
      .createProduct(productCreate)
      .pipe(map(() => MessageSerializer.create(messages.PRODUCT.CREATE_PRODUCT_SUCCESS)));
  }

  private handlePaginationObservable(
    observable: Observable<ProductPaginationResponse>,
    select: ProductPagination | ProductPaginationForSale,
  ): Observable<Promise<Record<string, any>>> {
    return observable.pipe(
      map((results) => {
        return new PaginationProductSerializer(results).validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.pagination.name);
            throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
          }
          const paginationResultSerializer = plainToInstance(PaginationProductSerializer, results);
          const groups = ['bought', 'disabled'].reduce((groups: string[], key: keyof typeof select.query) => {
            if (select.query[key]) {
              groups.push(key);
            }
            return groups;
          }, []);
          return instanceToPlain(paginationResultSerializer, { groups });
        });
      }),
    );
  }

  @Post(ProductRouter.relative.pagination)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  pagination(@Body() select: ProductPagination): Observable<Promise<Record<string, any>>> {
    const query = ProductQuery.plain(select.query) as any;
    return this.handlePaginationObservable(this.productService.pagination({ ...select, query }), select);
  }

  @Throttle({ default: { ttl: 500 } })
  @Post(ProductRouter.relative.paginationForSale)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  paginationForSale(
    @Req() req: Express.Request,
    @Body() select: ProductPaginationForSale,
  ): Observable<Promise<Record<string, any>>> {
    const query = ProductQuery.plain(select.query) as any;
    return this.handlePaginationObservable(
      this.productService.paginationForSale(req.session.user?.userId || '', {
        ...instanceToPlain(select, { exposeUnsetFields: true }),
        query,
      }),
      select,
    );
  }

  @Post(ProductRouter.relative.productsInCart)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  getProductsInCart(
    @Req() req: Express.Request,
    @Body() select: GetProductsInCart,
  ): Observable<Promise<Record<string, any>>> {
    select.query = ProductQuery.plain(select.query) as any;
    return this.productService.getProductsInCart(req.session.user?.userId || '', select).pipe(
      map((products) => {
        const productsInstance = new Products(products);
        return productsInstance.validate().then((errors) => {
          if (!errors.length) {
            return instanceToPlain(productsInstance.List);
          }
          this.logError(errors, this.getProductsInCart.name);
          throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
        });
      }),
    );
  }

  @Post(ProductRouter.relative.detail)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  getProduct(@Body() select: GetProduct): Observable<Promise<Record<string, any>>> {
    select.query = ProductQuery.plain(select.query) as any;
    return this.productService.getProduct(select).pipe(
      map((product) => {
        return new ProductSerializer(product).validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.getProduct.name);
            throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
          }
          return instanceToPlain(plainToInstance(ProductSerializer, product));
        });
      }),
    );
  }

  @Put(ProductRouter.relative.update)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  @HandleHttpError
  updateProduct(
    @Body() product: ProductCreate,
    @UploadImage('avatar', ImageTransformPipe) avatar: string,
  ): Observable<MessageSerializer> {
    product.avatar = avatar;
    const productUpdate = instanceToPlain(plainToInstance(ProductCreateTransform, product));
    return this.productService.updateProduct(productUpdate).pipe(
      map((userIds) => {
        userIds.forEach((userId) => {
          this.socketEventGateway.refreshCurrentInfo(userId);
        });
        return MessageSerializer.create(messages.PRODUCT.UPDATE_PRODUCT_SUCCESS);
      }),
    );
  }

  @Delete(ProductRouter.relative.delete)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  deleteProduct(@Param('id', new IdValidationPipe()) productId: string): Observable<MessageSerializer> {
    return this.productService
      .deleteProduct(productId)
      .pipe(map(() => MessageSerializer.create(messages.PRODUCT.DELETE_PRODUCT_SUCCESS)));
  }
}
