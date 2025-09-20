import { PrismaClient, Prisma, PrismaPromise } from 'generated/prisma';
import constants from '@share/constants';
import messages from '@share/constants/messages';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createMessage, autoGeneratePassword, passwordHashing, signingAdminResetPasswordToken } from '@share/utils';
import { type UserCreatedType } from '@share/interfaces';

type PrismaUserCreateParameter = {
  args: Omit<Prisma.userCreateArgs, 'data'> & {
    data: Omit<Prisma.userCreateArgs['data'], 'user_id'> | Prisma.userCreateArgs['data'];
  };
  query: (args: PrismaUserCreateParameter['args']) => PrismaPromise<UserCreatedType>;
};

const USER = messages.USER;
const SEX_VALID = Object.values(constants.SEX);
const POWER_VALID = Object.values(constants.POWER_NUMERIC);

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

    const password = await passwordHashing(firstTimePassword);

    args.data = {
      user_id: Date.now().toString(),
      ...args.data,
      password,
      reset_password_token: signingAdminResetPasswordToken(args.data.email),
    };

    const user = await query(args);

    return {
      ...user,
      plain_password: firstTimePassword,
    };
  },
});
