<template>
  <a-modal v-model:visible="visible" :title="title" width="90%" :modal-style="{ maxWidth: '520px' }"
    :mask-closable="true" @before-ok="save" @close="close">
    <a-form ref="formRef" :model="form" :rules="rules" size="medium" auto-label-width>
      <a-form-item label="上级组织" field="parentId">
        <a-tree-select v-model="form.parentId" allow-clear :data="deptList" placeholder="请选择上级组织" :field-names="{
          key: 'deptId',
          title: 'deptName',
          children: 'children',
        }"></a-tree-select>
      </a-form-item>
      <a-form-item label="组织名称" field="deptName">
        <a-input v-model.trim="form.deptName" placeholder="请输入组织名称" allow-clear :max-length="20"></a-input>
      </a-form-item>
      <a-form-item label="排序" field="deptSort">
        <a-input-number v-model="form.deptSort" placeholder="请输入组织排序" :min="1" mode="button" style="width: 120px"/>
      </a-form-item>
      <a-form-item label="状态" field="deptStatus">
        <CwrsSwitch v-model="form.deptStatus" size="medium"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { type FormInstance, Message } from '@arco-design/web-vue'
import { useResetReactive } from '@/hooks'
import { useDept } from '@/hooks/app'
import { getDeptDetail, editDept, addDept } from '@/apis/system'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const formRef = useTemplateRef('formRef')
const deptId = ref('')
const visible = ref(false)
const isEdit = computed(() => !!deptId.value)
const title = computed(() => (isEdit.value ? '编辑组织' : '新增组织'))

const { deptList, getDeptList } = useDept()

const [form, resetForm] = useResetReactive({
  deptId: '',
  parentId: '',
  deptName: '',
  deptSort: 1,
  deptStatus: '1',
})

const rules: FormInstance['rules'] = {
  deptName: [
    { required: true, message: '请输入组织名称' },
    { min: 3, max: 20, message: '长度在 3 - 20个字符' }
  ]
}

const add = async (id: string) => {
  await getDeptList()
  deptId.value = ''
  form.parentId = id
  visible.value = true
}

const edit = async (id: string) => {
  await getDeptList()
  deptId.value = id
  visible.value = true
  const res = await getDeptDetail({ deptId: id })
  Object.assign(form, res.data)
  if (form.parentId === '0') {
    form.parentId = ''
  }
}

const close = () => {
  formRef.value?.resetFields()
  resetForm()
}

const save = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return false
    form.parentId = form.parentId || '0'
    const res = isEdit.value ? await editDept(form) : await addDept(form)
    if (res) {
      Message.success(res.msg)
      emit('save-success')
      return true
    }
  } catch (error) {
    return false
  }
}

defineExpose({ add, edit })
</script>
