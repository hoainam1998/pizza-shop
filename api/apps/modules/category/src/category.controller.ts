import { Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { Prisma } from 'generated/prisma';
import { CategoryService } from './category.service';
import { category } from 'generated/prisma';
import type { CategoryBody } from '@share/interfaces';
import { checkArrayHaveValues } from '@share/utils';
import {
  createCategoryPattern,
  paginationCategoryPattern,
  updateCategoryPattern,
  deleteCategoryPattern,
} from '@share/pattern';
import { SelectCategory } from '@share/validators/category.dto';
import { PRISMA_ERROR_CODE } from '@share/enums';
import messages from '@share/messages';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern(createCategoryPattern)
  createCategory(@Payload() data: CategoryBody): Promise<category> {
    return this.categoryService.create(data).catch((error: Error) => {
      throw new RpcException(error.message);
    });
  }

  @MessagePattern(paginationCategoryPattern)
  pagination(@Payload() select: SelectCategory) {
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
              list: [],
              total: 0,
            }),
          );
        }
        return {
          list,
          total,
        };
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
