<template>
  <el-select
      v-model="localValue"
      :style="{ width: width + 'px' }"
      :placeholder="placeholder"
      clearable
      :filterable="allowSearch"
      :popper-append-to-body="false"
  >
    <el-option
        v-for="item in filteredOptions"
        :key="item.itemValue"
        :value="item.itemValue"
        :label="item.itemName"
        :disabled="item.itemStatus === '0'"
    />
  </el-select>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps<{
  modelValue: string
  options: { itemName: string; itemValue: string; itemSelect?: string; itemStatus?: string }[]
  width?: number
  placeholder?: string
  allowSearch?: boolean
}>()

const filteredOptions = computed(() => {
  return props.options.filter(item => item.itemSelect !== '0')
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>