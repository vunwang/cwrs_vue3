<template>
  <el-tree-select
      v-model="selectedValue"
      :data="deptData"
      :props="treeProps"
      :node-key="nodeKey"
      :placeholder="placeholder"
      :style="style"
      :popper-class="popperClass"
      :disabled="disabled"
      :clearable="true"
      :check-strictly="true"
      :expand-on-click-node="false"
      :default-expand-all="expandAll"
      @change="handleChange"
      @visible-change="handleVisibleChange"
      @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeptList } from '@/apis/system'

// 定义部门数据类型
interface DeptItem {
  deptId: string
  deptName: string
  children?: DeptItem[]
}

const props = defineProps({
  disabled: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
  treeProps: {
    type: Object,
    default: () => ({
      children: 'children',
      label: 'deptName',
      value: 'deptId', // ⚠️ 关键：指定 value 字段
    }),
  },
  nodeKey: { type: String, default: 'deptId' },
  placeholder: { type: String, default: '请选择所属组织' },
  style: { type: Object, default: () => ({ width: '100%' }) },
  popperClass: { type: String, default: 'tree-select-dropdown' },
  expandAll: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'change', 'load-success', 'load-fail'])

const selectedValue = ref(props.modelValue)
const deptData = ref<DeptItem[]>([])

// 同步外部 modelValue 变化
watch(
    () => props.modelValue,
    (newVal) => {
      selectedValue.value = newVal
    },
    { immediate: true }
)

// 同步内部变化到外部
watch(
    selectedValue,
    (newVal) => {
      emit('update:modelValue', newVal)
    }
)

onMounted(() => {
  getDept()
})

const getDept = async () => {
  try {
    const res = await getDeptList()
    if (res && res.data) {
      deptData.value = res.data
      emit('load-success', res.data)
    }
  } catch (error) {
    ElMessage.error('获取部门列表失败')
    emit('load-fail', error)
  }
}

const handleChange = (value: string, node: DeptItem) => {
  emit('change', value, node)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('change', '', null)
}

const handleVisibleChange = (visible: boolean) => {
  // 如果需要在每次展开时刷新或展开全部，可在此处理
  // 注意：el-tree-select 默认已支持 default-expand-all
}
</script>

<style lang="scss" scoped>
// 如果需要自定义下拉样式，可通过 popper-class 控制
// 示例：
// .tree-select-dropdown {
//   .el-tree {
//     max-height: 300px;
//     overflow: auto;
//   }
// }
</style>