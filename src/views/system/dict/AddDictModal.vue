<template>
  <el-dialog v-model="visible" :title="title" width="520px" :close-on-click-modal="true"
             @close="close">
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">{{ title }}</span>
      </div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model.trim="form.dictName" placeholder="请输入字典名称" clearable :maxlength="50"></el-input>
      </el-form-item>
      <el-form-item label="字典编码" prop="dictCode">
        <el-input v-model.trim="form.dictCode" placeholder="请输入字典编码" :disabled="isEdit" clearable
                  :maxlength="20"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="desc">
        <el-input v-model="form.desc" type="textarea" placeholder="请填写描述" :maxlength="200" show-word-limit
                  :rows="3"/>
      </el-form-item>
      <el-form-item label="排序" prop="dictSort">
        <el-input-number v-model="form.dictSort" placeholder="请输入排序" :min="1" controls-position="right"
                         style="width: 120px"/>
      </el-form-item>
      <el-form-item label="状态" prop="dictStatus">
        <CwrsSwitch
            v-model="form.dictStatus"
            size="default"
            :disabled="!hasPerm('sys:dictItem:itemStatus')"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import _ from 'lodash';
import {ElMessage} from 'element-plus'
import type {FormInstance} from 'element-plus'
import * as Regexp from '@/utils/regexp'
import {useResetReactive} from '@/hooks'
import {getDictDetail, addDict, editDict} from '@/apis/system'
import {useDict} from "@/hooks/app";
import {hasPerm} from "@/utils/has";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const formRef = useTemplateRef<FormInstance>('formRef')
const dictId = ref('')
const isEdit = computed(() => !!dictId.value)
const title = computed(() => (isEdit.value ? '编辑字典' : '新增字典'))
const visible = ref(false)

const {data: sysStatus} = useDict({dictCode: 'sys_status'})

const [form, resetForm] = useResetReactive({
  dictId: '',
  dictName: '',
  dictCode: '',
  dictSort: 1,
  dictStatus: '1',
  desc: ''
})

const rules = {
  dictName: [{required: true, message: '请输入字典名称', trigger: 'blur'}],
  dictCode: [
    {required: true, message: '请输入字典编码', trigger: 'blur'},
    {pattern: Regexp.EnAndUnderline, message: '格式不正确！只能是英文下划线', trigger: 'blur'}
  ],
}

const add = () => {
  dictId.value = ''
  visible.value = true
}

const edit = async (id: string) => {
  try {
    dictId.value = id
    visible.value = true
    const res = await getDictDetail({dictId: id})
    // 只复制 res.data 中与 form 已有字段相同的属性
    Object.assign(form, _.pick(res.data, Object.keys(form)))
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
    const valid = await formRef.value?.validate()
    if (!valid) return

    const res = isEdit.value ? await editDict(form) : await addDict(form)
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
