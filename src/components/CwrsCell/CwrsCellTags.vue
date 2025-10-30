<template>
  <template v-if="dictInfos.length > 0">
    <el-tag
        v-for="info in dictInfos"
        :key="info.itemValue"
        size="small"
        effect="dark"
        :style="{
          border: 'none',
          backgroundColor: info.itemColor || '#409EFF',
          color: '#ffffff'
        }"
        style="margin-right: 4px; margin-bottom: 4px"
    >
      {{ info.itemName }}
    </el-tag>
  </template>
  <span v-else>-</span>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue';

// 支持字符串（如 "1,2,3"）或数组或单个值
const props = defineProps<{
  value: string | number | (string | number)[]; // 保持兼容
  dict: { itemName: string; itemValue: string | number; itemColor?: string }[];
}>();

// 将 value 标准化为字符串数组
const normalizedValueArray = computed(() => {
  const { value } = props;

  if (value == null || value === '') {
    return [];
  }

  // 情况1: 已经是数组 → 转为字符串数组
  if (Array.isArray(value)) {
    return value.map(v => String(v));
  }

  // 情况2: 是字符串 → 按逗号分割（trim 空格）
  if (typeof value === 'string') {
    return value
        .split(',')
        .map(v => v.trim())
        .filter(v => v !== '');
  }

  // 情况3: 单个数字或字符串（非数组、非逗号字符串）
  return [String(value)];
});

// 根据标准化后的值查找字典项
const dictInfos = computed(() => {
  return normalizedValueArray.value
      .map(valStr => {
        // 在 dict 中查找 itemValue 匹配（支持字符串或数字比较）
        const matched = props.dict.find(
            item => String(item.itemValue) === valStr
        );
        if (matched) {
          return {
            itemName: matched.itemName,
            itemValue: matched.itemValue,
            itemColor: matched.itemColor || '#409EFF',
          };
        }
        return null;
      })
      .filter(Boolean) as { itemName: string; itemValue: string | number; itemColor: string }[];
});
</script>

<style lang="scss" scoped>
:deep(.el-tag) {
  border: none !important;
}
</style>