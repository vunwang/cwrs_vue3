<template>
  <el-drawer
      v-model="visible"
      title="岗位详情"
      size="30%"
      resizable
      :before-close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">岗位详情</span>
      </div>
    </template>
    <el-descriptions :column="{ xs: 1, sm: 1, md: 2 }" border size="large">
      <el-descriptions-item label="所属组织" :span="2">{{
          post?.deptName
        }}
      </el-descriptions-item>
      <el-descriptions-item label="岗位名称">{{
          post?.postName
        }}
      </el-descriptions-item>
      <el-descriptions-item label="岗位编号">{{
          post?.postCode
        }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <CwrsCellTag :value="post?.postStatus" :dict="sysStatus"></CwrsCellTag>
      </el-descriptions-item>
      <el-descriptions-item label="排序">{{
          post?.postSort
        }}
      </el-descriptions-item>
      <el-descriptions-item label="创建人">{{
          post?.createdUserName
        }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
          parseTime(post?.createdTime)
        }}
      </el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">{{
          post?.desc || "-"
        }}
      </el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>

<script lang="ts" setup>
import {getPostDetail} from "@/apis/system";
import {useDict} from "@/hooks/app";
import {parseTime} from "@/utils/time";

const {data: sysStatus} = useDict({dictCode: "sys_status"});

const visible = ref(false);
const postId = ref("");
const post = ref({
  deptName: "",
  postName: "",
  postCode: "",
  postStatus: "",
  postSort: "",
  createdUserName: "",
  createdTime: "",
  desc: "",
});

const getDetail = async () => {
  try {
    const res = await getPostDetail({postId: postId.value});
    Object.assign(post.value, res.data);
  } catch (error) {
    return false
  }
};

const open = async (id: string) => {
  postId.value = id;
  visible.value = true;
  await getDetail();
};

const handleClose = () => {
  visible.value = false;
};

defineExpose({open});
</script>

<style lang="scss" scoped></style>
