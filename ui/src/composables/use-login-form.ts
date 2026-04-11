import { ref, type Ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import constants from '@/constants';

type LoginFormType = {
  email: string;
  password: string;
};

type LoginFormInformationType = {
  form: LoginFormType;
  rules: FormRules<LoginFormType>;
  loginFormRef: Ref<FormInstance>;
  resetForm: () => void;
};

const rules: FormRules<LoginFormType> = {
  email: [
    {
      required: true, message: 'Email is required!', trigger: 'change',
    },
    {
      type: 'email', message: 'Email is invalid!', trigger: 'blur',
    }
  ],
  password: [
    {
      required: true, message: 'Password is required!', trigger: 'change',
    },
    {
      pattern: constants.PASSWORD_PATTERN, message: 'Password is invalid!', trigger: 'change',
    }
  ]
};

const form: LoginFormType = {
  email: '',
  password: '',
};

const loginFormRef = ref<FormInstance>();

const resetForm = (): void => {
  loginFormRef.value?.resetFields();
};

export default <LoginFormInformationType>{
  form,
  rules,
  loginFormRef,
  resetForm,
};
