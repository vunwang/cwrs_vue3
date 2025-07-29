<template>
  <a-modal v-model:visible="visible" :title="title" width="90%" :mask-closable="true"
    :modal-style="{ maxWidth: '520px' }" @before-ok="save" @close="close">
    <a-spin :loading="loading" class="w-full">
      <a-form ref="formRef" :model="form" :rules="rules" size="medium" auto-label-width>
        <a-form-item label="字典名" field="itemName">
          <a-input v-model.trim="form.itemName" placeholder="请输入字典名" allow-clear :max-length="20"></a-input>
        </a-form-item>
        <a-form-item label="字典值" field="itemValue">
          <a-input v-model.trim="form.itemValue" placeholder="请输入字典值" allow-clear :max-length="20"></a-input>
        </a-form-item>
        <a-form-item label="描述" field="desc">
          <a-textarea v-model.trim="form.desc" placeholder="请填写描述" :max-length="200" show-word-limit
                      :auto-size="{ minRows: 3, maxRows: 5 }"/>
        </a-form-item>
        <a-form-item label="排序" field="itemSort">
          <a-input-number v-model="form.itemSort" placeholder="请输入排序" :min="1" mode="button" style="width: 120px" />
        </a-form-item>
        <a-form-item label="颜色" field="itemColor">
          <a-color-picker v-model="form.itemColor" defaultValue="#F1590E" showText disabledAlpha showPreset/>
        </a-form-item>
        <a-form-item label="状态" field="itemStatus">
          <CwrsSwitch v-model="form.itemStatus" size="medium" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { type FormInstance, Message } from '@arco-design/web-vue'
import { getDictItemDetail, addDictItem, editDictItem } from '@/apis/system'
import { useResetReactive } from '@/hooks'
import * as Regexp from "@/utils/regexp";
import {useDict} from "@/hooks/app";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const formRef = useTemplateRef('formRef')
const dictItemId = ref('')
const isEdit = computed(() => !!dictItemId.value)
const title = computed(() => (isEdit.value ? '编辑字典数据' : '新增字典数据'))
const visible = ref(false)
const loading = ref(false)

const [form, resetForm] = useResetReactive({
  dictItemId: '',
  dictCode: '',
  itemName: '',
  itemValue: '',
  itemColor: '#F1590E',
  itemStatus: '1',
  itemSort: 1,
  desc: ''
})

const rules: FormInstance['rules'] = {
  itemName: [{ required: true, message: '请输入字典名' }],
  itemValue: [
    { required: true, message: '请输入字典值' },
    { match: Regexp.EnNumAndUnderline, message: '格式不对！只能包含英文数字下划线' }
  ],
  itemSort: [{ required: true, message: '请输入排序' }],
  itemColor: [{ required: true }],
  itemStatus: [{ required: true }]
}

const add = (dictCode: string) => {
  dictItemId.value = ''
  form.dictCode = dictCode
  visible.value = true
}

const edit = async (id: string) => {
  visible.value = true
  dictItemId.value = id
  loading.value = true
  const res = await getDictItemDetail({dictItemId: id})
  // 只复制 res.data 中与 form 已有字段相同的属性
  Object.assign(form, _.pick(res.data, Object.keys(form)))
  loading.value = false
}

const close = () => {
  formRef.value?.resetFields()
  resetForm()
}

const save = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return false
    const res = isEdit.value ? await editDictItem(form) : await addDictItem(form)
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
