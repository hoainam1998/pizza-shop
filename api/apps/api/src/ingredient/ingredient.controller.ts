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
} from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import { ingredient } from 'generated/prisma';
import IngredientService from './ingredient.service';
import { UploadImage } from '@share/decorators';
import { ImageTransformPipe } from '@share/pipes';
import { IngredientCreate } from '@share/dto/validators/ingredient.dto';
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
}
