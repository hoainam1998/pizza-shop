<template>
  <el-upload class="avatar-uploader
    my-border-width-1
    my-border-style-dashed
    my-border-color-gray
    my-border-radius-6
    my-transition-duration-4
    my-w-250px my-h-250px
    my-border-color-hover-00a8ff" v-model:file-list="file" :show-file-list="false" :http-request="uploadRequest"
    :on-change="onChange" :name="name">
    <img v-if="imageUrl" :src="imageUrl" class="my-w-100 my-h-100" />
    <div v-else class="avatar-uploader-icon
      my-bg-no-repeat
      my-bg-position-center
      my-bg-size-cover
      my-opacity-5
      my-w-100
      my-h-100
      my-fs-28">
    </div>
    <el-input v-model="file" type="hidden" />
  </el-upload>
</template>

<script lang="ts" setup>
import { ref, defineProps } from 'vue';
import type { UploadFile, UploadRequestOptions } from 'element-plus';

type UploadBoxPropsType = {
  name: string;
};

const { name } = defineProps<UploadBoxPropsType>();
const file = defineModel('file');
const imageUrl = ref('');

const uploadRequest = (request: UploadRequestOptions): void => {
  imageUrl.value = URL.createObjectURL(request.file);
};

const onChange = (uploadFile: UploadFile): void => {
  file.value = [uploadFile];
};

</script>

<style lang="scss">
.avatar-uploader {
  .el-upload {
    width: 100%;
    height: 100%;

    &>.avatar-uploader-icon {
      background-image: url('../assets/images/picture.png');
    }
  }
}
</style>