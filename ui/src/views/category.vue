<template>
  <main class="my-display-flex my-flex-gap-10 my-px-7">
    <Table
      ref="categoryTable"
      :fields="fields"
      :data="data"
      :total="total"
      emptyText="Categories are empty!"
      @pagination="fetchCategories">
      <template #avatar="props">
        <img :src="props.row.avatar" :alt="props.row.name" width="40px" height="40px" />
      </template>
      <template #name="props">
        {{ props.row.name }}
      </template>
      <template #operation>
        <div class="my-text-align-center">
          <el-button size="small" class="my-fw-bold" type="success">
            Update
          </el-button>
          <el-button size="small" class="my-fw-bold" type="danger">
            Delete
          </el-button>
        </div>
      </template>
    </Table>
    <el-form ref="categoryFormRef" id="categoryForm" :model="ruleForm" :rules="categoryFormRules" label-width="auto"
      label-position="left" class="my-mt-10 my-flex-basic-40">
      <el-form-item label="Category name" prop="name">
        <el-input v-model="ruleForm.name" name="name" />
      </el-form-item>
      <el-form-item label="Avatar" prop="avatar">
        <UploadBox ref="uploadImage" name="avatar" v-model:file="ruleForm.avatar" />
      </el-form-item>
      <div class="my-display-flex my-justify-content-center">
        <el-button class="my-fw-bold" type="primary" @click="submitForm">
          Create
        </el-button>
      </div>
    </el-form>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeMount, useTemplateRef } from 'vue';
import type { FormInstance, FormRules, UploadFile } from 'element-plus';
import { type AxiosResponse, type AxiosError, HttpStatusCode } from 'axios';
import UploadBox from '@/components/upload-box.vue';
import Table from '@/components/table.vue';
import { CategoryService } from '@/services';
import { showErrorNotification, showSuccessNotification } from '@/utils';
import constants from '@/constants';
import type{ MessageResponse } from '@/interfaces';

const PAGE_SIZE = constants.PAGINATION.PAGE_SIZE;
const PAGE_NUMBER = constants.PAGINATION.PAGE_NUMBER;

type CategoryForm = {
  name: string;
  avatar: UploadFile[];
};

const uploadImage = useTemplateRef('uploadImage');
const categoryTableRef = useTemplateRef('categoryTable');
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
    label: 'Avatar',
    key: 'avatar',
  },
  {
    label: 'Name',
    key: 'name',
  },
  {
    width: 200,
    key: 'operation',
  }
];

const data = ref([]);
const total = ref(0);

const fetchCategories = (pageSize: number, pageNumber: number): void => {
  CategoryService.post('pagination', {
    pageSize,
    pageNumber,
    query: {
      name: true,
      avatar: true,
    }
  }).then((response: AxiosResponse) => {
    data.value = response.data.list;
    total.value = response.data.total;
  }).catch((error: AxiosError<MessageResponse>) => {
    if (error.status === HttpStatusCode.NotFound) {
      data.value = [];
      total.value = 0;
    } else {
      showErrorNotification('Fetch category!', error.response!.data.message);
    }
  });
};

const resetForm = (): void => {
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields();
  }

  if (uploadImage.value) {
    uploadImage.value.reset();
  }
};

const submitForm = async (): Promise<void> => {
  if (categoryFormRef.value) {
    await categoryFormRef.value.validate((valid) => {
      if (valid) {
        const form = new FormData(document.forms.namedItem('categoryForm')!);
        CategoryService.post('create', form)
          .then((response) => {
            showSuccessNotification('Create category!', response.data.message);
            categoryTableRef.value!.refresh();
          })
          .catch((error: AxiosError<MessageResponse>) => {
            showErrorNotification('Create category!', error.response!.data.message);
          })
          .finally(resetForm);
      }
    });
  }
};

onBeforeMount(() => fetchCategories(PAGE_SIZE, PAGE_NUMBER));
</script>
<style lang="scss"></style>