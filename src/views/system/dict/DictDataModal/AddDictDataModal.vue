<template>
  <el-dialog v-model="visible" :title="title" width="520px" :close-on-click-modal="true"
             @close="close">
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">{{ title }}</span>
      </div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名" prop="itemName">
        <el-input v-model.trim="form.itemName" placeholder="请输入字典名" clearable :maxlength="50"></el-input>
      </el-form-item>
      <el-form-item label="字典值" prop="itemValue">
        <el-input v-model="form.itemValue" :disabled="isEdit" placeholder="请输入字典值" clearable
                  :maxlength="50"></el-input>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="颜色" prop="itemColor">
            <el-color-picker v-model="form.itemColor" show-alpha :predefine="predefineColors"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="itemStatus">
            <CwrsSwitch
                v-model="form.itemStatus"
                size="default"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="排序" prop="itemSort">
            <el-input-number v-model="form.itemSort" placeholder="请输入排序" :min="1" controls-position="right"
                             style="width: 120px"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="下拉菜单" prop="itemSelect">
            <el-switch
                v-model="form.itemSelect"
                active-value="1"
                inactive-value="0"
                active-text="显示"
                inactive-text="隐藏"
                inline-prompt
            />
          </el-form-item>
        </el-col>
      </el-row>
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
import {getDictItemDetail, addDictItem, editDictItem} from '@/apis/system'
import {useResetReactive} from '@/hooks'
import * as Regexp from "@/utils/regexp";
import {useDict} from "@/hooks/app";
import {hasPerm} from "@/utils/has";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const formRef = useTemplateRef<FormInstance>('formRef')
const dictItemId = ref('')
const isEdit = computed(() => !!dictItemId.value)
const title = computed(() => (isEdit.value ? '编辑字典项数据' : '新增字典项数据'))
const visible = ref(false)
const loading = ref(false)

// 预定义颜色
const predefineColors = [
  '#F1590E',
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  '#ff1493',
  '#ff69b4'
]

const [form, resetForm] = useResetReactive({
  dictItemId: '',
  dictCode: '',
  itemName: '',
  itemValue: '',
  itemColor: '#F1590E',
  itemStatus: '1',
  itemSelect: '1',
  itemSort: 1,
})

const rules = {
  itemName: [{required: true, message: '请输入字典名', trigger: 'blur'}],
  itemValue: [
    {required: true, message: '请输入字典值', trigger: 'blur'},
  ],
  itemSort: [{required: true, message: '请输入排序', trigger: 'blur'}],
  itemColor: [{required: true, message: '请选择颜色', trigger: 'change'}],
  itemStatus: [{required: true, message: '请选择状态', trigger: 'change'}],
  itemSelect: [{required: true, message: '请选择下拉菜单状态', trigger: 'change'}]
}

const add = (dictCode: string) => {
  dictItemId.value = ''
  form.dictCode = dictCode
  visible.value = true
}

const edit = async (id: string) => {
  try {
    visible.value = true
    dictItemId.value = id
    loading.value = true
    const res = await getDictItemDetail({dictItemId: id})
    // 只复制 res.data 中与 form 已有字段相同的属性
    Object.assign(form, _.pick(res.data, Object.keys(form)))
    loading.value = false
  } catch (error) {
    loading.value = false
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

    const res = isEdit.value ? await editDictItem(form) : await addDictItem(form)
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
