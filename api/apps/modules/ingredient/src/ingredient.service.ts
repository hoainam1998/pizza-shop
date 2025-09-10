import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '@share/di-token';
import { ingredient, PrismaClient } from 'generated/prisma';

@Injectable()
export default class IngredientService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient) {}

  createIngredient(ingredient: ingredient): Promise<ingredient> {
    return this.prismaClient.ingredient.create({
      data: ingredient,
    });
  }
}
