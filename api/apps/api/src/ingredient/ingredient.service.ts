import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ingredient } from 'generated/prisma';
import {
  createIngredientPattern,
  computeProductPricePattern,
  getAllIngredientsPattern,
  deleteIngredientPattern,
  paginationPattern,
} from '@share/pattern';
import { INGREDIENT_SERVICE } from '@share/di-token';
import { ComputeProductPrice } from '@share/dto/validators/ingredient.dto';
import { IngredientPaginationResponse } from '@share/interfaces';

@Injectable()
export default class IngredientService {
  constructor(@Inject(INGREDIENT_SERVICE) private ingredient: ClientProxy) {}

  createIngredient(ingredient: Record<string, any>): Observable<ingredient> {
    return this.ingredient.send<ingredient>(createIngredientPattern, ingredient);
  }

  computeProductPrice(productIngredient: ComputeProductPrice): Observable<number> {
    return this.ingredient.send<number>(computeProductPricePattern, productIngredient);
  }

  getAllIngredients(select: Record<string, boolean>): Observable<ingredient[]> {
    return this.ingredient.send<ingredient[]>(getAllIngredientsPattern, select);
  }

  deleteIngredient(ingredientId: string): Observable<ingredient> {
    return this.ingredient.send<ingredient>(deleteIngredientPattern, ingredientId);
  }

  pagination(select: any): Observable<IngredientPaginationResponse> {
    return this.ingredient.send<IngredientPaginationResponse>(paginationPattern, select);
  }
}
