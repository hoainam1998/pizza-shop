import {
  BadRequestException,
  Controller,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UsePipes,
  Post,
  UseInterceptors,
  Body,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { map, Observable } from 'rxjs';
import { validate, ValidationError } from 'class-validator';
import { product } from 'generated/prisma';
import { HandleHttpError, UploadImage } from '@share/decorators';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
  GetProduct,
  ProductCreate,
  ProductCreateTransform,
  ProductQuery,
  ProductSelect,
} from '@share/dto/validators/product.dto';
import { IdValidationPipe, ImageTransformPipe } from '@share/pipes';
import ProductService from './product.service';
import { MessageSerializer } from '@share/dto/serializer/common';
import messages from '@share/constants/messages';
import { PaginationProductSerializer, ProductSerializer } from '@share/dto/serializer/product';
import { handleValidateException } from '@share/utils';
import LoggingService from '@share/libs/logging/logging.service';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (exceptions: ValidationError[]) => {
      const errors = handleValidateException(exceptions);
      throw new BadRequestException({ messages: errors });
    },
  }),
)
@Controller('product')
export default class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly loggingService: LoggingService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
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

  @Post('pagination')
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  pagination(@Body() select: ProductSelect): Observable<Promise<Record<string, any>>> {
    select.query = ProductQuery.plain(select.query) as any;
    return this.productService.pagination(select).pipe(
      map((results) => {
        const response = new PaginationProductSerializer(results);
        return validate(response).then((errors) => {
          if (errors.length) {
            throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
          }
          const paginationResultSerializer = plainToInstance(PaginationProductSerializer, results);
          return instanceToPlain(paginationResultSerializer);
        });
      }),
    );
  }

  @Post('detail')
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  getProduct(@Body() select: GetProduct): Observable<Promise<Record<string, any>>> {
    select.query = ProductQuery.plain(select.query) as any;
    return this.productService.getProduct(select).pipe(
      map((product) => {
        const response = new ProductSerializer(product);
        return validate(response).then((errors) => {
          if (errors.length) {
            throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
          }
          return instanceToPlain(plainToInstance(ProductSerializer, product));
        });
      }),
    );
  }

  @Put('update')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('avatar'))
  @HandleHttpError
  updateProduct(
    @Body() product: ProductCreate,
    @UploadImage('avatar', ImageTransformPipe) avatar: string,
  ): Observable<MessageSerializer> {
    product.avatar = avatar;
    const productUpdate = instanceToPlain(plainToInstance(ProductCreateTransform, product));
    return this.productService
      .updateProduct(productUpdate)
      .pipe(map(() => MessageSerializer.create(messages.PRODUCT.UPDATE_PRODUCT_SUCCESS)));
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  deleteProduct(@Param('id', new IdValidationPipe()) productId: string): Observable<MessageSerializer> {
    return this.productService
      .deleteProduct(productId)
      .pipe(map(() => MessageSerializer.create(messages.PRODUCT.DELETE_PRODUCT_SUCCESS)));
  }
}
