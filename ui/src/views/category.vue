<template>
  <main class="my-display-flex my-flex-gap-10 my-px-7">
    <Table :fields="fields" :data="data" emptyText="Categories are empty!" @pagination="fetchCategories">
      <template #date="props">
        {{ props.row.date }} fff
      </template>
      <template #name="props">
        {{ props.row.name }} name
      </template>
    </Table>
    <el-form ref="categoryFormRef" id="categoryForm" :model="ruleForm" :rules="categoryFormRules" label-width="auto"
      label-position="left" class="my-mt-10 my-flex-basic-40">
      <el-form-item label="Category name" prop="name">
        <el-input v-model="ruleForm.name" name="name" />
      </el-form-item>
      <el-form-item label="Avatar" prop="avatar">
        <UploadBox name="avatar" v-model:file="ruleForm.avatar" />
      </el-form-item>
      <div class="my-display-flex my-justify-content-center">
        <el-button class="my-fw-bold" type="primary" @click="submitForm()">
          Create
        </el-button>
      </div>
    </el-form>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import UploadBox from '@/components/upload-box.vue';
import Table from '@/components/table.vue';

type CategoryForm = {
  name: string;
  avatar: File[];
}

const categoryFormRef = ref<FormInstance>();
const ruleForm = reactive<CategoryForm>({
  name: '',
  avatar: [],
});

const categoryFormRules = reactive<FormRules<CategoryForm>>({
  name: [
    { required: true, message: 'Please input category name', trigger: 'change' },
  ],
  avatar: [
    { required: true, message: 'Please input category avatar', trigger: 'change' },
  ]
});

const fields = [
  {
    label: 'Name',
    key: 'name',
    width: 200,
  },
  {
    label: 'Avatar',
    key: 'avatar',
    width: 200,
  }
];

const data = ref([]);

const fetchCategories = (pageSize: number, pageNumber: number): void => {
  console.log(pageSize, pageNumber);
};

const submitForm = async (): Promise<void> => {
  if (categoryFormRef.value) {
    await categoryFormRef.value.validate((valid) => {
      if (valid) {
        const form = new FormData(document.forms.namedItem('categoryForm')!);
      }
    });
  }
};
</script>
<style lang="scss"></style>