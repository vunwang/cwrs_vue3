<template>
  <a-select v-model="localValue" :style="{ width: width + 'px' }" :placeholder="placeholder" allow-clear :allow-search="allowSearch">
    <a-option v-for="item of options" :value="item.itemValue" :label="item.itemName" :disabled="item.itemStatus == '0'"/>
  </a-select>
</template>

<script lang="ts" setup>
import {defineProps, defineEmits, computed} from 'vue'

const props = defineProps<{
  modelValue: string
  options: { itemName: string; itemValue: string; itemStatus?: string }[]
  width?: number
  placeholder?: string
  allowSearch?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>