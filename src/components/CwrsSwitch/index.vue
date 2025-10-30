<template>
  <el-switch
      v-model="localValue"
      :active-value="checkedValue"
      :inactive-value="uncheckedValue"
      :active-text="checkedText"
      :inactive-text="uncheckedText"
      :size="size"
      inline-prompt
  />
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue'
import {useDict} from "@/hooks/app";
import {hasPerm} from "@/utils/has";
const { data: sysStatus } = useDict({ dictCode: 'sys_status' })

const props = defineProps<{
  size: string
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const checkedText = computed(() => sysStatus.value[0]?.itemName || '')
const uncheckedText = computed(() => sysStatus.value[1]?.itemName || '')

// 固定 checked-value 和 unchecked-value
const checkedValue = computed(() => sysStatus.value[0]?.itemValue ?? '')
const uncheckedValue = computed(() => sysStatus.value[1]?.itemValue ?? '')

</script>