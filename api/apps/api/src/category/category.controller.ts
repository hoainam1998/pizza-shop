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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
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
import { CategoryPaginationFormatter, CategoryDetailSerializer, Categories } from '@share/dto/serializer/category';
import messages from '@share/constants/messages';
import { createMessage, handleValidateException } from '@share/utils';
import { category } from 'generated/prisma';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (exceptions: ValidationError[]) => {
      const errors = handleValidateException(exceptions);
      throw new BadRequestException({ messages: errors });
    },
  }),
)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('category')
export default class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  @UsePipes(new ValidationPipe({ transform: true }))
  @HandleHttpError
  create(
    @Body() category: CreateCategory,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    const categoryInsert: any = Object.assign(instanceToPlain(category), { avatar: file });
    return this.categoryService
      .createCategory(categoryInsert)
      .pipe(map(() => MessageSerializer.create(messages.CATEGORY.ADD_CATEGORY_SUCCESS)));
  }

  @Post('all')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryDetailSerializer })
  @HandleHttpError
  getAllCategories(@Body() select: CategoryQuery): Observable<Promise<category[]>> {
    select = CategoryQuery.plainWithIncludeId(select) as any;
    return this.categoryService.getAllCategories(select).pipe(
      map((categories) => {
        const categoriesObj = new Categories(categories);
        return validate(categoriesObj).then((errors) => {
          if (!errors.length) {
            return plainToInstance(CategoryDetailSerializer, categoriesObj.List);
          }
          throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
        });
      }),
    );
  }

  @Post('pagination')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryPaginationFormatter })
  @HandleHttpError
  pagination(@Body() select: PaginationCategory): Observable<Promise<CategoryPaginationFormatter>> {
    const query = CategoryQuery.plainWithIncludeId(select.query);
    select.query = query as any;
    return this.categoryService.pagination(select).pipe(
      map((response: CategoryPaginationFormatter) => {
        const paginationResult = new CategoryPaginationFormatter(response);
        return validate(paginationResult).then((errors) => {
          if (errors.length) {
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          return paginationResult;
        });
      }),
    );
  }

  @Post('detail')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: CategoryDetailSerializer })
  @HandleHttpError
  getCategory(@Body() category: GetCategory): Observable<Promise<Omit<CategoryDto, 'categoryId'>>> {
    return this.categoryService.getCategory(category).pipe(
      map((response: CategoryDetailSerializer) => {
        return validate(new CategoryDetailSerializer(response)).then((errors) => {
          if (errors.length) {
            throw new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE));
          }
          return plainToInstance(CategoryDetailSerializer, response);
        });
      }),
    );
  }

  @Put('update')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  @HandleHttpError
  update(
    @Body() category: CreateCategory,
    @UploadImage('avatar', ImageTransformPipe) file: string,
  ): Observable<MessageSerializer> {
    const categoryInsert: any = Object.assign(instanceToPlain(category), {
      avatar: file,
    });
    return this.categoryService
      .updateCategory(categoryInsert)
      .pipe(map(() => MessageSerializer.create(messages.CATEGORY.UPDATE_CATEGORY_SUCCESS)));
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @HandleHttpError
  delete(@Param('id', new IdValidationPipe()) id: string): Observable<MessageSerializer> {
    return this.categoryService
      .deleteCategory(id)
      .pipe(map(() => MessageSerializer.create(messages.CATEGORY.DELETE_CATEGORY_SUCCESS)));
  }
}
