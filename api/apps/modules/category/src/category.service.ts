import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '@share/di-token';
import { category, PrismaClient } from 'generated/prisma';
import type { CategoryBodyType, CategoryPaginationPrismaResponse } from '@share/interfaces';
import { PaginationCategory, GetCategory, CategoryDto, CategorySelect } from '@share/dto/validators/category.dto';
import CategoryCachingService from '@share/libs/caching/category/category.service';
import { calcSkip } from '@share/utils';
import { HandlePrismaError } from '@share/decorators';
import messages from '@share/constants/messages';

/**
 * Select category field.
 * @param {CategorySelect} select - The category select.
 * @param {category[]} categories - The category list.
 * @returns {Partial<category>[]} - A object select category field.
 */
const selectCategory = (select: CategorySelect, categories: category[]): Partial<category>[] => {
  return categories.map((category) =>
    Object.entries(select).reduce<Partial<category>>((obj, [key, value]: [keyof category, any]) => {
      if (value) {
        obj[key] = category[key];
      }
      return obj;
    }, {}),
  );
};

@Injectable()
export default class CategoryService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient,
    private readonly categoryCachingService: CategoryCachingService,
  ) {}

  @HandlePrismaError(messages.CATEGORY)
  create(categoryBody: CategoryBodyType): Promise<category> {
    return this.prismaClient.category
      .create({
        data: {
          ...categoryBody,
          category_id: Date.now().toString(),
        },
      })
      .then(async (result) => {
        await this.storeCacheCategories();
        return result;
      });
  }

  @HandlePrismaError(messages.CATEGORY)
  getDetail(category: GetCategory): Promise<Omit<CategoryDto, 'categoryId'>> {
    return this.prismaClient.category.findFirstOrThrow({
      where: {
        category_id: category.categoryId,
      },
      select: category.query,
    });
  }

  private async storeCacheCategories(): Promise<category[]> {
    const categories = await this.prismaClient.category.findMany();
    await this.categoryCachingService.storeAllCategories(categories);
    return categories;
  }

  @HandlePrismaError(messages.CATEGORY)
  async getAllCategories(select: CategorySelect): Promise<Partial<category>[]> {
    let categories: category[] = [];
    const alreadyExist = await this.categoryCachingService.checkExist();
    if (alreadyExist) {
      categories = await this.categoryCachingService.getAllCategories();
    } else {
      categories = await this.storeCacheCategories();
    }
    return selectCategory(select, categories);
  }

  @HandlePrismaError(messages.CATEGORY)
  pagination(select: PaginationCategory): Promise<CategoryPaginationPrismaResponse> {
    const skip = calcSkip(select.pageSize, select.pageNumber);

    return this.prismaClient.$transaction([
      this.prismaClient.category.findMany({
        select: {
          ...select.query,
          _count: {
            select: {
              product: true,
            },
          },
        },
        take: select.pageSize,
        skip,
        orderBy: {
          category_id: 'desc',
        },
      }),
      this.prismaClient.category.count(),
    ]);
  }

  @HandlePrismaError(messages.CATEGORY)
  update(categoryBody: CategoryBodyType): Promise<category> {
    const { category_id, name, avatar } = categoryBody;
    return this.prismaClient.category
      .update({
        where: {
          category_id,
        },
        data: {
          name,
          avatar,
        },
      })
      .then(async (result) => {
        await this.storeCacheCategories();
        return result;
      });
  }

  @HandlePrismaError(messages.CATEGORY)
  delete(categoryId: string): Promise<category> {
    return this.prismaClient
      .$transaction([
        this.prismaClient.category.update({
          where: {
            category_id: categoryId,
          },
          data: {
            product: {
              deleteMany: {},
            },
          },
        }),
        this.prismaClient.category.delete({
          where: {
            category_id: categoryId,
          },
        }),
      ])
      .then(async (result) => {
        await this.storeCacheCategories();
        return result[1];
      });
  }
}
