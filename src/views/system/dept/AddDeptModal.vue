<template>
  <el-dialog
      v-model="visible"
      :title="title"
      width="90%"
      :style="{ maxWidth: '520px' }"
      @close="close"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">{{ title }}</span>
      </div>
    </template>
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="left"
        label-width="auto"
        size="default"
    >
      <el-form-item label="上级组织" prop="parentId">
        <DeptTreeSelect
            v-model="form.parentId"
            placeholder="请选择上级组织"
        />
      </el-form-item>

      <el-form-item label="组织名称" prop="deptName">
        <el-input
            v-model.trim="form.deptName"
            placeholder="请输入组织名称"
            clearable
            :maxlength="20"
        />
      </el-form-item>

      <el-form-item label="排序" prop="deptSort">
        <el-input-number
            v-model="form.deptSort"
            placeholder="请输入组织排序"
            :min="1"
            controls-position="right"
            style="width: 120px"
        />
      </el-form-item>

      <el-form-item label="状态" prop="deptStatus">
        <CwrsSwitch v-model="form.deptStatus" size="default"/>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, computed, nextTick} from 'vue'
import {ElMessage} from 'element-plus'
import {useResetReactive} from '@/hooks'
import {getDeptDetail, editDept, addDept} from '@/apis/system'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const formRef = ref()
const deptId = ref('')
const visible = ref(false)
const isEdit = computed(() => !!deptId.value)
const title = computed(() => (isEdit.value ? '编辑组织' : '新增组织'))

const [form, resetForm] = useResetReactive({
  deptId: '',
  parentId: '',
  deptName: '',
  deptSort: 1,
  deptStatus: '1',
})

const rules = {
  deptName: [
    {required: true, message: '请输入组织名称', trigger: 'blur'},
    {min: 3, max: 20, message: '长度在 3 - 20 个字符', trigger: 'blur'},
  ],
}

const add = async (id: string) => {
  deptId.value = ''
  form.parentId = id
  visible.value = true
}

const edit = async (id: string) => {
  try {
    deptId.value = id
    visible.value = true
    // 等待弹窗打开后再赋值（避免 formRef 未挂载）
    nextTick(async () => {
      const res = await getDeptDetail({deptId: id})
      Object.assign(form, res.data)
      if (form.parentId === '0') {
        form.parentId = ''
      }
    })
  } catch (error) {
    return false
  }
}

const close = () => {
  formRef.value?.resetFields()
  resetForm()
  visible.value = false
}

const save = async () => {
  try {
    await formRef.value?.validate()
    const submitData = {
      ...form,
      parentId: form.parentId || '0',
    }
    const res = isEdit.value ? await editDept(submitData) : await addDept(submitData)
    if (res) {
      ElMessage.success(res.msg)
      emit('save-success')
      close()
    }
  } catch (error) {
    return false
  }
}

defineExpose({add, edit})
</script>