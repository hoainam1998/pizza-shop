import { Controller } from '@nestjs/common';
import * as prisma from 'generated/prisma';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import IngredientService from './ingredient.service';
import { createIngredientPattern } from '@share/pattern';

@Controller()
export default class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @MessagePattern(createIngredientPattern)
  createIngredient(ingredient: prisma.ingredient): Promise<prisma.ingredient> {
    return this.ingredientService.createIngredient(ingredient).catch((error: Error) => {
      throw new RpcException(error);
    });
  }
}
