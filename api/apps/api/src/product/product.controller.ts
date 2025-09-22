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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { catchError, map } from 'rxjs';
import { UploadImage } from '@share/decorators';
import { plainToInstance } from 'class-transformer';
import { ProductCreate, ProductCreateTransform } from '@share/dto/validators/product.dto';
import { ImageTransformPipe } from '@share/pipes';
import { product } from 'generated/prisma';
import ProductService from './product.service';
import { MessageSerializer } from '@share/dto/serializer/common';
import messages from '@share/constants/messages';

@Controller('product')
export default class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('avatar'))
  createProduct(@Body() product: ProductCreate, @UploadImage('avatar', ImageTransformPipe) avatar: string) {
    product.avatar = avatar;
    const productCreate: product = plainToInstance(ProductCreateTransform, product);
    return this.productService.createProduct(productCreate).pipe(
      map(() => MessageSerializer.create(messages.PRODUCT.CREATE_PRODUCT_SUCCESS)),
      catchError((error) => {
        throw new BadRequestException(error);
      }),
    );
  }
}
