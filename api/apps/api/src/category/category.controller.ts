import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { catchError, map, Observable } from 'rxjs';
import CategoryService from './category.service';
import { MessageSerializer } from '@share/dto/serializer/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageTransformPipe } from '@share/pipes';
import { UploadImage } from '@share/decorators';
import { CategoryDto, CreateCategoryDto, GetCategory, PaginationCategory } from '@share/dto/validators/category.dto';
import { FindOneParam } from '@share/dto/validators/common.dto';
import {
  CategoryPaginationSerializer,
  CategoryPaginationFormatter,
  CategoryDetailSerializer,
} from '@share/dto/serializer/category';
import { CategoryBody, CategoryPaginationResponse, MicroservicesErrorResponse } from '@share/interfaces';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('category')
export default class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @Body() category: CreateCategoryDto,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    const categoryInsert: CategoryBody = Object.assign(category, { avatar: file });
    return this.categoryService.createCategory(categoryInsert).pipe(
      map(() => MessageSerializer.create(messages.CATEGORY.ADD_CATEGORY_SUCCESS)),
      catchError((error: Error) => {
        throw new BadRequestException(createMessage(error.message));
      }),
    );
  }

  @Post('pagination')
  @HttpCode(HttpStatus.OK)
  pagination(@Body() select: PaginationCategory): Observable<Promise<CategoryPaginationFormatter>> {
    return this.categoryService.pagination(select).pipe(
      map((response: CategoryPaginationResponse) => {
        return validate(new CategoryPaginationSerializer(response)).then((result) => {
          if (!result) {
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          return plainToInstance(CategoryPaginationFormatter, response);
        });
      }),
      catchError((error: MicroservicesErrorResponse) => {
        if (error.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(error.response);
        }
        throw new BadRequestException(createMessage(error.message!));
      }),
    );
  }

  @Post('detail')
  @HttpCode(HttpStatus.OK)
  getCategory(@Body() category: GetCategory): Observable<Promise<Omit<CategoryDto, 'categoryId'>>> {
    return this.categoryService.getCategory(category).pipe(
      map((response: Omit<CategoryDto, 'categoryId'>) => {
        return validate(new CategoryDetailSerializer(response)).then((result) => {
          if (!result) {
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          return response;
        });
      }),
      catchError((error: MicroservicesErrorResponse) => {
        if (error.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(error.response);
        }
        throw new BadRequestException(createMessage(error.message!));
      }),
    );
  }

  @Put('update')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Body() category: CreateCategoryDto,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    const categoryInsert: CategoryBody = Object.assign(category, { avatar: file, category_id: category.categoryId });
    return this.categoryService.updateCategory(categoryInsert).pipe(
      map(() => MessageSerializer.create(messages.CATEGORY.UPDATE_CATEGORY_SUCCESS)),
      catchError((error: Error) => {
        throw new BadRequestException(createMessage(error.message));
      }),
    );
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  delete(@Param() param: FindOneParam): Observable<MessageSerializer> {
    return this.categoryService.deleteCategory(param.id).pipe(
      map(() => MessageSerializer.create(messages.CATEGORY.DELETE_CATEGORY_SUCCESS)),
      catchError((error: Error) => {
        throw new BadRequestException(createMessage(error.message));
      }),
    );
  }
}
