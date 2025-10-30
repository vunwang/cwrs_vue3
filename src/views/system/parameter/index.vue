<template>
  <el-card class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">系统参数管理</div>
      </div>
    </template>
    <!-- 添加v-if控制组件是否渲染 -->
    <Xtcs/>
  </el-card>
</template>

<script setup lang="ts">
import {ref} from "vue";
import Xtcs from "./xtcs.vue";

// 标签页激活状态
const activeName = ref("first");
defineOptions({name: "SystemParameter"});
</script>

<style lang="scss" scoped></style>
