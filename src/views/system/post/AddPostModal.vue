<template>
  <a-modal v-model:visible="visible" :title="title" width="90%" :mask-closable="true"
           :modal-style="{ maxWidth: '600px' }" :body-style="{ maxHeight: '70vh' }" @before-ok="save" @close="close">
    <a-form ref="formRef" :model="form" :rules="rules" size="medium" auto-label-width>
      <a-form-item label="所属组织" field="deptId">
        <CwrsTreeSelect v-model="form.deptId" placeholder="请选择所属组织" />
      </a-form-item>

      <a-form-item label="岗位名称" field="postName">
        <a-input v-model.trim="form.postName" placeholder="请输入岗位名称" allow-clear
                 :max-length="20"></a-input>
      </a-form-item>

      <a-form-item label="岗位编号" field="postCode">
        <a-input v-model.trim="form.postCode" placeholder="请输入岗位编号" :disabled="isEdit" allow-clear
                 :max-length="20"></a-input>
      </a-form-item>

      <a-form-item label="描述" field="desc">
        <a-textarea v-model.trim="form.desc" :max-length="200" placeholder="请填写描述" :auto-size="{ minRows: 3 }"
                    show-word-limit/>
      </a-form-item>

      <a-form-item label="排序" field="postSort">
        <a-input-number v-model="form.postSort" placeholder="请输入排序" :min="1" mode="button" style="width: 120px"/>
      </a-form-item>

      <a-form-item label="状态" field="postStatus">
        <CwrsSwitch v-model="form.postStatus" size="medium"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {type FormInstance, Message} from '@arco-design/web-vue'
import {getPostDetail, editSysPost, addSysPost} from '@/apis/system'
import {useResetReactive} from '@/hooks'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const formRef = useTemplateRef('formRef')
const postId = ref('')
const isEdit = computed(() => !!postId.value)
const title = computed(() => (isEdit.value ? '编辑岗位' : '新增岗位'))
const visible = ref(false)

const [form, resetForm] = useResetReactive({
  postId: '',
  postName: '', // 岗位名称
  postCode: '', // 岗位编号
  postSort: 1, // 排序
  postStatus: '1', // 状态 0禁用 1启用(正常)
  deptId: '', // 组织
  desc: '', // 描述
})

const rules: FormInstance['rules'] = {
  postName: [
    {required: true, message: '请输入岗位名称'},
    {min: 1, max: 20, message: '长度在 1 - 20个字符'}
  ],
  postCode: [
    {required: true, message: '请输入岗位编号'},
    {min: 1, max: 20, message: '长度在 1 - 20个字符'}
  ],
  deptId: [{required: true, message: '请选择所属组织'}],
  postSort: [{required: true, message: '请输入排序'}],
  postStatus: [{required: true}]
}

const add = () => {
  postId.value = ''
  visible.value = true
}

const edit = async (id: string) => {
  visible.value = true
  postId.value = id
  const res = await getPostDetail({postId: id})
  Object.assign(form, res.data)
}

const close = () => {
  formRef.value?.resetFields()
  resetForm()
}

const save = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return false
    const res = isEdit.value ? await editSysPost(form) : await addSysPost(form)
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
