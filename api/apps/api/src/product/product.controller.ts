import {
  Body,
  UsePipes,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { catchError, map, Observable } from 'rxjs';
import { validate } from 'class-validator';
import { product } from 'generated/prisma';
import { UploadImage } from '@share/decorators';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
  ProductCreate,
  ProductCreateTransform,
  ProductQueryTransform,
  ProductSelect,
} from '@share/dto/validators/product.dto';
import { ImageTransformPipe } from '@share/pipes';
import ProductService from './product.service';
import { MessageSerializer } from '@share/dto/serializer/common';
import messages from '@share/constants/messages';
import { PaginationProductSerializer } from '@share/dto/serializer/product';

@Controller('product')
export default class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('avatar'))
  createProduct(
    @Body() product: ProductCreate,
    @UploadImage('avatar', ImageTransformPipe) avatar: string,
  ): Observable<MessageSerializer> {
    product.avatar = avatar;
    const productCreate: product = plainToInstance(ProductCreateTransform, product);
    return this.productService.createProduct(productCreate).pipe(
      map(() => MessageSerializer.create(messages.PRODUCT.CREATE_PRODUCT_SUCCESS)),
      catchError((error) => {
        throw new BadRequestException(error);
      }),
    );
  }

  @Post('pagination')
  @HttpCode(HttpStatus.OK)
  pagination(@Body() select: ProductSelect): Observable<Promise<Record<string, any>>> {
    const query = plainToInstance(ProductQueryTransform, select.query);
    select.query = query;
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
      catchError((error) => {
        if (error.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(error);
        }
        throw new BadRequestException(error);
      }),
    );
  }
}
