import { BadRequestException, Controller, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, type ingredient } from 'generated/prisma';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import IngredientService from './ingredient.service';
import { computeProductPrice, createIngredientPattern, getAllIngredients } from '@share/pattern';
import { ComputeProductPrice, IngredientSelect } from '@share/dto/validators/ingredient.dto';
import { checkArrayHaveValues, createMessage } from '@share/utils';

@Controller()
export default class IngredientController {
  constructor(
    private readonly ingredientService: IngredientService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern(createIngredientPattern)
  createIngredient(ingredient: ingredient): Promise<ingredient> {
    return this.ingredientService.createIngredient(ingredient).catch((error: Error) => {
      this.logger.error('Create ingredient!', error.message);
      throw new RpcException(new BadRequestException(error));
    });
  }

  @MessagePattern(computeProductPrice)
  computeProductPrice(productIngredientsPrice: ComputeProductPrice): Promise<number> {
    const { temporaryProductId, productIngredients } = productIngredientsPrice;
    return this.ingredientService
      .computeProductIngredients(temporaryProductId, productIngredients)
      .catch((error: Error) => {
        this.logger.error('Compute product price!', error.message);
        if (error instanceof Prisma.PrismaClientInitializationError) {
          throw new RpcException(new BadRequestException(createMessage(error.message)));
        }
        throw new RpcException(new BadRequestException(error));
      });
  }

  @MessagePattern(getAllIngredients)
  getAllIngredients(select: IngredientSelect): Promise<ingredient[]> {
    return this.ingredientService.getAll(select).then((ingredients) => {
      if (!checkArrayHaveValues(ingredients)) {
        throw new RpcException(new NotFoundException([]));
      }
      return ingredients;
    });
  }
}
