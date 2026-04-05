import { PrismaClient, Prisma, PrismaPromise, user } from 'generated/prisma';
import messages from '@share/constants/messages';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createMessage, autoGeneratePassword, passwordHashing, signingAdminResetPasswordToken } from '@share/utils';
import { type UserCreatedType } from '@share/interfaces';
import { POWER_NUMERIC, SEX } from '@share/enums';

type PrismaUserCreateParameter = {
  args: Omit<Prisma.userCreateArgs, 'data'> & {
    data: Omit<Prisma.userCreateArgs['data'], 'user_id'> | Prisma.userCreateArgs['data'];
  };
  query: (args: PrismaUserCreateParameter['args']) => PrismaPromise<UserCreatedType>;
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
  create: async ({ args, query }: PrismaUserCreateParameter): Promise<UserCreatedType> => {
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

    args.data = {
      user_id: Date.now().toString(),
      ...args.data,
      password,
      reset_password_token: signingAdminResetPasswordToken({ email: args.data.email, password: firstTimePassword }),
    };

    const user = await query(args);

    return {
      ...user,
      plain_password: firstTimePassword,
    };
  },
  update: async ({ args, query }: PrismaUserUpdateParameter): Promise<user> => {
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

      const count = await prisma.user.count({
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

      const count = await prisma.user.count({
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

    const user = await query(args);

    return user;
  },
});
