import { Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { category } from 'generated/prisma';
import CategoryService from './category.service';
import type { CategoryBodyType, CategoryPaginationResponse } from '@share/interfaces';
import { checkArrayHaveValues } from '@share/utils';
import {
  createCategoryPattern,
  paginationPattern,
  updateCategoryPattern,
  deleteCategoryPattern,
  getCategoryPattern,
  getAllCategoriesPattern,
  filterValidCategoriesPattern,
} from '@share/pattern';
import { CategoryDto, CategoryQuery, GetCategory, PaginationCategory } from '@share/dto/validators/category.dto';
import LoggingService from '@share/libs/logging/logging.service';
import HandleServiceError from '@share/decorators/handle-service-error.decorator';

@Controller()
export default class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly logger: LoggingService,
  ) {}

  @MessagePattern(createCategoryPattern)
  @HandleServiceError
  createCategory(@Payload() data: CategoryBodyType): Promise<category> {
    return this.categoryService.create(data);
  }

  @MessagePattern(getAllCategoriesPattern)
  @HandleServiceError
  getAllCategories(@Payload() select: CategoryQuery): Promise<Partial<category>[]> {
    return this.categoryService.getAllCategories(select).then((categories) => {
      if (!checkArrayHaveValues(categories)) {
        throw new NotFoundException([]);
      }
      return categories;
    });
  }

  @MessagePattern(filterValidCategoriesPattern)
  @HandleServiceError
  filterValidCategories(@Payload() select: CategoryQuery): Promise<Partial<category>[]> {
    return this.categoryService.filterValidCategories(select).then((categories) => {
      if (!checkArrayHaveValues(categories)) {
        throw new NotFoundException([]);
      }
      return categories;
    });
  }

  @MessagePattern(paginationPattern)
  @HandleServiceError
  pagination(@Payload() select: PaginationCategory): Promise<CategoryPaginationResponse> {
    return this.categoryService.pagination(select).then((response) => {
      const [list, total] = response;
      if (!checkArrayHaveValues(list as CategoryBodyType[])) {
        throw new NotFoundException({
          list: [],
          total: 0,
        });
      }
      return {
        list: list as CategoryBodyType[],
        total: total as number,
      } satisfies CategoryPaginationResponse;
    });
  }

  @MessagePattern(updateCategoryPattern)
  @HandleServiceError
  updateCategory(@Payload() data: CategoryBodyType): Promise<category> {
    return this.categoryService.update(data);
  }

  @MessagePattern(getCategoryPattern)
  @HandleServiceError
  getCategory(@Payload() category: GetCategory): Promise<Omit<CategoryDto, 'categoryId'>> {
    return this.categoryService.getDetail(category);
  }

  @MessagePattern(deleteCategoryPattern)
  @HandleServiceError
  deleteCategory(@Payload() categoryId: string): Promise<category> {
    return this.categoryService.delete(categoryId);
  }
}
