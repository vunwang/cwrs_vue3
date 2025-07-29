<template>
  <a-modal v-model:visible="visible" :title="title" width="90%" :modal-style="{ maxWidth: '625px' }"
           :body-style="{ maxHeight: '70vh' }" :mask-closable="true" @before-ok="save" @close="close">
    <a-form ref="formRef" :model="form" auto-label-width>
      <a-form-item label="上级菜单" field="parentId">
        <a-tree-select v-model="form.parentId" placeholder="请选择上级菜单" allow-clear allow-search
                       :data="menuSelectTree" :field-names="{
            key: 'menuId',
            title: 'title',
            children: 'children',
          }"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {type FormInstance, Message} from '@arco-design/web-vue'
import {mapTree} from 'xe-utils'
import type {MenuForm} from './type'
import {editMenus} from '@/apis/system'
import {filterTree} from '@/utils'
import {useResetReactive} from '@/hooks'

interface Props {
  menus: any[]
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => []
})

const emit = defineEmits<{
  (e: 'edit-success'): void
}>()

const menuSelectTree = computed(() => {
  const menus = JSON.parse(JSON.stringify(props.menus))
  const data = filterTree(menus, (i) => ['1', '2'].includes(i.type))
  const arr = mapTree(data, (i) => ({
    menuId: i.menuId,
    title: i.title,
    children: i.children
  }))
  return arr
})

const formRef = useTemplateRef('formRef')
const visible = ref(false)
const title = '批量编辑菜单'

const [form, resetForm] = useResetReactive<MenuForm>({
  parentId: '',
  menuIds: [],
})

const edits = async (menuIds: string[]) => {
  visible.value = true
  form.menuIds = menuIds
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
    const res = await editMenus(form)
    if (res) {
      Message.success(res.msg)
      emit('edit-success')
      return true
    }
  } catch (error) {
    return false
  }
}

defineExpose({edits})
</script>
