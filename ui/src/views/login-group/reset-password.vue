<template>
  <LoginFrame title="reset password" class="reset-password">
    <el-form :id="FORM_ID" ref="resetPasswordFormRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Email" prop="email" class="ps-mb-12">
        <el-input v-model="form.email" type="mail" name="email" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Old password" prop="oldPassword" class="ps-mb-12">
        <el-input v-model="form.oldPassword" name="oldPassword" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Password" prop="password" class="ps-mb-12">
        <el-input v-model="form.password" name="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Confirm password" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" name="confirmPassword" autocomplete="off" />
      </el-form-item>
      <el-button class="ps-display-block ps-margin-auto ps-fw-bold ps-w-150px" type="primary" @click="onSubmit">
        Save
      </el-button>
    </el-form>
  </LoginFrame>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import LoginFrame from './login-frame.vue';
import constants from '@/constants';

type ResetPasswordType = {
  email: string;
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

const resetPasswordFormRef = ref<FormInstance>();

const form = reactive<ResetPasswordType>({
  email: '',
  oldPassword: '',
  password: '',
  confirmPassword: '',
});

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

const FORM_ID = 'resetPasswordForm';

const rules = reactive<FormRules<ResetPasswordType>>({
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
});

const onSubmit = async (): Promise<void> => {
  if (resetPasswordFormRef.value) {
    await resetPasswordFormRef.value.validate((valid) => {
      if (valid) {
        // TODO
      }
    });
  }
};
</script>
