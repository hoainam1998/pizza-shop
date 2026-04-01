import type { FormRules } from 'element-plus';
import { POWER, SEX } from '@/enums';
import type { UserDetailModelType } from '@/interfaces';

type ResetUserType = {
  reset: () => void;
};

const originUserInfo: UserDetailModelType = {
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  sex: SEX.MALE,
  power: POWER.SALE,
};

const defaultUserInfo: UserDetailModelType & ResetUserType = {
  ...originUserInfo,
  reset() {
    Object.assign(this, originUserInfo);
  },
};

type UserFormInputType = {
  model?: Partial<Pick<UserDetailModelType, 'power' | 'avatar' | 'userId'>>;
  rules?: FormRules<UserDetailModelType>;
};

type UserFormReturnType = {
  model: UserDetailModelType;
  rules: FormRules<UserDetailModelType>;
  resetForm: () => void;
};

const checkPhoneNumber = (rule: any, value: string, callback: any): any | void => {
  if (/^0([1-9]{9})$/m.test(value) === false) {
    return callback(new Error('Phone number must be a number and have 11 character!'));
  }
  callback();
};

export default function({ model, rules }: UserFormInputType = {}): UserFormReturnType {
  return {
    model: Object.assign(defaultUserInfo, model),
    rules: {
      firstName: [
        {
          required: true,
          message: 'First name is required!',
          trigger: 'change',
        },
      ],
      lastName: [
        {
          required: true,
          message: 'Last name is required!',
          trigger: 'change',
        },
      ],
      email: [
        {
          required: true,
          message: 'Email is required!',
          trigger: 'change',
        },
        {
          type: 'email',
          required: true,
          message: 'Please input correct email address',
          trigger: 'blur',
        },
      ],
      phone: [
        {
          required: true,
          message: 'Phone is required!',
          trigger: 'change',
        },
        {
          validator: checkPhoneNumber,
          trigger: 'change',
        },
      ],
      sex: [
        {
          required: true,
          message: 'Sex is required!',
          trigger: 'change',
        },
      ],
      ...rules,
    },
    resetForm() {
      defaultUserInfo.reset();
    },
  };
};
