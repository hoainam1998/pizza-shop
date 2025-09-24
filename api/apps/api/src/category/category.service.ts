import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { category } from 'generated/prisma';
import { CATEGORY_SERVICE } from '@share/di-token';
import { CategoryBody } from '@share/interfaces';
import {
  createCategoryPattern,
  paginationPattern,
  updateCategoryPattern,
  deleteCategoryPattern,
  getCategoryPattern,
  getAllCategories,
} from '@share/pattern';
import { CategoryDto, CategorySelect, GetCategory, PaginationCategory } from '@share/dto/validators/category.dto';
import { CategoryPaginationFormatter } from '@share/dto/serializer/category';

@Injectable()
export default class CategoryService {
  constructor(@Inject(CATEGORY_SERVICE) private category: ClientProxy) {}

  createCategory(category: CategoryBody): Observable<category> {
    return this.category.send<category>(createCategoryPattern, category);
  }

  getCategory(category: GetCategory): Observable<Omit<CategoryDto, 'categoryId'>> {
    return this.category.send<Omit<CategoryDto, 'categoryId'>>(getCategoryPattern, category);
  }

  getAllCategories(select: CategorySelect): Observable<category[]> {
    return this.category.send<category[]>(getAllCategories, select);
  }

  pagination(select: PaginationCategory): Observable<CategoryPaginationFormatter> {
    return this.category.send<CategoryPaginationFormatter>(paginationPattern, select);
  }

  updateCategory(category: CategoryBody): Observable<category> {
    return this.category.send<category>(updateCategoryPattern, category);
  }

  deleteCategory(categoryId: string): Observable<category> {
    return this.category.send<category>(deleteCategoryPattern, categoryId);
  }
}
