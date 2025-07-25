<template>
  <a-modal v-model:visible="visible" title="字典数据" width="60%" hide-cancel ok-text="关闭" :mask-closable="false">
    <a-row>
      <a-space wrap>
        <a-button type="primary" @click="onAdd">
          <template #icon>
            <icon-plus/>
          </template>
          <span>新增</span>
        </a-button>
        <a-button type="primary" status="danger" @click="onMulDelete">
          <template #icon>
            <icon-delete/>
          </template>
          <span>删除</span>
        </a-button>
      </a-space>
    </a-row>

    <a-table row-key="id" size="small" :data="tableData" :bordered="{ cell: true }" :loading="loading"
             :scroll="{ x: '100%', y: '100%', minWidth: 600 }" :pagination="{ ...pagination, size: 'small' }"
             :row-selection="{ type: 'checkbox', showCheckedAll: true }" :selected-keys="selectedKeys" @select="select"
             @select-all="selectAll">
      <template #columns>
        <a-table-column title="序号" :width="64">
          <template #cell="cell">{{ cell.rowIndex + 1 }}</template>
        </a-table-column>
        <a-table-column title="字典名" data-index="itemName"></a-table-column>
        <a-table-column title="字典值" data-index="itemValue"></a-table-column>
        <a-table-column title="状态" :width="100" align="center">
          <template #cell="{ record }">
            <GiCellTag :value="record.itemStatus" :dict="sysStatus"></GiCellTag>
          </template>
        </a-table-column>
        <a-table-column title="操作" :width="180" align="center">
          <template #cell="{ record }">
            <a-space>
              <a-button type="primary" size="mini" @click="onEdit(record)">
                <template #icon>
                  <icon-edit/>
                </template>
                <span>编辑</span>
              </a-button>
              <a-popconfirm type="warning" style="width: 200px" content="确定删除该字典项吗?" @ok="onDelete(record)">
                <a-button type="primary" status="danger" size="mini">
                  <template #icon>
                    <icon-delete/>
                  </template>
                  <span>删除</span>
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <AddDictDataModal ref="AddDictDataModalRef" @save-success="search"></AddDictDataModal>
  </a-modal>
</template>

<script lang="ts" setup>
import {Message} from '@arco-design/web-vue'
import AddDictDataModal from './AddDictDataModal.vue'
import {delDictItem, getDictDataList} from '@/apis/system'
import {useTable} from '@/hooks'

const visible = ref(false)
const AddDictDataModalRef = useTemplateRef('AddDictDataModalRef')

import {useDictStore} from "@/stores";
const dictStore = useDictStore()
const sysStatus = dictStore.getDictOptions('sys_status')

const dictCode = ref('')

const {loading, tableData, pagination, selectedKeys, search, select, selectAll} = useTable(
    (page) => getDictDataList({...page, dictCode: dictCode.value}),
    {immediate: false}
)

const open = (data: { dictCode: string }) => {
  tableData.value = []
  dictCode.value = data.dictCode
  visible.value = true
  search()
}

// 批量删除
const onMulDelete = () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择字典数据！')
  }
}

const onDelete = async (item: DictDataItem) => {
  const res = await delDictItem({ dictItemId: item.dictItemId })
  if (res) {
    Message.success(res.msg)
    search()
  }
}

const onAdd = () => {
  AddDictDataModalRef.value?.add(dictCode.value)
}

const onEdit = (item: DictDataItem) => {
  AddDictDataModalRef.value?.edit(item.dictItemId)
}

defineExpose({open})
</script>

<style lang="scss" scoped></style>
