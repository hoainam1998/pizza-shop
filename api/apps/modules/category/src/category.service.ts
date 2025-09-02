import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '@share/di-token';
import { category, PrismaClient } from 'generated/prisma';
import { CategoryBody, CategoryPaginationPrismaResponse } from '@share/interfaces';
import { PaginationCategory, GetCategory, CategoryDto } from '@share/validators/category.dto';

@Injectable()
export class CategoryService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient) {}

  create(categoryBody: CategoryBody): Promise<category> {
    return this.prismaClient.category.create({
      data: {
        ...categoryBody,
        category_id: Date.now().toString(),
      },
    });
  }

  getDetail(category: GetCategory): Promise<Omit<CategoryDto, 'categoryId'>> {
    return this.prismaClient.category.findFirstOrThrow({
      where: {
        category_id: category.categoryId,
      },
      select: category.query,
    });
  }

  pagination(select: PaginationCategory): Promise<CategoryPaginationPrismaResponse> {
    const skip = (select.pageNumber - 1) * select.pageSize;
    return this.prismaClient.$transaction([
      this.prismaClient.category.findMany({
        select: {
          ...select.query,
          category_id: true,
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

  update(categoryBody: CategoryBody): Promise<category> {
    const { category_id, name, avatar } = categoryBody;
    return this.prismaClient.category.update({
      where: {
        category_id,
      },
      data: {
        name,
        avatar,
      },
    });
  }

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
      .then((result) => result[1]);
  }
}
