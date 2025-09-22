import { Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { Prisma } from 'generated/prisma';
import CategoryService from './category.service';
import { category } from 'generated/prisma';
import type { CategoryBody, CategoryPaginationResponse } from '@share/interfaces';
import { checkArrayHaveValues } from '@share/utils';
import {
  createCategoryPattern,
  paginationCategoryPattern,
  updateCategoryPattern,
  deleteCategoryPattern,
  getCategoryPattern,
  getAllCategories,
} from '@share/pattern';
import { CategoryDto, CategorySelect, GetCategory, PaginationCategory } from '@share/dto/validators/category.dto';
import { PRISMA_ERROR_CODE } from '@share/enums';
import messages from '@share/constants/messages';

@Controller()
export default class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern(createCategoryPattern)
  createCategory(@Payload() data: CategoryBody): Promise<category> {
    return this.categoryService.create(data).catch((error: Error) => {
      throw new RpcException(error.message);
    });
  }

  @MessagePattern(getAllCategories)
  getAllCategories(@Payload() select: CategorySelect): Promise<Partial<category>[]> {
    return this.categoryService
      .getAllCategories(select)
      .then((categories) => {
        if (!checkArrayHaveValues(categories)) {
          throw new RpcException(
            new NotFoundException({
              message: [],
            }),
          );
        }
        return categories;
      })
      .catch((error: Error) => {
        throw new RpcException(error.message);
      });
  }

  @MessagePattern(paginationCategoryPattern)
  pagination(@Payload() select: PaginationCategory): Promise<CategoryPaginationResponse> {
    return this.categoryService
      .pagination(select)
      .catch((error: Error) => {
        throw new RpcException(error.message);
      })
      .then((response) => {
        const [list, total] = response;
        if (!checkArrayHaveValues(list as CategoryBody[])) {
          throw new RpcException(
            new NotFoundException({
              message: {
                list: [],
                total: 0,
              },
            }),
          );
        }
        return {
          list: list as CategoryBody[],
          total: total as number,
        } satisfies CategoryPaginationResponse;
      });
  }

  @MessagePattern(updateCategoryPattern)
  updateCategory(@Payload() data: CategoryBody): Promise<category> {
    return this.categoryService.update(data).catch((error: Error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODE.NOT_FOUND) {
          throw new RpcException(new NotFoundException(messages.CATEGORY.NOT_FOUND));
        }
      }
      throw new RpcException(error.message);
    });
  }

  @MessagePattern(getCategoryPattern)
  getCategory(@Payload() category: GetCategory): Promise<Omit<CategoryDto, 'categoryId'>> {
    return this.categoryService.getDetail(category).catch((error: Error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODE.NOT_FOUND) {
          throw new RpcException(new NotFoundException(messages.CATEGORY.NOT_FOUND));
        }
      }
      throw new RpcException(error.message);
    });
  }

  @MessagePattern(deleteCategoryPattern)
  deleteCategory(@Payload() categoryId: string): Promise<category> {
    return this.categoryService.delete(categoryId).catch((error: Error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODE.NOT_FOUND) {
          throw new RpcException(new NotFoundException(messages.CATEGORY.NOT_FOUND));
        }
      }
      throw new RpcException(error.message);
    });
  }
}
