import { Controller, NotFoundException } from '@nestjs/common';
import { type ingredient } from 'generated/prisma';
import { MessagePattern } from '@nestjs/microservices';
import IngredientService from './ingredient.service';
import {
  computeProductPricePattern,
  createIngredientPattern,
  getAllIngredients,
  deleteIngredientPattern,
} from '@share/pattern';
import { ComputeProductPrice, IngredientSelect } from '@share/dto/validators/ingredient.dto';
import { checkArrayHaveValues } from '@share/utils';
import LoggingService from '@share/libs/logging/logging.service';
import { HandleServiceError } from '@share/decorators';

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

  @MessagePattern(getAllIngredients)
  getAllIngredients(select: IngredientSelect): Promise<ingredient[]> {
    return this.ingredientService.getAll(select).then((ingredients) => {
      if (!checkArrayHaveValues(ingredients)) {
        throw new NotFoundException([]);
      }
      return ingredients;
    });
  }

  @MessagePattern(deleteIngredientPattern)
  deleteIngredientPattern(ingredientId: string): Promise<ingredient> {
    return this.ingredientService.deleteIngredient(ingredientId);
  }
}
