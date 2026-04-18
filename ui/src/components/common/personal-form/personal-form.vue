<template>
  <div class="ps-box-shadow-2
    ps-px-10 ps-py-10
    ps-border-radius-5
    ps-border-width-2
    ps-border-style-solid">
    <UserDetailForm :formId="FORM_ID" ref="userFormRef" v-model="form" :rules="userFormRules">
      <el-row :gutter="10">
        <el-col :span="10">
          <el-form-item label="First name" prop="firstName">
            <el-input v-model="form.firstName" name="firstName" />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="Last name" prop="lastName">
            <el-input v-model="form.lastName" name="lastName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col>
          <el-form-item label="Email" prop="email">
            <ps-email-input v-model="form.email" name="email" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="14">
          <el-form-item label="Phone" prop="phone">
            <el-input v-model="form.phone" name="phone" />
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="Sex" labelWidth="50" prop="sex">
            <el-radio-group v-model="form.sex" name="sex">
              <el-radio label="Male" :value="0" />
              <el-radio label="Female" :value="1" />
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item label="Avatar" prop="avatar">
            <UploadBox ref="uploadImage" name="avatar" v-model:file="form.avatar" />
          </el-form-item>
        </el-col>
      </el-row>
      <slot :onSubmit="onSubmit" />
    </UserDetailForm>
  </div>
</template>
<script setup lang="ts">
import { reactive, useTemplateRef } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import UserDetailForm from '@/components/admin/user-detail-form/user-detail-form.vue';
import PsEmailInput from '@/components/common/inputs/email/email.vue';
import UploadBox from '@/components/common/upload-box/upload-box.vue';
import { useUserForm } from '@/composables';
import type { UserDetailModelType, UserDetailExposeType, UserPersonalInfoType } from '@/interfaces';
import { convertBase64ToSingleFile } from '@/utils';

type PersonalFormExposeType = {
  assignForm: (model: UserPersonalInfoType) => Promise<void>;
  reset: () => void;
};

const FORM_ID = 'personalForm';
const userFormRef = useTemplateRef<UserDetailExposeType>('userFormRef');
const uploadImage = useTemplateRef('uploadImage');

const emit = defineEmits<{
  (e: 'onSubmit', formData: FormData): void;
}>();

const { model, rules } = useUserForm({
  model: {
    avatar: [],
  },
  rules: {
    avatar: [
      {
        required: true, message: 'Avatar is required', trigger: 'change',
      },
    ],
  },
});

const form = reactive<UserDetailModelType>(model);
const userFormRules = reactive<FormRules<UserDetailModelType>>(rules);

const assignForm = async (data: UserPersonalInfoType): Promise<void> => {
  const name = `${data.firstName}-${data.lastName}`;
  const file = await convertBase64ToSingleFile(data.avatar as string, name);
  model.avatar = [file as File];
  model.firstName = data.firstName;
  model.lastName = data.lastName;
  model.email = data.email;
  model.phone = data.phone;
  model.sex = data.sex;
};

const reset = (): void => {
  (userFormRef.value?.formInstance as FormInstance).resetFields();
  (userFormRef.value?.formInstance as FormInstance).clearValidate();
  uploadImage.value?.reset();
};

const onSubmit = (): void => {
  userFormRef.value?.validate()
    .then(() => {
      const formData = new FormData(document.forms.namedItem(FORM_ID)!);
      emit('onSubmit', formData);
    })
    .catch(() => {});
};

defineExpose<PersonalFormExposeType>({
  assignForm,
  reset,
});
</script>
