<template>
  <el-tag
      v-if="dictInfo"

      size="small"
      effect="dark"
      :style="{
      border: 'none',
      backgroundColor: dictInfo.itemColor || '#409EFF',
      color: '#ffffff'
    }"
  >
    {{ dictInfo.itemName }}
  </el-tag>
</template>

<script lang="ts" setup>
import {computed, defineProps} from 'vue';

// 定义组件接收的属性类型
const props = defineProps<{
  value: number | string
  dict: { itemName: string; itemValue: string | number; itemColor?: string }[]
}>()


// 计算属性，根据状态查找对应的字典项
const dictInfo = computed(() => {
  const item = props.dict.find(item => item.itemValue === props.value);
  if (!item) return null;

  return {
    itemName: item.itemName,
    itemColor: item.itemColor || 'arcoblue',
  };
});
</script>

<style lang="scss" scoped>
:deep(.el-tag) {
  border: none !important;
}
</style>