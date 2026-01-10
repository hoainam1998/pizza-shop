import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import CategoryService from './category.service';
import { MessageSerializer } from '@share/dto/serializer/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdValidationPipe, ImageTransformPipe } from '@share/pipes';
import { HandleHttpError, UploadImage } from '@share/decorators';
import {
  CategoryDto,
  CategoryQuery,
  CreateCategory,
  GetCategory,
  PaginationCategory,
} from '@share/dto/validators/category.dto';
import { CategoryPaginationSerializer, CategoryDetailSerializer, Categories } from '@share/dto/serializer/category';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
import { category } from 'generated/prisma';
import BaseController from '../controller';
import LoggingService from '@share/libs/logging/logging.service';
import { CategoryRouter } from '@share/router';

@UseInterceptors(ClassSerializerInterceptor)
@Controller(CategoryRouter.BaseUrl)
export default class CategoryController extends BaseController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly loggingService: LoggingService,
  ) {
    super(loggingService, 'category');
  }

  @Post(CategoryRouter.relative.create)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  @HandleHttpError
  create(
    @Body() category: CreateCategory,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    category.avatar = file;
    const categoryInsert: Record<string, any> = instanceToPlain(plainToInstance(CreateCategory, category));
    return this.categoryService
      .createCategory(categoryInsert)
      .pipe(map(() => MessageSerializer.create(messages.CATEGORY.ADD_CATEGORY_SUCCESS)));
  }

  @Post(CategoryRouter.relative.all)
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryDetailSerializer })
  @HandleHttpError
  getAllCategories(@Body() select: CategoryQuery): Observable<Promise<Record<string, any>>> {
    select = CategoryQuery.plainWithIncludeId(select) as any;
    return this.categoryService.getAllCategories(select).pipe(
      map((categories) => {
        const categoriesInstance = new Categories(categories);
        return categoriesInstance.validate().then((errors) => {
          if (!errors.length) {
            return categoriesInstance.List;
          }
          this.logError(errors, this.getAllCategories.name);
          throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
        });
      }),
    );
  }

  @Post(CategoryRouter.relative.filterValidCategories)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  filterValidCategories(@Body() select: CategoryQuery): Observable<Promise<category[]>> {
    select = CategoryQuery.plainWithIncludeId(select) as any;
    return this.categoryService.filterValidCategories(select).pipe(
      map((categories) => {
        const categoriesObj = new Categories(categories);
        return categoriesObj.validate().then((errors) => {
          if (!errors.length) {
            return plainToInstance(CategoryDetailSerializer, categoriesObj.List);
          }
          this.logError(errors, this.filterValidCategories.name);
          throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
        });
      }),
    );
  }

  @Post(CategoryRouter.relative.pagination)
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryPaginationSerializer })
  @HandleHttpError
  pagination(@Body() select: PaginationCategory): Observable<Promise<CategoryPaginationSerializer>> {
    select.query = CategoryQuery.plainWithIncludeId(select.query) as any;
    return this.categoryService.pagination(select).pipe(
      map((response: CategoryPaginationSerializer) => {
        const paginationResult = new CategoryPaginationSerializer(response);
        return paginationResult.validate().then((errors) => {
          if (errors.length) {
            this.logError(errors, this.pagination.name);
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          return paginationResult;
        });
      }),
    );
  }

  @Post(CategoryRouter.relative.detail)
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryDetailSerializer })
  @HandleHttpError
  getCategory(@Body() category: GetCategory): Observable<Promise<Omit<CategoryDto, 'categoryId'>>> {
    category.query = CategoryQuery.plainWithExcludeId(category.query) as any;
    return this.categoryService.getCategory(category).pipe(
      map((response: CategoryDetailSerializer) => {
        return new CategoryDetailSerializer(response).validate().then((errors) => {
          if (errors.length) {
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          return plainToInstance(CategoryDetailSerializer, response);
        });
      }),
    );
  }

  @Put(CategoryRouter.relative.update)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  @HandleHttpError
  update(
    @Body() category: CreateCategory,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    category.avatar = file;
    const categoryInsert: Record<string, any> = instanceToPlain(category);
    return this.categoryService
      .updateCategory(categoryInsert)
      .pipe(map(() => MessageSerializer.create(messages.CATEGORY.UPDATE_CATEGORY_SUCCESS)));
  }

  @Delete(CategoryRouter.relative.delete)
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  delete(@Param('id', new IdValidationPipe()) id: string): Observable<MessageSerializer> {
    return this.categoryService
      .deleteCategory(id)
      .pipe(map(() => MessageSerializer.create(messages.CATEGORY.DELETE_CATEGORY_SUCCESS)));
  }
}
