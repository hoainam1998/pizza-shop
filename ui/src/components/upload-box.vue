<template>
  <el-upload class="avatar-uploader
    my-border-width-1
    my-border-style-dashed
    my-border-color-gray
    my-border-radius-6
    my-transition-duration-4
    my-w-250px my-h-250px
    my-border-color-hover-00a8ff"
    ref="uploadBox"
    v-model:file-list="file"
    :drag="true"
    :show-file-list="false"
    :http-request="uploadRequest"
    :on-change="onChange"
    :name="name"
    :auto-upload="true"
    accept="image/*">
      <img :src="imageUrl" class="my-w-100 my-h-100" />
      <el-input v-model="file" type="hidden" />
  </el-upload>
</template>

<script lang="ts" setup>
import { ref, defineProps, nextTick, useTemplateRef, defineExpose } from 'vue';
import type { UploadFile, UploadRequestOptions } from 'element-plus';
import defaultImageUploadPlaceholder from '@/assets/images/picture.png';

type UploadBoxPropsType = {
  name: string;
};

const uploadBox = useTemplateRef('uploadBox');
const { name } = defineProps<UploadBoxPropsType>();
const file = defineModel<UploadFile[]>('file');
const imageUrl = ref(defaultImageUploadPlaceholder);

const uploadRequest = (request: UploadRequestOptions): void => {
  imageUrl.value = URL.createObjectURL(request.file);
};

const onChange = (uploadFile: UploadFile): void => {
  file.value = [uploadFile];
  const fileInput: HTMLInputElement | null = document.querySelector(`input[name="${name}"]`);
  if (fileInput) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(uploadFile.raw as File);
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
.avatar-uploader {
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
</style>