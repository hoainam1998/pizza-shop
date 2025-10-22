import { BadRequestException, Controller, HttpStatus, NotFoundException } from '@nestjs/common';
import { type ingredient } from 'generated/prisma';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import IngredientService from './ingredient.service';
import { computeProductPricePattern, createIngredientPattern, getAllIngredients } from '@share/pattern';
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
  createIngredient(ingredient: ingredient): Promise<ingredient> {
    return this.ingredientService.createIngredient(ingredient).catch((error: Error) => {
      this.logger.error('Create ingredient!', error.message);
      throw new RpcException(new BadRequestException(error));
    });
  }

  @MessagePattern(computeProductPricePattern)
  @HandleServiceError
  computeProductPrice(productIngredientsPrice: ComputeProductPrice): Promise<number> {
    const { temporaryProductId, productIngredients } = productIngredientsPrice;
    return this.ingredientService.computeProductIngredients(temporaryProductId, productIngredients);
  }

  @MessagePattern(getAllIngredients)
  getAllIngredients(select: IngredientSelect): Promise<ingredient[]> {
    return this.ingredientService
      .getAll(select)
      .then((ingredients) => {
        if (!checkArrayHaveValues(ingredients)) {
          throw new NotFoundException([]);
        }
        return ingredients;
      })
      .catch((error) => {
        this.logger.log('Get all ingredient', error.message);
        if (error.status === HttpStatus.NOT_FOUND) {
          throw new RpcException(error);
        }
        throw new RpcException(new BadRequestException(error));
      });
  }
}
