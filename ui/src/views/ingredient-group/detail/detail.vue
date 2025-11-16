<template>
  <el-dialog v-model="dialogVisible" ref="dialogRef" width="35%" align-center @close="resetForm">
    <section class="ingredient-detail">
      <el-form :id="FORM_ID" ref="ingredientFormRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="15" justify="space-between">
          <el-col :xl="14">
            <el-row :gutter="15">
              <el-col :xl="24">
                <el-form-item label="Name" prop="name">
                  <el-input v-model="form.name" name="name" autocomplete="off" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="15">
              <el-col :xl="12">
                <el-form-item label="Amount" prop="count">
                  <el-input v-model.number="form.count" name="count" min="1" type="number" />
                </el-form-item>
              </el-col>
              <el-col :xl="12">
                <el-form-item label="Price" prop="price">
                  <el-input v-model.number="form.price" name="price" min="1" type="number" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="15">
              <el-col :xl="24">
                <el-form-item label="Unit" prop="unit">
                  <el-select
                    v-model="form.unit"
                    :value-key="form.unit"
                    name="unit"
                    placeholder="Please select an unit!">
                      <el-option v-for="(unit, index) in units" :key="index" :value="unit.value" :label="unit.label" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xl="24">
                <el-form-item prop="expiredTime" label="Expired time">
                  <ExpiredDaySelect v-model="form.expiredTime" name="expiredTime" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <el-col :xl="10">
            <el-form-item label="Avatar" prop="avatar" class="ps-justify-contents-center">
              <UploadBox ref="uploadImage" name="avatar" v-model:file="form.avatar" />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="ps-display-flex ps-justify-content-center ps-mt-10">
          <el-button class="ps-fw-bold ps-w-100px" type="primary" @click="onSubmit">
            Save
          </el-button>
          <el-button class="ps-fw-bold ps-w-100px" type="warning" @click="closeDialog">
            Close
          </el-button>
        </div>
      </el-form>
    </section>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, defineExpose, defineModel, defineEmits, useTemplateRef, nextTick } from 'vue';
import type { FormInstance, FormRules, UploadRawFile } from 'element-plus';
import ExpiredDaySelect from '@/components/expired-time-select.vue';
import UploadBox from '@/components/upload-box.vue';
import { IngredientService } from '@/services';
import type { IngredientType, OptionType } from '@/interfaces';
import constants from '@/constants';
import { convertBase64ToSingleFile, showErrorNotification, showSuccessNotification } from '@/utils';
const FORM_ID = 'ingredientForm';

type IngredientFormRule = {
  ingredientId?: string;
  name: string;
  count: number;
  expiredTime?: number;
  avatar: (UploadRawFile | File)[];
  price: number;
  unit: string;
};

const form = reactive<IngredientFormRule>({
  name: '',
  count: 0,
  expiredTime: undefined,
  avatar: [],
  price: 0,
  unit: '',
});

const dialogVisible = defineModel<boolean>('dialogVisible');
const uploadImageRef = useTemplateRef('uploadImage');
const dialogRef = useTemplateRef('dialogRef');
const ingredientFormRef = ref<FormInstance>();
const units: OptionType[] = Object.values(constants.UNITS).map((unit) => ({ label: unit, value: unit }));

const emit = defineEmits<{
  (e: 'onComplete'): void;
}>();

const rules = reactive<FormRules<IngredientFormRule>>({
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
  unit: [
    {
      required: true, message: 'Unit is required!', trigger: 'change',
    },
  ],
  expiredTime: [
    {
      required: true, message: 'Expired time is required!', trigger: 'change',
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
});

const closeDialog = (): void => {
  dialogRef.value.handleClose();
};

const handleAfterSaved = (): void => {
  emit('onComplete');
  closeDialog();
};

const onSubmit = async (): Promise<void> => {
  if (ingredientFormRef.value) {
    await ingredientFormRef.value.validate((valid) => {
      if (valid) {
        const formData = new FormData();
        const formEntries = Object.entries(form) as [string, any];
        for (const [key, value] of formEntries) {
          if (key === 'avatar') {
            formData.append(key, (value as Array<File>)[0]);
          } else {
            formData.append(key, value);
          }
        }

        if (form.ingredientId) {
          IngredientService.put('update', formData).then((response) => {
            showSuccessNotification('Update ingredient!', response.data.messages);
            handleAfterSaved();
          }).catch((error) => {
            showErrorNotification('Update ingredient!', error.response.data.messages);
          });
        } else {
          IngredientService.post('create', formData).then((response) => {
            showSuccessNotification('Create ingredient!', response.data.messages);
            handleAfterSaved();
          }).catch((error) => {
            showErrorNotification('Create ingredient!', error.response.data.messages);
          });
        }
      }
    });
  }
};

const resetForm = (): void => {
  ingredientFormRef.value?.resetFields();
  uploadImageRef.value?.reset();
};

const assignForm = async (ingredient: IngredientType): Promise<void> => {
  form.ingredientId = ingredient.ingredientId;
  form.name = ingredient.name!;
  form.price = ingredient.price!;
  form.count = +ingredient.count!;
  form.unit = ingredient.unit!;
  form.expiredTime = +ingredient.expiredTime!;
  convertBase64ToSingleFile(ingredient.avatar!, ingredient.name!)
    .then((file) => nextTick(() => form.avatar = [file]));
};

defineExpose({
  assignForm,
  resetForm,
});
</script>
