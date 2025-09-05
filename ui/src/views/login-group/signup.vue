<template>
  <section class="signup ps-h-100vh ps-display-flex ps-justify-content-center ps-align-items-center">
    <div class="ps-w-20 ps-min-w-400px ps-px-7 ps-py-7 ps-border-radius-5 ps-bg-2ecc71">
      <h4 class="ps-text-color-white ps-fw-bold ps-mb-5 ps-text-transform-capitalize">Signup form</h4>
      <el-form ref="signupFormRef" :model="signupFormModel" label-width="auto"
        :rules="rules"
        class="ps-bg-white ps-px-10 ps-py-10 ps-border-radius-5">
        <el-row>
          <el-col>
            <el-form-item label="First name" prop="firstName">
              <el-input v-model="signupFormModel.firstName" name="firstName" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Last name" prop="lastName">
              <el-input v-model="signupFormModel.lastName" name="lastName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="Email" prop="email">
              <el-input v-model="signupFormModel.email" name="email" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="Phone" prop="phone">
              <el-input v-model="signupFormModel.phone" name="phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="Sex" prop="sex">
              <el-radio-group v-model="signupFormModel.sex" name="sex">
                <el-radio :value="0">Male</el-radio>
                <el-radio :value="1">Female</el-radio>
              </el-radio-group>
            </el-form-item></el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-button
              class="ps-margin-auto ps-display-flex ps-w-100"
              type="primary"
              @click="onSubmit">
                Signup
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { AxiosResponse, AxiosError } from 'axios';
import type { FormInstance, FormRules } from 'element-plus';
import paths from '@/router/paths';
import constants from '@/constants';
import { UserService } from '@/services';
import { showErrorNotification, showSuccessNotification } from '@/utils';
import type{ MessageResponse } from '@/interfaces';

type SignupModelType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: number;
};

const router = useRouter();

const signupFormModel = reactive<SignupModelType>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  sex: constants.SEX.MALE,
});

const signupFormRef = ref<FormInstance>();

const checkPhoneNumber = (rule: any, value: string, callback: any) => {
  if (/^0([1-9]{10})$/m.test(value) === false) {
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
      type: 'email', required: true, message: 'Please input correct email address', trigger: 'change'
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

const reset = (): void => {
  if (signupFormRef.value) {
    signupFormRef.value.resetFields();
  }
};

const onSubmit = async (): Promise<void> => {
  if (signupFormRef.value) {
    await signupFormRef.value.validate((valid) => {
      if (valid) {
        UserService.post('signup', signupFormModel)
          .then((response: AxiosResponse<MessageResponse>) => {
            showSuccessNotification('Signup success!', response.data.message);
            router.push(paths.LOGIN);
          }).catch((error: AxiosError<MessageResponse>) => {
            showErrorNotification('Signup failed!', error.response!.data.message);
          }).finally(reset);
      }
    });
  }
};
</script>

<style lang="scss" scoped></style>
