<template>
  <a-tree-select v-model="localValue" :data="deptSelectList" :style="{ width: width + 'px' }" :placeholder="placeholder" :field-names="{
          key: 'deptId',
          title: 'deptName',
          children: 'children'
        }" allow-clear allow-search :filter-tree-node="filterTreeNode"/>
</template>

<script lang="ts" setup>
import {defineProps, defineEmits, computed} from 'vue'
import {useDept} from '@/hooks/app'

const {deptSelectList, getDeptList} = useDept()
getDeptList()

const props = defineProps<{
  modelValue: string
  width?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filterTreeNode = (searchValue: string, nodeData: any) => {
  return nodeData.deptName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
}
</script>