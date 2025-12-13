<template>
  <el-upload class="upload-box
    ps-border-width-1
    ps-border-style-dashed
    ps-border-color-gray
    ps-border-radius-6
    ps-transition-duration-4
    ps-w-250px ps-h-250px
    ps-border-color-hover-00a8ff"
    ref="uploadBox"
    v-model:file-list="file"
    :drag="true"
    :show-file-list="false"
    :http-request="uploadRequest"
    :on-change="onChange"
    :name="name"
    :auto-upload="true"
    accept="image/*">
      <img :src="imageUrl" class="ps-w-100 ps-h-100" />
      <el-input v-model="file" type="hidden" />
  </el-upload>
</template>

<script lang="ts" setup>
import { ref, nextTick, useTemplateRef, watch } from 'vue';
import type { UploadFile, UploadRawFile, UploadRequestOptions } from 'element-plus';
import defaultImageUploadPlaceholder from '@/assets/images/picture.png';
import { dangerColor } from '@/assets/scss/variables.module.scss';

type UploadBoxPropsType = {
  name: string;
};

const uploadBox = useTemplateRef('uploadBox');
const { name } = defineProps<UploadBoxPropsType>();
const file = defineModel<(File | UploadRawFile | UploadFile)[]>('file');
const imageUrl = ref(defaultImageUploadPlaceholder);

watch(file, (newFile) => {
  if (newFile && newFile.length) {
    const fileUpload: File = ((newFile[0] as UploadFile).raw  || newFile[0]) as File;
    imageUrl.value = URL.createObjectURL(fileUpload);
    assignInputFile(fileUpload);
  }
});

const uploadRequest = (request: UploadRequestOptions): void => {
  imageUrl.value = URL.createObjectURL(request.file);
};

const onChange = (uploadFile: UploadFile): void => {
  nextTick(() => file.value = [uploadFile.raw!]);
};

const assignInputFile = (file: File): void => {
  const fileInput: HTMLInputElement | null = document.querySelector(`input[name="${name}"]`);
  if (fileInput) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file as File);
    nextTick(() => fileInput.files = dataTransfer.files);
  }
};

const reset = (): void => {
  uploadBox.value.clearFiles();
  imageUrl.value = defaultImageUploadPlaceholder;
};

defineExpose({
  reset,
});
</script>

<style lang="scss">
  .upload-box {
    .el-upload {
      width: 100%;
      height: 100%;

      .el-upload-dragger {
        border: none;
        background-color: transparent;
        padding: 7px;
      }
    }
  }

  .upload-box:has(+ .el-form-item__error) {
    border-color: v-bind(dangerColor) !important;
  }
</style>
