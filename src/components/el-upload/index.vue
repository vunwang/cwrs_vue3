<template>
  <div style="width: 100%">
    <el-upload
      class="upload-demo"
      ref="uploadRef"
      :drag="drag"
      :accept="accept"
      :auto-upload="false"
      :action="uploadUrl"
      :limit="2"
      :on-change="change_upload"
      :before-upload="beforeUploadHandle"
      :on-progress="progressHandle"
      :http-request="httpRequestUpload"
    >
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        <el-button text type="primary">{{ title }}</el-button>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ tip }}
        </div>
      </template>
    </el-upload>
    <el-progress v-if="progressFlag" :percentage="loadProgress"></el-progress>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { getToken } from "@/utils/auth"; // 引入token工具

// 从环境变量获取基础URL并定义API地址
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiUrl = `${baseUrl}/sysOss/upload`;

const props = defineProps({
  accept: {
    type: String,
  },
  fileMaxSize: {
    type: Number,
    default: 300,
  },
  tip: {
    type: String,
    default: "",
  },
  drag: {
    type: Boolean,
    default: false,
  },
  //上传文件目录名称 images：图片、files：excel、word、pdf等文件、videos：监控视频/音频(需要设置保留时间的)、photos：监控照片(需要设置保留时间的)
  dirName: {
    type: String,
    default: "images"
  },
  title: {
    type: String,
    default: "选择文件",
  },
});

const emit = defineEmits(["onSubmitUploadResult"]);

// 对外暴露方法
defineExpose({
  submitUpload: submitUpload,
});

const uploadRef = ref<any>();
const loadProgress = ref(0);
const progressFlag = ref(false);
const uploadRawFile = ref<any>();
const uploadUrl = ref(""); // 上传地址
const filePath = ref(""); // 上传后文件读取地址
// 用于保存上传Promise的回调
let uploadResolve: (value: string) => void;
let uploadReject: (reason?: any) => void;

/**
 * 文件选择变化事件
 */
function change_upload(uploadFile: any, uploadFiles: any) {
  // 只保留最后选择的一个文件
  uploadFiles.splice(0, uploadFiles.length - 1);
  uploadRawFile.value = uploadFile;

  if (uploadFile.raw) {
    // 获取文件后缀
    const postfix = `.${uploadFile.raw.name.split(".").pop() || ""}`;
    // 调用新的API获取上传地址
    axios
      .get(apiUrl, {
        headers: { Token: getToken() }, // 添加认证token
        params: {
          dirName: "images", // 对应原folderName参数
          postfix: postfix,
        },
      })
      .then((res) => {
        if (res.data.code === 200) {
          uploadUrl.value = res.data.data.uploadUrl; // 从响应数据中获取上传地址
          filePath.value = res.data.data.downloadUrl; // 获取文件访问地址
        } else {
          ElMessage.error("获取上传地址失败: " + (res.data.msg || "未知错误"));
          if (uploadReject) uploadReject(res.data.msg);
        }
      })
      .catch((err) => {
        console.error("获取上传地址出错:", err);
        ElMessage.error("获取上传地址失败，请重试");
        if (uploadReject) uploadReject(err);
      });
  }
}

/**
 * 提交上传 - 改为返回Promise
 */
function submitUpload(imageUrl?: string, fileSize?: number): Promise<string> {
  // 如果有传入图片地址且没有新选择文件，直接返回成功
  if (!uploadRawFile.value?.raw) {
    if (imageUrl) {
      emit("onSubmitUploadResult", "success", imageUrl, fileSize);
      uploadRef.value?.clearFiles();
      return Promise.resolve(imageUrl);
    } else {
      // ElMessage.warning("请选择文件");
      return Promise.reject("未选择文件");
    }
  }

  // 创建新的Promise并保存回调
  return new Promise((resolve, reject) => {
    uploadResolve = resolve;
    uploadReject = reject;
    uploadRef.value?.submit();
  });
}
/**
 * 自定义上传逻辑
 */
function httpRequestUpload() {
  if (!uploadUrl.value || !uploadRawFile.value?.raw) {
    const error = "上传参数不完整";
    ElMessage.error(error);
    if (uploadReject) uploadReject(error);
    return;
  }

  axios
    .put(uploadUrl.value, uploadRawFile.value.raw, {
      headers: { "Content-Type": "" },
      onUploadProgress: (progressEvent) => {
        // 计算上传进度
        const percent =
          (progressEvent.loaded / (progressEvent.total || 1)) * 100;
        loadProgress.value = Math.min(Math.round(percent), 100);
        progressFlag.value = true;
      },
    })
    .then((res) => {
      if (res.status === 200) {
        // ElMessage.success("文件上传成功");
        const resultUrl = filePath.value;
        emit(
          "onSubmitUploadResult",
          "success",
          resultUrl,
          uploadRawFile.value.size
        );
        // 调用resolve返回结果
        if (uploadResolve) uploadResolve(resultUrl);
        // 清理状态
        uploadRef.value?.clearFiles();
        uploadRawFile.value = undefined;
        progressFlag.value = false;
        loadProgress.value = 0;
      } else {
        // const error = "文件上传失败";
        // ElMessage.error(error);
        // if (uploadReject) uploadReject(error);
        progressFlag.value = false;
      }
    })
    .catch((err) => {
      // console.error("上传出错:", err);
      // const error = "文件上传失败，请重试";
      // ElMessage.error(error);
      if (uploadReject) uploadReject(err);
      progressFlag.value = false;
    });
}

/**
 * 上传前校验
 */
const beforeUploadHandle = function (rawFile: any) {
  // 校验文件大小
  if (rawFile.size / 1024 / 1024 > props.fileMaxSize) {
    ElMessage.warning(`文件不能超过${props.fileMaxSize}MB`);
    return false;
  }
  return true;
};

/**
 * 上传进度处理
 */
function progressHandle(evt: any) {
  progressFlag.value = true;
  loadProgress.value = parseInt(evt.percent + "");
  if (evt.percent >= 100) {
    loadProgress.value = 100;
  }
}
</script>

<style scoped lang="scss"></style>
