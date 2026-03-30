<template>
  <section class="ps-h-100vh ps-display-flex ps-justify-content-center ps-align-items-center">
    <div class="ps-w-600px">
      <BackButton />
      <PersonalForm ref="personalForm" @onSubmit="onSubmit" class="ps-border-color-f39c12">
        <template #default="{ onSubmit }">
          <el-button @click="onSubmit" class="ps-w-100px ps-display-block ps-margin-auto"
            type="success">Save</el-button>
        </template>
      </PersonalForm>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { useTemplateRef } from 'vue';
import PersonalForm from '@/components/common/personal-form/personal-form.vue';
import BackButton from '@/components/common/buttons/back-button/back-button.vue';
import type { MessageResponseType, UserDetailModelType, UserDetailExposeType } from '@/interfaces';

const personalForm = useTemplateRef('personalForm');

const onSubmit = (formData: FormData): void => {
};
</script>
