<template>
  <div style="width: 100%">
    <a-upload
        ref="uploadRef"
        :key="uploadKey"
        :auto-upload="false"
        :show-retry-button="false"
        :show-cancel-button="false"
        :accept="accept"
        :custom-request="customRequest"
        :on-before-upload="beforeUploadHandle"
        :tip="tip"
        :draggable="false"
        :multiple="false"
        :show-link="false"
        :limit="1"
        @change="handleChange"
    >
      <template #upload-button>
        <a-button type="text" size="small">
          <template #icon>
            <icon-upload/>
          </template>
          {{ title }}
        </a-button>
      </template>
    </a-upload>
  </div>
</template>

<script setup lang="ts">
import {ref, defineProps, defineEmits, defineExpose} from 'vue';
import {Message} from '@arco-design/web-vue';
import axios from 'axios';
import {getToken} from "@/utils/auth";

const props = defineProps({
  //允许上传的文件类型 例如: .jpg,.png,.mp4
  accept: {
    type: String,
    // default: () => ".jpg, .png, .mp4, .xlsx", //仅参考, 建议引用组件时候根据业务限制后缀
  },
  // 上传文件大小限制(MB)
  fileMaxSize: {
    type: Number,
    default: 300, // MB
  },
  //上传提示信息
  tip: {
    type: String,
    default: ""
  },
  //上传文件目录名称 images：图片、files：excel、word、pdf等文件、videos：监控视频/音频(需要设置保留时间的)、photos：监控照片(需要设置保留时间的)
  dirName: {
    type: String,
    default: "images"
  },
  //按钮名称
  title: {
    type: String,
    default: "选择文件"
  }
});

const emit = defineEmits(['onSubUploadRes']);

// 暴露 submitUpload 方法
defineExpose({
  submitUpload: submitUpload,
});
const uploadRef = ref();
const currentFile = ref({});
const uploadUrl = ref('');
const downloadUrl = ref('');
const uploadKey = ref(0); // 新增：用于强制重渲染

const clearFileList = () => {
  currentFile.value = {};
  uploadUrl.value = '';
  downloadUrl.value = '';
  uploadKey.value += 1; // 强制重新渲染，清空文件列表
};

/**
 * 用户选择文件后触发
 */
const handleChange = (uploadFile, file) => {
  currentFile.value = file;
}

// 获取临时上传链接
const beforeUpload = async (rawFile) => {
  // 文件夹名称 images：图片、files：excel、word、pdf等文件、video：视频、audio：音频
  const dirName = props.dirName
  const postfix = rawFile.name.split(".").pop() || "";
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiUrl = `${baseUrl}/sysOss/upload`;
  try {
    const res = await axios.get(apiUrl, {
      headers: {Token: getToken()},
      params: {dirName, postfix},
    });
    const {code, data, msg} = res.data;
    if (code === 200 && data.uploadUrl) {
      // 赋值上传链接
      uploadUrl.value = data.uploadUrl;
      downloadUrl.value = data.downloadUrl
    } else {
      Message.error('获取上传地址失败');
    }
  } catch (err) {
    console.error("获取上传地址失败：", err);
  }
};

/**
 * 暴露方法：提交上传（兼容父组件传 imageUrl 的情况）
 */
function submitUpload(imageUrl, fileSize) {
  if (currentFile.value.file == undefined || currentFile.value.file == '' || currentFile.value.file == null) {
    if (imageUrl == undefined || imageUrl == "") {
      Message.warning('请选择文件');
      return
    } else {
      emit('onSubUploadRes', 'success', imageUrl, fileSize)
      clearFileList()
      return
    }
  } else {
    // 手动触发上传
    uploadRef.value?.submit()
  }
}

/**
 * 自定义上传逻辑（使用 PUT）
 */
const customRequest = () => {
  axios.put(uploadUrl.value, currentFile.value.file, {
    headers: {'Content-Type': ''}
  }).then((res) => {
    if (res.status == 200 && res.statusText == "OK") {
      emit('onSubUploadRes', 'success', downloadUrl.value, currentFile.value.size)
      Message.success('上传成功');
      clearFileList()
    } else {
      Message.error('上传失败');
      clearFileList()
    }
  })
}

/**
 * 上传前校验
 */
const beforeUploadHandle = (file) => {
  const isLtMaxSize = file.size / 1024 / 1024 <= props.fileMaxSize;
  if (!isLtMaxSize) {
    Message.warning(`文件不能超过 ${props.fileMaxSize}MB`);
    return false;
  }
  // 获取上传地址
  beforeUpload(file)
  return true;
}
</script>

<style scoped>
.arco-upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  border: 1px dashed var(--color-border-2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

:deep(.arco-progress-type-circle) {
  display: none !important;
}
</style>