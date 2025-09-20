import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  UsePipes,
  ClassSerializerInterceptor,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ingredient } from 'generated/prisma';
import IngredientService from './ingredient.service';
import { UploadImage } from '@share/decorators';
import { ImageTransformPipe } from '@share/pipes';
import { IngredientCreate, ComputeProductPrice, IngredientSelect } from '@share/dto/validators/ingredient.dto';
import { PriceProduct, IngredientList, Ingredient } from '@share/dto/serializer/ingredient';
import { MessageSerializer } from '@share/dto/serializer/common';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
import { MicroservicesErrorResponse } from '@share/interfaces';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('ingredient')
export default class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('avatar'))
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.CREATED)
  createIngredient(
    @Body() ingredient: IngredientCreate,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    return this.ingredientService
      .createIngredient(
        Object.assign(instanceToPlain(ingredient, { excludePrefixes: ['expiredTime'] }), {
          avatar: file,
        }) as ingredient,
      )
      .pipe(
        map(() => MessageSerializer.create(messages.INGREDIENT.CREATE_INGREDIENT_SUCCESS)),
        catchError((error: MicroservicesErrorResponse) => {
          throw new BadRequestException(createMessage(error.message!));
        }),
      );
  }

  @Post('compute-product-price')
  @HttpCode(HttpStatus.OK)
  computeProductPrice(@Body() productIngredient: ComputeProductPrice): Observable<Promise<number>> {
    return this.ingredientService.computeProductPrice(productIngredient).pipe(
      map((result) => {
        const productPrice = new PriceProduct(result);
        return validate(productPrice).then((errors) => {
          if (!errors.length) {
            return productPrice.Price;
          }
          throw new BadRequestException(createMessage(messages.PRODUCT.PRICE_INVALID));
        });
      }),
      catchError((error: MicroservicesErrorResponse) => {
        throw new BadRequestException(createMessage(error.message!));
      }),
    );
  }

  @Post('all')
  @HttpCode(HttpStatus.OK)
  getAll(@Body() select: IngredientSelect): Observable<Promise<any>> {
    const selectObject = { ...select };
    if (select.units) {
      Object.assign(selectObject, { unit: true });
    }

    return this.ingredientService
      .getAll(plainToInstance(IngredientSelect, selectObject, { excludePrefixes: ['units'] }))
      .pipe(
        map(async (ingredients) => {
          const ingredientList = new IngredientList(ingredients);
          return validate(ingredientList).then((errors) => {
            if (!errors.length) {
              const options = select.units ? { groups: ['units'] } : { groups: [] };
              if (select.unit) {
                Object.assign(options, { groups: [...options.groups, 'unit'] });
              }
              return instanceToPlain(plainToInstance(Ingredient, ingredientList.List, { groups: ['unit'] }), options);
            } else {
              throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
            }
          });
        }),
        catchError((error: MicroservicesErrorResponse) => {
          if (error.status === HttpStatus.NOT_FOUND) {
            throw new NotFoundException(error.response);
          } else {
            throw new BadRequestException(createMessage(error.message!));
          }
        }),
      );
  }
}
