import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ingredient } from 'generated/prisma';
import { createIngredientPattern, computeProductPrice, getAllIngredients } from '@share/pattern';
import { INGREDIENT_SERVICE } from '@share/di-token';
import { ComputeProductPrice, IngredientSelect } from '@share/dto/validators/ingredient.dto';

@Injectable()
export default class IngredientService {
  constructor(@Inject(INGREDIENT_SERVICE) private ingredient: ClientProxy) {}

  createIngredient(ingredient: ingredient): Observable<ingredient> {
    return this.ingredient.send<ingredient>(createIngredientPattern, ingredient);
  }

  computeProductPrice(productIngredient: ComputeProductPrice): Observable<number> {
    return this.ingredient.send<number>(computeProductPrice, productIngredient);
  }

  getAll(select: IngredientSelect): Observable<ingredient[]> {
    return this.ingredient.send<ingredient[]>(getAllIngredients, select);
  }
}
