import { BadRequestException } from '@nestjs/common';
import { ingredient, Prisma, PrismaClient, PrismaPromise, Status } from 'generated/prisma';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';

type PrismaIngredientCreateParameter = {
  args: Omit<Prisma.ingredientCreateArgs, 'data'> & {
    data: Omit<Prisma.ingredientCreateArgs['data'], 'ingredient_id'> | Prisma.ingredientCreateArgs['data'];
  };
  query: (args: PrismaIngredientCreateParameter['args']) => PrismaPromise<ingredient>;
};

export default (prisma: PrismaClient) => ({
  create: async ({ args, query }: PrismaIngredientCreateParameter) => {
    if (Object.hasOwn(args.data, 'name')) {
      const count = await prisma.ingredient.count({
        where: {
          name: {
            contains: args.data.name,
          },
        },
      });

      if (count > 0) {
        throw new BadRequestException(createMessage(messages.INGREDIENT.NAME_ALREADY_EXIST));
      }
    }

    args.data = {
      ...args.data,
      status: Status.IN_STOCK,
      ingredient_id: Date.now().toString(),
    };

    return query(args);
  },
});
