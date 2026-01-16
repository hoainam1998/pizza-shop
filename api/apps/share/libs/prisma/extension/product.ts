import { NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { product, Prisma, PrismaClient, PrismaPromise, Status } from 'generated/prisma';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';

type PrismaProductCreateParameter = {
  args: Omit<Prisma.productCreateArgs, 'data'> & {
    data: Omit<Prisma.productCreateArgs['data'], 'product_id'> | Prisma.productCreateArgs['data'];
    where: Prisma.productWhereInput;
  };
  query: (args: PrismaProductCreateParameter['args']) => PrismaPromise<product>;
};

export default (prisma: PrismaClient) => ({
  update: async ({ args }: PrismaProductCreateParameter): Promise<any> => {
    return prisma.$transaction(async (pm) => {
      if (args.where.product_id) {
        await pm.$executeRaw`SELECT * FROM PRODUCT WHERE product_id = ${args.where.product_id} FOR UPDATE`;
        const productSelected = await pm.product.findUnique({
          where: {
            product_id: args.where.product_id as string,
          },
        });

        if (!productSelected) {
          throw new RpcException(new NotFoundException(createMessage(messages.PRODUCT.PRODUCT_DID_NOT_EXIST)));
        }
      }

      if (Object.hasOwn(args.data, 'expired_time')) {
        if (+args.data.expired_time <= Date.now()) {
          args.data.status = Status.EXPIRED;
        } else {
          args.data.status = Status.IN_STOCK;
        }
      }

      if (!Object.hasOwn(args.data, 'status') && args.data.count <= 10) {
        args.data.status = Status.LESS;
      }
      return await pm.product.update(args as any);
    });
  },
});
