<template>
  <a-drawer v-model:visible="visible" title="岗位详情" width="auto">
    <a-descriptions :column="{ xs: 1, sm: 1, md: 2 }" bordered size="large">
      <a-descriptions-item label="所属组织" :span="2">{{ post?.deptName }}</a-descriptions-item>
      <a-descriptions-item label="岗位名称">{{ post?.postName }}</a-descriptions-item>
      <a-descriptions-item label="岗位编号">{{ post?.postCode }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <CwrsCellTag :value="post?.postStatus" :dict="sysStatus"></CwrsCellTag>
      </a-descriptions-item>
      <a-descriptions-item label="排序">{{ post?.postSort }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ post?.createdUserName }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ parseTime(post?.createdTime) }}</a-descriptions-item>
      <a-descriptions-item label="描述" :span="2">{{ post?.desc }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script lang="ts" setup>
import { getPostDetail } from '@/apis/system'
import {useDict} from "@/hooks/app";
import {parseTime} from "@/utils/time";

const {data: sysStatus} = useDict({dictCode: 'sys_status'})

const visible = ref(false)
const postId = ref('')
const post = ref({
  deptName: '',
  postName: '',
  postCode: '',
  postStatus: '',
  postSort: '',
  createdUserName: '',
  createdTime: '',
  desc: '',
})
const getDetail = async () => {
  const res = await getPostDetail({ postId: postId.value })
  Object.assign(post.value, res.data)
}

const open = async (id: string) => {
  postId.value = id
  visible.value = true
  await getDetail()
}

defineExpose({ open })
</script>

<style lang="scss" scoped></style>
