import { Controller, NotFoundException } from '@nestjs/common';
import { type ingredient } from 'generated/prisma';
import { MessagePattern } from '@nestjs/microservices';
import IngredientService from './ingredient.service';
import {
  computeProductPricePattern,
  createIngredientPattern,
  getAllIngredientsPattern,
  deleteIngredientPattern,
  paginationPattern,
} from '@share/pattern';
import { ComputeProductPrice, IngredientPaginationSelect } from '@share/dto/validators/ingredient.dto';
import { checkArrayHaveValues } from '@share/utils';
import LoggingService from '@share/libs/logging/logging.service';
import { HandleServiceError } from '@share/decorators';
import type { IngredientPaginationResponse, IngredientSelectType } from '@share/interfaces';

@Controller()
export default class IngredientController {
  constructor(
    private readonly ingredientService: IngredientService,
    private readonly logger: LoggingService,
  ) {}

  @MessagePattern(createIngredientPattern)
  @HandleServiceError
  createIngredient(ingredient: ingredient): Promise<ingredient> {
    return this.ingredientService.createIngredient(ingredient);
  }

  @MessagePattern(computeProductPricePattern)
  @HandleServiceError
  computeProductPrice(productIngredientsPrice: ComputeProductPrice): Promise<number> {
    const { temporaryProductId, productIngredients } = productIngredientsPrice;
    return this.ingredientService.computeProductIngredients(temporaryProductId, productIngredients);
  }

  @MessagePattern(getAllIngredientsPattern)
  @HandleServiceError
  getAllIngredients(select: IngredientSelectType): Promise<Partial<ingredient>[]> {
    return this.ingredientService.getAll(select).then((ingredients) => {
      if (!checkArrayHaveValues(ingredients)) {
        throw new NotFoundException([]);
      }
      return ingredients;
    });
  }

  @MessagePattern(paginationPattern)
  @HandleServiceError
  pagination(select: IngredientPaginationSelect): Promise<IngredientPaginationResponse> {
    return this.ingredientService.pagination(select).then((results) => {
      const [list, total] = results;
      if (!checkArrayHaveValues(list as ingredient[])) {
        throw new NotFoundException({
          list: [],
          total: 0,
        });
      }
      return {
        list: list as ingredient[],
        total: total as number,
      };
    });
  }

  @MessagePattern(deleteIngredientPattern)
  deleteIngredientPattern(ingredientId: string): Promise<ingredient> {
    return this.ingredientService.deleteIngredient(ingredientId);
  }
}
