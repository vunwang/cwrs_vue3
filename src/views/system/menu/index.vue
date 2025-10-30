<template>
  <el-card title="菜单管理" class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">菜单管理</div>
      </div>
    </template>
    <el-tabs
        v-model="activeName"
        type="card"
        class="demo-tabs"
    >
      <el-tab-pane label="平台菜单" name="first">
        <Platform/>
      </el-tab-pane>
      <!--      <el-tab-pane label="APP菜单" name="second">-->
      <!--        <AppMenu />-->
      <!--      </el-tab-pane>-->
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import Platform from "./platform.vue";
import AppMenu from "./appMenu.vue";

const activeName = ref("first");
defineOptions({name: "SystemMenu"});
</script>

<style lang="scss" scoped>
:deep(.arco-tabs-content) {
  padding: 10px;
}
</style>
