import { PrismaClient, Prisma, PrismaPromise, user } from 'generated/prisma';
import messages from '@share/constants/messages';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import {
  createMessage,
  autoGeneratePassword,
  passwordHashing,
  signingAdminResetPasswordToken,
  getResetPasswordLink,
  signApiKey,
} from '@share/utils';
import constants from '@share/constants';
import { type UserCreatedReturnType } from '@share/interfaces';
import { POWER_NUMERIC, SEX } from '@share/enums';
import RedisClient from '@share/libs/redis-client/redis';
const REDIS_PREFIX_USER = constants.REDIS_PREFIX.USER;

type PrismaUserCreateParameter = {
  args: Omit<Prisma.userCreateArgs, 'data'> & {
    data: Omit<Prisma.userCreateArgs['data'], 'user_id'> | Prisma.userCreateArgs['data'];
  };
  query: (args: PrismaUserCreateParameter['args']) => PrismaPromise<UserCreatedReturnType>;
};

type PrismaUserUpdateParameter = {
  args: Omit<Prisma.userUpdateArgs, 'data'> & {
    data: Omit<Prisma.userUpdateArgs['data'], 'user_id'> | Prisma.userUpdateArgs['data'];
  };
  query: (args: PrismaUserUpdateParameter['args']) => PrismaPromise<user>;
};

const USER = messages.USER;
const SEX_VALID = Object.values(SEX);
const POWER_VALID = Object.values(POWER_NUMERIC);

export default (prisma: PrismaClient) => ({
  create: async ({ args, query }: PrismaUserCreateParameter): Promise<UserCreatedReturnType> => {
    const firstTimePassword = autoGeneratePassword();
    if (Object.hasOwn(args.data, 'sex')) {
      if (!SEX_VALID.includes(args.data.sex!)) {
        throw new BadRequestException(createMessage(USER.YOUR_GENDER_INVALID));
      }
    }

    if (Object.hasOwn(args.data, 'power')) {
      if (!POWER_VALID.includes(args.data.power!)) {
        throw new BadRequestException(createMessage(USER.YOUR_POWER_INVALID));
      }
    }

    if (Object.hasOwn(args.data, 'email')) {
      const count = await prisma.user.count({
        where: {
          email: args.data.email,
        },
      });

      if (count > 0) {
        throw new UnauthorizedException(createMessage(USER.EMAIL_REGIS_ALREADY_EXIST));
      }
    }

    if (Object.hasOwn(args.data, 'phone')) {
      const count = await prisma.user.count({
        where: {
          phone: args.data.phone,
        },
      });

      if (count > 0) {
        throw new UnauthorizedException(createMessage(USER.PHONE_ALREADY_EXIST));
      }
    }

    const password = await passwordHashing(firstTimePassword);
    const userId = Date.now().toString();

    args.data = {
      user_id: userId,
      ...args.data,
      api_key: signApiKey({ userId: userId, email: args.data.email, power: args.data.power }),
      password,
      reset_password_token: signingAdminResetPasswordToken({ email: args.data.email, password: firstTimePassword }),
    };

    const user = await query(args);

    await RedisClient.Instance.Client.hSet(REDIS_PREFIX_USER, user.user_id, user.api_key!);

    return {
      ...user,
      reset_password_link: getResetPasswordLink(args.data.reset_password_token!, args.data.power!),
      plain_password: firstTimePassword,
    };
  },
  update: async ({ args }: PrismaUserUpdateParameter): Promise<user> => {
    return prisma.$transaction(async (pm) => {
      if (args.where.user_id) {
        await pm.$executeRaw`SELECT * FROM USER WHERE USER_ID = ${args.where.user_id} FOR UPDATE`;
      } else {
        if (args.where.email) {
          await pm.$executeRaw`SELECT * FROM USER WHERE EMAIL = ${args.where.email} FOR UPDATE`;
        }
      }

      if (Object.hasOwn(args.data, 'sex')) {
        if (!SEX_VALID.includes(args.data.sex! as number)) {
          throw new BadRequestException(createMessage(USER.YOUR_GENDER_INVALID));
        }
      }

      if (Object.hasOwn(args.data, 'power')) {
        if (!POWER_VALID.includes(args.data.power! as number)) {
          throw new BadRequestException(createMessage(USER.YOUR_POWER_INVALID));
        }
      }

      if (Object.hasOwn(args.data, 'email')) {
        const userIdFilter = {};
        if (args.where.user_id) {
          Object.assign(userIdFilter, { user_id: { not: args.where.user_id } });
        }

        const count = await pm.user.count({
          where: {
            email: args.data.email as string,
            ...userIdFilter,
          },
        });

        if (count > 0) {
          throw new UnauthorizedException(createMessage(USER.EMAIL_REGIS_ALREADY_EXIST));
        }
      }

      if (Object.hasOwn(args.data, 'phone')) {
        const userIdFilter = {};
        if (args.where.user_id) {
          Object.assign(userIdFilter, { user_id: { not: args.where.user_id } });
        }

        const count = await pm.user.count({
          where: {
            phone: args.data.phone as string,
            ...userIdFilter,
          },
        });

        if (count > 0) {
          throw new UnauthorizedException(createMessage(USER.PHONE_ALREADY_EXIST));
        }
      }

      let password = '';
      if (args.data.password) {
        password = await passwordHashing(args.data.password as string);
      }

      if (password) {
        args.data = {
          ...args.data,
          password,
        };
      }

      const user = await pm.user.update(args);

      const result = await pm.user.update({
        where: {
          user_id: user.user_id,
        },
        data: {
          api_key: signApiKey({ userId: user.user_id, email: user.email, power: user.power }),
        },
      });

      await RedisClient.Instance.Client.hSet(REDIS_PREFIX_USER, user.user_id, user.api_key!);

      return result;
    });
  },
});
