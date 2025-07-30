<template>
  <a-modal v-model:visible="visible" :title="title" width="90%" :mask-closable="true"
           :modal-style="{ maxWidth: '520px' }" @before-ok="save" @close="close">
    <a-form ref="formRef" :model="form" :rules="rules" size="medium" auto-label-width>
      <a-form-item label="字典名称" field="dictName">
        <a-input v-model.trim="form.dictName" placeholder="请输入字典名称" allow-clear :max-length="50"></a-input>
      </a-form-item>
      <a-form-item label="字典编码" field="dictCode">
        <a-input v-model.trim="form.dictCode" placeholder="请输入字典编码" :disabled="isEdit" allow-clear
                 :max-length="20"></a-input>
      </a-form-item>
      <a-form-item label="描述" field="desc">
        <a-textarea v-model.trim="form.desc" placeholder="请填写描述" :max-length="200" show-word-limit
                    :auto-size="{ minRows: 3, maxRows: 5 }"/>
      </a-form-item>
      <a-form-item label="排序" field="dictSort">
        <a-input-number v-model="form.dictSort" placeholder="请输入排序" :min="1" mode="button" style="width: 120px"/>
      </a-form-item>
      <a-form-item label="状态" field="dictStatus">
        <CwrsSwitch v-model="form.dictStatus" size="medium"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import _ from 'lodash';
import {type FormInstance, Message} from '@arco-design/web-vue'
import * as Regexp from '@/utils/regexp'
import {useResetReactive} from '@/hooks'
import {getDictDetail, addDict, editDict} from '@/apis/system'
import {useDict} from "@/hooks/app";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const formRef = useTemplateRef('formRef')
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

const rules: FormInstance['rules'] = {
  dictName: [{required: true, message: '请输入字典名称'}],
  dictCode: [
    {required: true, message: '请输入字典编码'},
    {match: Regexp.EnAndUnderline, message: '格式不正确！只能是英文下划线'}
  ],
  dictSort: [{required: true, message: '请输入排序'}],
  dictStatus: [{required: true}]
}

const add = () => {
  dictId.value = ''
  visible.value = true
}

const edit = async (id: string) => {
  dictId.value = id
  visible.value = true
  const res = await getDictDetail({dictId: id})
  // 只复制 res.data 中与 form 已有字段相同的属性
  Object.assign(form, _.pick(res.data, Object.keys(form)))
}

const close = () => {
  formRef.value?.resetFields()
  resetForm()
}

const save = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return false
    const res = isEdit.value ? await editDict(form) : await addDict(form)
    if (res) {
      Message.success(res.msg)
      emit('save-success')
      return true
    }
  } catch (error) {
    return false
  }
}

defineExpose({add, edit})
</script>
