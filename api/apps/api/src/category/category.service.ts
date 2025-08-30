import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { category } from 'generated/prisma';
import { CATEGORY_SERVICE } from '@share/di-token';
import { CategoryBody, CategoryPaginationResponse } from '@share/interfaces';
import {
  createCategoryPattern,
  paginationCategoryPattern,
  updateCategoryPattern,
  deleteCategoryPattern,
} from '@share/pattern';
import { SelectCategory } from '@share/validators/category.dto';

@Injectable()
export default class CategoryService {
  constructor(@Inject(CATEGORY_SERVICE) private category: ClientProxy) {}

  createCategory(category: CategoryBody): Observable<category> {
    return this.category.send<category>(createCategoryPattern, category);
  }

  pagination(select: SelectCategory): Observable<CategoryPaginationResponse> {
    return this.category.send<CategoryPaginationResponse>(paginationCategoryPattern, select);
  }

  updateCategory(category: CategoryBody): Observable<category> {
    return this.category.send<category>(updateCategoryPattern, category);
  }

  deleteCategory(categoryId: string): Observable<category> {
    return this.category.send<category>(deleteCategoryPattern, categoryId);
  }
}
