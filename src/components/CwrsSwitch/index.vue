<template>
  <a-switch
      v-model="localValue"
      type="round"
      :checked-value="checkedValue"
      :unchecked-value="uncheckedValue"
      :checked-text="checkedText"
      :unchecked-text="uncheckedText"
      :size="size"
  />
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue'
import {useDict} from "@/hooks/app";
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