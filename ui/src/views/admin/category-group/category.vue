<template>
  <main class="category ps-display-flex ps-flex-gap-10 ps-px-7">
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
      <template #operation="props">
        <div class="ps-text-align-center">
          <el-button size="small" class="ps-fw-bold" type="success" @click="getCategoryDetail(props.row.categoryId)">
            Update
          </el-button>
          <el-button size="small" class="ps-fw-bold" type="danger" @click="deleteCategory(props.row.categoryId)">
            Delete
          </el-button>
        </div>
      </template>
    </Table>
    <el-form ref="categoryFormRef" :id="FORM_ID" :model="ruleForm" :rules="categoryFormRules" label-width="auto"
      label-position="left" class="ps-mt-10 ps-flex-basic-40">
      <el-form-item label="Category name" prop="name">
        <el-input v-model="ruleForm.name" name="name" />
      </el-form-item>
      <el-form-item label="Avatar" prop="avatar">
        <UploadBox ref="uploadImage" name="avatar" v-model:file="ruleForm.avatar" />
      </el-form-item>
      <div class="ps-display-flex ps-justify-content-center">
        <el-button class="ps-fw-bold" type="primary" @click="submitForm">
          {{ isUpdate ? 'Update' : 'Create' }}
        </el-button>
      </div>
    </el-form>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeMount, useTemplateRef, computed } from 'vue';
import type { FormInstance, FormRules, UploadRawFile } from 'element-plus';
import { type AxiosResponse, type AxiosError, HttpStatusCode } from 'axios';
import UploadBox from '@/components/common/upload-box.vue';
import Table from '@/components/common/table.vue';
import { CategoryService } from '@/services';
import { showErrorNotification, showSuccessNotification, convertBase64ToSingleFile } from '@/utils';
import constants from '@/constants';
import type { MessageResponseType, TableFieldType } from '@/interfaces';

const PAGE_SIZE = constants.PAGINATION.PAGE_SIZE;
const PAGE_NUMBER = constants.PAGINATION.PAGE_NUMBER;
const FORM_ID = 'categoryForm';

type CategoryForm = {
  name: string;
  avatar: (UploadRawFile | File)[];
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

const fields: TableFieldType[] = [
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
const categoryId = ref('');
const isUpdate = computed(() => !!categoryId.value);

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
  }).catch((error: AxiosError<MessageResponseType>) => {
    if (error.status === HttpStatusCode.NotFound) {
      data.value = [];
      total.value = 0;
    } else {
      showErrorNotification('Fetch category!', error.response?.data.messages);
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
        const form = new FormData(document.forms.namedItem(FORM_ID)!);
        const title = isUpdate.value ? 'Update category!' : 'Create category!';
        let mutationCategoryPromise;

        if (isUpdate.value) {
          form.append('categoryId', categoryId.value);
          mutationCategoryPromise = CategoryService.put('update', form);
        } else {
          mutationCategoryPromise = CategoryService.post('create', form);
        }

        mutationCategoryPromise
          .then((response) => {
            showSuccessNotification(title, response.data.messages);
            categoryTableRef.value!.refresh();
          })
          .catch((error: AxiosError<MessageResponseType>) => {
            showErrorNotification(title, error.response!.data.messages);
          })
          .finally(resetForm);
      }
    });
  }
};

const getCategoryDetail = (id: string): void => {
  CategoryService.post('detail', {
    categoryId: id,
    query: {
      name: true,
      avatar: true,
    },
  }).then(async (response: AxiosResponse) => {
    ruleForm.name = response.data.name;
    const file = await convertBase64ToSingleFile(response.data.avatar, response.data.name);
    ruleForm.avatar = [file as File];
    categoryId.value = id;
  });
};

const deleteCategory = (id: string): void => {
  CategoryService.delete(`delete/${id}`).then((response: AxiosResponse) => {
    showSuccessNotification('Delete category!', response.data.messages);
    categoryTableRef.value!.refresh();
  }).catch((error: AxiosError<MessageResponseType>) => {
    showErrorNotification('Delete category!', error.response!.data.messages);
  });
};

onBeforeMount(() => fetchCategories(PAGE_SIZE, PAGE_NUMBER));
</script>
