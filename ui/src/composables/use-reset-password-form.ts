import { ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import constants from '@/constants';

type ResetPasswordType = {
  email: string;
  oldPassword: string;
  password: string;
  confirmPassword?: string;
  token?: string;
};

type ResetPasswordFormInformationType = {
  form: ResetPasswordType;
  rules: FormRules<ResetPasswordType>;
  resetPasswordFormRef: Ref<FormInstance | undefined, FormInstance | undefined>;
  disableSubmit: boolean;
  resetForm: () => void;
};

const resetPasswordFormRef = ref<FormInstance>();

const validatePassword = (rule: any, value: any, callback: any): void => {
  if (value === '') {
    callback('Please input the password');
  } else {
    if (form.confirmPassword) {
      if (resetPasswordFormRef.value) {
        resetPasswordFormRef.value.validateField('confirmPassword')
          .catch(() => {});
      }
    }
    callback();
  }
};

const validateConfirmPassword = (rule: any, value: any, callback: any): void => {
  if (value === '') {
    callback('Please input the password again');
  } else if (value !== form.password) {
    callback('Two password don\'t match!');
  } else {
    callback();
  }
};

const form: ResetPasswordType = {
  email: '',
  oldPassword: '',
  password: '',
  confirmPassword: '',
};

const rules: FormRules<ResetPasswordType> = {
  email: [
    {
      required: true, message: 'Email is required!', trigger: 'change',
    },
    {
      type: 'email', message: 'Email is invalid!', trigger: 'change',
    }
  ],
  oldPassword: [
    {
      required: true, message: 'Password is required!', trigger: 'change',
    },
    {
      pattern: constants.PASSWORD_PATTERN, message: 'Password is invalid!', trigger: 'change',
    }
  ],
  password: [
    {
      required: true, message: 'Password is required!', trigger: 'change',
    },
    {
      pattern: constants.PASSWORD_PATTERN, message: 'Password is invalid!', trigger: 'change',
    },
    {
      validator: validatePassword, trigger: 'change',
    }
  ],
  confirmPassword: [
    {
      required: true, message: 'Confirm password is required!', trigger: 'change',
    },
    {
      pattern: constants.PASSWORD_PATTERN, message: 'Password is invalid!', trigger: 'change',
    },
    {
      validator: validateConfirmPassword, trigger: 'change',
    }
  ]
};

const resetForm = (): void => {
  resetPasswordFormRef.value?.resetFields();
};

export default (): ResetPasswordFormInformationType => {
  const route = useRoute();
  form.token = route.query.token as string;

  return {
    form,
    rules,
    resetPasswordFormRef,
    disableSubmit: !form.token,
    resetForm,
  };
};
