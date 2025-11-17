import {
  Controller,
  Body,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { isPositive, isInt } from 'class-validator';
import IngredientService from './ingredient.service';
import { HandleHttpError, UploadImage } from '@share/decorators';
import { IdValidationPipe, ImageTransformPipe } from '@share/pipes';
import {
  IngredientCreate,
  ComputeProductPrice,
  IngredientSelect,
  IngredientPaginationSelect,
  IngredientUpdate,
  GetIngredient,
} from '@share/dto/validators/ingredient.dto';
import { IngredientList, Ingredient, PaginationIngredientSerializer } from '@share/dto/serializer/ingredient';
import { MessageSerializer } from '@share/dto/serializer/common';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
import LoggingService from '@share/libs/logging/logging.service';
import BaseController from '../controller';
import { IngredientRouter } from '@share/router';

@UseInterceptors(ClassSerializerInterceptor)
@Controller(IngredientRouter.BaseUrl)
export default class IngredientController extends BaseController {
  constructor(
    private readonly ingredientService: IngredientService,
    private readonly loggingService: LoggingService,
  ) {
    super(loggingService, 'ingredient');
  }

  @Post(IngredientRouter.relative.create)
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  @HandleHttpError
  createIngredient(
    @Body() ingredient: IngredientCreate,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    ingredient.avatar = file;
    const ingredientPlain = instanceToPlain(ingredient);
    return this.ingredientService
      .createIngredient(ingredientPlain)
      .pipe(map(() => MessageSerializer.create(messages.INGREDIENT.CREATE_INGREDIENT_SUCCESS)));
  }

  @Post(IngredientRouter.relative.computedProductPrice)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  computeProductPrice(@Body() productIngredient: ComputeProductPrice): Observable<number> {
    return this.ingredientService.computeProductPrice(productIngredient).pipe(
      map((result) => {
        const price = +result;
        if (isInt(price) && (isPositive(price) || price === 0)) {
          return result;
        } else {
          throw new BadRequestException(createMessage(messages.PRODUCT.PRICE_INVALID));
        }
      }),
    );
  }

  @Delete(IngredientRouter.relative.delete)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  deleteIngredient(@Param('id', new IdValidationPipe()) id: string): Observable<MessageSerializer> {
    return this.ingredientService
      .deleteIngredient(id)
      .pipe(map(() => MessageSerializer.create(messages.INGREDIENT.DELETE_INGREDIENT_SUCCESS)));
  }

  @Post(IngredientRouter.relative.all)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  getAllIngredients(@Body() select: IngredientSelect): Observable<Promise<Record<keyof typeof Ingredient, any>>> {
    select = IngredientSelect.plain(select);
    return this.ingredientService.getAllIngredients(instanceToPlain(plainToInstance(IngredientSelect, select))).pipe(
      map(async (ingredients) => {
        const ingredientList = new IngredientList(ingredients);
        return ingredientList.validate().then((errors) => {
          if (!errors.length) {
            const groups = ['units', 'unit'].reduce<string[]>((groups, key: keyof typeof select) => {
              if (select[key]) {
                groups.push(key);
              }
              return groups;
            }, []);
            return instanceToPlain(plainToInstance(Ingredient, ingredientList.List, { groups: ['unit'] }), { groups });
          } else {
            this.logError(errors, this.getAllIngredients.name);
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
        });
      }),
    );
  }

  @Post(IngredientRouter.relative.detail)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  getIngredient(@Body() select: GetIngredient): any {
    const query = instanceToPlain(plainToInstance(IngredientSelect, IngredientSelect.plain(select.query)));
    return this.ingredientService.getIngredient({ ...select, query }).pipe(
      map(async (ingredient) => {
        const ingredientInstance = new Ingredient(ingredient);
        return ingredientInstance.validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.getIngredient.name);
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          const groups = ['units', 'unit'].reduce<string[]>((groups, key: keyof typeof select.query) => {
            if (select.query[key]) {
              groups.push(key);
            }
            return groups;
          }, []);
          return instanceToPlain(plainToInstance(Ingredient, ingredient, { groups: ['unit'] }), { groups });
        });
      }),
    );
  }

  @Post(IngredientRouter.relative.pagination)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  pagination(@Body() select: IngredientPaginationSelect): Observable<any> {
    const query = instanceToPlain(plainToInstance(IngredientSelect, IngredientSelect.plain(select.query)));
    return this.ingredientService.pagination({ ...select, query }).pipe(
      map((result) => {
        const response = new PaginationIngredientSerializer(result);
        return response.validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.pagination.name);
            throw new BadRequestException(messages.COMMON.OUTPUT_VALIDATE);
          }
          const groups = ['units', 'unit'].reduce<string[]>((groups, key: keyof typeof select.query) => {
            if (select.query[key]) {
              groups.push(key);
            }
            return groups;
          }, []);
          return {
            total: response.total,
            list: instanceToPlain(response.list, {
              groups,
            }),
          };
        });
      }),
    );
  }

  @Put('update')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  @HandleHttpError
  updateIngredient(
    @Body() ingredient: IngredientUpdate,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    ingredient.avatar = file;
    const ingredientPlain = instanceToPlain(ingredient, { groups: ['update'] });
    return this.ingredientService
      .updateIngredient(ingredientPlain)
      .pipe(map(() => MessageSerializer.create(messages.INGREDIENT.UPDATE_INGREDIENT_SUCCESS)));
  }
}
