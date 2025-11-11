<template>
  <section class="product-detail ps-px-10 ps-py-10">
    <el-form :id="FORM_ID" ref="productRef" :model="form" :rules="rules" label-position="top">
      <el-row>
        <el-col :xl="20">
          <el-row :gutter="15" justify="space-between">
            <el-col :xl="4">
              <el-form-item label="Name" prop="name">
                <el-input v-model="form.name" name="name" autocomplete="off" />
              </el-form-item>
            </el-col>
            <el-col :xl="2">
              <el-form-item label="Amount" prop="count">
                <el-input v-model.number="form.count" name="count" min="1" type="number" />
              </el-form-item>
            </el-col>
            <el-col :xl="4">
              <el-form-item label="Category" prop="category">
                <el-select v-model="form.category" :value-key="form.category" name="category"
                  placeholder="Please select a category!">
                  <el-option v-for="(category, index) in categories" :key="index" :value="category.categoryId"
                    :label="category.name" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xl="4">
              <el-form-item prop="expiredTime" label="Expired time">
                <ExpiredDaySelect v-model="form.expiredTime" name="expiredTime" />
              </el-form-item>
            </el-col>
            <el-col :xl="8">
              <el-form-item prop="ingredientLength">
                <el-input type="hidden" v-model.number="form.ingredientLength" name="ingredientLength" />
                <IngredientSelect
                  v-model:ingredients="form.ingredients"
                  v-model:temporary-price="form.originalPrice"
                  v-model:temporary-product-id="form.productId" />
              </el-form-item>
            </el-col>
            <el-col :xl="2">
              <el-form-item label="Price" prop="price">
                <el-input v-model.number="form.price" name="price" min="1" type="number" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :xl="4">
          <el-row class="ps-ml-17 ps-mr-17" justify="center">
            <el-col :xl="24">
              <el-form-item label="Avatar" prop="avatar">
                <UploadBox ref="uploadImage" name="avatar" v-model:file="form.avatar" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <div class="ps-display-flex ps-justify-content-center ps-mt-10">
        <el-button class="ps-fw-bold ps-w-200px" type="primary" @click="onSubmit">
          Save
        </el-button>
      </div>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import { onBeforeMount, reactive, ref, type Ref, inject, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { AxiosResponse } from 'axios';
import type { FormInstance, FormRules, UploadRawFile } from 'element-plus';
import UploadBox from '@/components/upload-box.vue';
import ExpiredDaySelect from '@/components/expired-time-select.vue';
import IngredientSelect from './ingredient-select.vue';
import { CategoryService, ProductService } from '@/services';
import { type CategoryType, type IngredientType, } from '@/interfaces';
import { convertBase64ToSingleFile, showErrorNotification, showSuccessNotification } from '@/utils';
import useWrapperRouter from '@/composables/use-router';
import { ROUTE_NAME } from '@/di-token';
import paths from '@/router/paths';

const FORM_ID = 'productForm';

type ProductFormRule = {
  productId: string;
  name: string;
  count: number;
  expiredTime?: number;
  category: string;
  avatar: (UploadRawFile | File)[];
  price: number;
  originalPrice: number;
  ingredients: IngredientType[],
  ingredientLength: number;
};

const { push } = useWrapperRouter();
const routeName = inject(ROUTE_NAME) as any;
const route = useRoute();
const { id } = route.params;
const categories: Ref<CategoryType[]> = ref([]);
const productRef = ref<FormInstance>();
const rules = reactive<FormRules<ProductFormRule>>({
  name: [
    {
      required: true, message: 'Name is required!', trigger: 'change',
    },
  ],
  count: [
    {
      required: true, message: 'Count is required!', trigger: 'change',
    },
    {
      type: 'number', min: 1, message: 'Count must be larger than 0', trigger: 'change',
    }
  ],
  expiredTime: [
    {
      required: true, message: 'Expired time is required!', trigger: 'change',
    }
  ],
  category: [
    {
      required: true, message: 'Category is required!', trigger: 'change',
    }
  ],
  avatar: [
    {
      required: true, message: 'Avatar is required', trigger: 'change',
    }
  ],
  price: [
    {
      required: true, message: 'Price is required!', trigger: 'change',
    },
    {
      type: 'number', min: 1, message: 'Price must be larger than 0', trigger: 'change',
    }
  ],
  ingredientLength: [
    {
      type: 'number', min: 2, message: 'Accept at least the two ingredient!',
    }
  ]
});

const form = reactive<ProductFormRule>({
  productId: Date.now().toString(),
  name: '',
  count: 0,
  expiredTime: undefined,
  category: '',
  avatar: [],
  price: 0,
  originalPrice: 0,
  ingredients: [],
  ingredientLength: 1,
});

const resetForm = (): void => {
  productRef.value?.resetFields();
  productRef.value?.clearValidate();
};

watch(() => form.ingredients.length, (length) => {
  form.ingredientLength = length;
});

const backToProducts = () => push(`${paths.HOME}/${paths.HOME.PRODUCT}`);

const onSubmit = async (): Promise<void> => {
  if (productRef.value) {
    await productRef.value.validate((valid) => {
      if (valid) {
        const formData = new FormData();
        const formEntries = Object.entries(form) as [string, any];
        for (const [key, value] of formEntries) {
          if (key === 'ingredientLength') {
            continue;
          } else if (!/(ingredients|avatar)/.test(key)) {
            formData.append(key, value);
          } else if (key === 'avatar') {
            formData.append(key, (value as Array<File>)[0]);
          } else {
            form.ingredients.forEach((ingredient) => {
              formData.append(key, JSON.stringify(ingredient));
            });
          }
        }

        if (id) {
          ProductService.put('update', formData)
            .then((response) => {
              showSuccessNotification('Update product!', response.data.messages);
              resetForm();
              backToProducts();
            })
            .catch((error) => showErrorNotification('Update product!', error.response.data.messages));
        } else {
          ProductService.post('create', formData)
            .then((response) => {
              showSuccessNotification('Create product!', response.data.messages);
              resetForm();
              backToProducts();
            })
            .catch((error) => showErrorNotification(error.response.data.messages));
        }
      }
    });
  }
};

onBeforeMount(() => {
  CategoryService.post('all', {
    name: true,
  })
  .then((response: AxiosResponse) => categories.value = response.data)
  .catch(() => categories.value = []);

  if (id) {
    ProductService.post('detail', {
      productId: id,
      query: {
        name: true,
        count: true,
        price: true,
        status: true,
        categoryId: true,
        ingredients: true,
        avatar: true,
        originalPrice: true,
        expiredTime: true
      }
    }).then(async (response: AxiosResponse) => {
      const product = response.data;
      form.productId = product.productId;
      form.name = product.name;
      form.count = product.count;
      form.category = product.categoryId;
      form.expiredTime = +product.expiredTime;
      const file = await convertBase64ToSingleFile(product.avatar, product.name);
      form.avatar = [file];
      form.ingredients = product.ingredients;
      routeName.setName(product.name);
    });
  }
});
</script>

<style lang="scss">
  .expired-time-select {
    .el-input {
      width: 100% !important;
    }
  }
</style>
