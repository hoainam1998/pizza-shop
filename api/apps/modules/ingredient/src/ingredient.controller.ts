import { Controller, Logger } from '@nestjs/common';
import * as prisma from 'generated/prisma';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import IngredientService from './ingredient.service';
import { computeProductPrice, createIngredientPattern } from '@share/pattern';
import { ComputeProductPrice } from '@share/dto/validators/ingredient.dto';

@Controller()
export default class IngredientController {
  constructor(
    private readonly ingredientService: IngredientService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern(createIngredientPattern)
  createIngredient(ingredient: prisma.ingredient): Promise<prisma.ingredient> {
    return this.ingredientService.createIngredient(ingredient).catch((error: Error) => {
      this.logger.error('Create ingredient', error);
      throw new RpcException(error);
    });
  }

  @MessagePattern(computeProductPrice)
  computeProductPrice(productIngredientsPrice: ComputeProductPrice) {
    const { temporaryProductId, productIngredients } = productIngredientsPrice;
    return this.ingredientService
      .computeProductIngredients(temporaryProductId, productIngredients)
      .catch((error: Error) => {
        this.logger.error('Compute product price', error);
        throw new RpcException(error);
      });
  }
}
