<template>
  <a-modal v-model:visible="visible" :title="title" width="90%" :mask-closable="true"
           :modal-style="{ maxWidth: '600px' }" :body-style="{ maxHeight: '70vh' }" @before-ok="save" @close="close">
    <a-form ref="formRef" :model="form" :rules="rules" size="medium" auto-label-width>
      <a-form-item label="旧密码" field="oldPwd">
        <a-input-password v-model.trim="form.oldPwd" placeholder="请输入旧密码" allow-clear>
          <template #prefix>
            <icon-lock :stroke-width="1" :style="{ fontSize: '20px' }"/>
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item label="新密码" field="newPwd">
        <a-input-password v-model.trim="form.newPwd" placeholder="请输入新密码" allow-clear>
          <template #prefix>
            <icon-lock :stroke-width="1" :style="{ fontSize: '20px' }"/>
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item label="确认密码" field="confirmPwd">
        <a-input-password v-model.trim="form.confirmPwd" placeholder="请输入确认密码" allow-clear>
          <template #prefix>
            <icon-lock :stroke-width="1" :style="{ fontSize: '20px' }"/>
          </template>
        </a-input-password>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {type FormInstance, Message} from '@arco-design/web-vue'
import {editPassword} from '@/apis/system'
import {useResetReactive} from '@/hooks'
import * as Regexp from "@/utils/regexp";

const formRef = useTemplateRef('formRef')
const title = ref('修改密码')
const visible = ref(false)

const [form, resetForm] = useResetReactive({
  oldPwd: '',
  newPwd: '',
  confirmPwd: '',
})

// 定义一个自定义校验函数，用于检查新密码和确认密码是否一致
const validateConfirmPwd = (value, callback) => {
  // 注意：这里直接比较 form.newPwd 和 value (即 confirmPwd)
  if (value !== form.newPwd) {
    callback('两次输入的密码不一致');
  }
  callback(); // 返回空字符串表示校验通过
};

const rules: FormInstance['rules'] = {
  oldPwd: [
    {required: true, message: '请输入旧密码'},
  ],
  newPwd: [
    {required: true, message: '请输入新密码'},
    {match: Regexp.EnNum, message: '密码只能英文字母、数字组成'}
  ],
  confirmPwd: [
    {required: true, message: '请输入确认密码'},
    {match: Regexp.EnNum, message: '密码只能英文字母、数字组成'},
    { validator: validateConfirmPwd }
  ]
}

const open = () => {
  visible.value = true
}

const close = () => {
  formRef.value?.resetFields()
  resetForm()
}

const save = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return false
    const res = await editPassword(form)
    if (res) {
      Message.success(res.msg)
      close()
      return true
    }
  } catch (error) {
    return false
  }
}

defineExpose({open})
</script>
