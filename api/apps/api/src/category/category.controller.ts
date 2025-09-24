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
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { catchError, map, Observable } from 'rxjs';
import CategoryService from './category.service';
import { MessageSerializer } from '@share/dto/serializer/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageTransformPipe } from '@share/pipes';
import { UploadImage } from '@share/decorators';
import {
  CategoryDto,
  CategorySelect,
  CreateCategoryDto,
  GetCategory,
  PaginationCategory,
} from '@share/dto/validators/category.dto';
import { FindOneParam } from '@share/dto/validators/common.dto';
import { CategoryPaginationFormatter, CategoryDetailSerializer, Categories } from '@share/dto/serializer/category';
import { CategoryBody, MicroservicesErrorResponse } from '@share/interfaces';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
import { category } from 'generated/prisma';

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

  @Post('all')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryDetailSerializer })
  getAllCategories(@Body() select: CategorySelect): Observable<Promise<category[]>> {
    return this.categoryService.getAllCategories(select).pipe(
      map((categories) => {
        const categoriesObj = new Categories(categories);
        return validate(categoriesObj).then((errors) => {
          if (!errors.length) {
            return categoriesObj.List;
          }
          throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
        });
      }),
    );
  }

  @Post('pagination')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryPaginationFormatter })
  pagination(@Body() select: PaginationCategory): Observable<Promise<CategoryPaginationFormatter>> {
    return this.categoryService.pagination(select).pipe(
      map((response: CategoryPaginationFormatter) => {
        const paginationResult = new CategoryPaginationFormatter(response);
        return validate(paginationResult).then((errors) => {
          if (!errors.length) {
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          return paginationResult;
        });
      }),
      catchError((error: MicroservicesErrorResponse) => {
        if (error.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(error);
        }
        throw new BadRequestException(createMessage(error.message!));
      }),
    );
  }

  @Post('detail')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryDto })
  getCategory(@Body() category: GetCategory): Observable<Promise<Omit<CategoryDto, 'categoryId'>>> {
    return this.categoryService.getCategory(category).pipe(
      map((response: CategoryDetailSerializer) => {
        return validate(new CategoryDetailSerializer(response)).then((error) => {
          if (error.length) {
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          return response;
        });
      }),
      catchError((error: MicroservicesErrorResponse) => {
        if (error.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(error);
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
