import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ingredient } from 'generated/prisma';
import { createIngredientPattern } from '@share/pattern';
import { INGREDIENT_SERVICE } from '@share/di-token';

@Injectable()
export default class IngredientService {
  constructor(@Inject(INGREDIENT_SERVICE) private ingredient: ClientProxy) {}

  createIngredient(ingredient: ingredient): Observable<ingredient> {
    return this.ingredient.send<ingredient>(createIngredientPattern, ingredient);
  }
}
