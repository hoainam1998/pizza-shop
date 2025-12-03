<template>
  <LoginFrame title="signup">
    <el-form ref="signupFormRef"
      :model="signupFormModel"
      label-width="auto"
      :rules="rules"
      class="ps-bg-white ps-border-radius-5">
        <el-form-item label="First name" prop="firstName">
          <el-input v-model="signupFormModel.firstName" name="firstName" />
        </el-form-item>
        <el-form-item label="Last name" prop="lastName">
          <el-input v-model="signupFormModel.lastName" name="lastName" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <ps-email-input v-model="signupFormModel.email" name="email" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="signupFormModel.phone" name="phone" />
        </el-form-item>
        <el-form-item label="Sex" prop="sex">
          <el-radio-group v-model="signupFormModel.sex" name="sex">
            <el-radio label="Male" :value="0" />
            <el-radio label="Female" :value="1" />
          </el-radio-group>
        </el-form-item>
        <el-button class="ps-margin-auto ps-display-flex ps-w-150px" type="primary" @click="onSubmit">
          Signup
        </el-button>
    </el-form>
  </LoginFrame>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import type { AxiosResponse, AxiosError } from 'axios';
import type { FormInstance, FormRules } from 'element-plus';
import LoginFrame from './common/login-frame.vue';
import PsEmailInput from '@/components/inputs/email.vue';
import paths from '@/router/paths';
import constants from '@/constants';
import { UserService } from '@/services';
import useWrapperRouter from '@/composables/use-router';
import { showErrorNotification, showSuccessNotification } from '@/utils';
import type { MessageResponseType } from '@/interfaces';

type SignupModelType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: number;
};

const { push } = useWrapperRouter();

const signupFormModel = reactive<SignupModelType>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  sex: constants.SEX.MALE,
});

const signupFormRef = ref<FormInstance>();

const checkPhoneNumber = (rule: any, value: string, callback: any): any | void => {
  if (/^0([1-9]{9})$/m.test(value) === false) {
    return callback(new Error('Phone number must be a number and have 11 character!'));
  }
  callback();
};

const rules = reactive<FormRules<SignupModelType>>({
  firstName: [
    {
      required: true, message: 'First name is required!', trigger: 'change'
    }
  ],
  lastName: [
    {
      required: true, message: 'Last name is required!', trigger: 'change'
    }
  ],
  email: [
    {
      required: true, message: 'Email is required!', trigger: 'change'
    },
    {
      type: 'email', required: true, message: 'Please input correct email address', trigger: 'blur'
    }
  ],
  phone: [
    {
      required: true, message: 'Phone is required!', trigger: 'change'
    },
    {
      validator: checkPhoneNumber,
      trigger: 'change',
    }
  ],
  sex: [
    {
      required: true, message: 'Sex is required!', trigger: 'change',
    }
  ]
});

const resetForm = (): void => {
  if (signupFormRef.value) {
    signupFormRef.value.resetFields();
  }
};

const onSubmit = async (): Promise<void> => {
  if (signupFormRef.value) {
    await signupFormRef.value.validate((valid) => {
      if (valid) {
        UserService.post('signup', signupFormModel)
          .then((response: AxiosResponse<MessageResponseType>) => {
            showSuccessNotification('Signup success!', response.data.messages);
            push(paths.LOGIN);
          }).catch((error: AxiosError<MessageResponseType>) => {
            showErrorNotification('Signup failed!', error.response!.data.messages);
          });
      }
    });
  }
};

onBeforeRouteLeave(resetForm);
</script>
