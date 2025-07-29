<template>
  <a-card title="字典管理" class="gi_page_card">
    <a-row justify="space-between">
      <a-space wrap>
        <a-button type="primary" @click="onAdd">
          <template #icon>
            <icon-plus/>
          </template>
          <span>新增</span>
        </a-button>
        <a-button status="danger" @click="onMulDelete">
          <template #icon>
            <icon-delete/>
          </template>
          <span>删除</span>
        </a-button>
        <!-- 确认框 -->
        <a-modal v-model:visible="isConfirmVisible" width="300px" title="确认删除" @ok="handleDelete" @cancel="handleCancel">
          <p>确定要删除选中的数据吗？</p>
        </a-modal>
      </a-space>

      <a-space wrap>
        <a-input-group>
          <CwrsSelect v-model="form.dictStatus" :options="sysStatus" :width="120" placeholder="状态"/>
          <a-input v-model="form.dictName" placeholder="字典类型名称/编码" allow-clear style="width: 250px">
            <template #prefix>
              <icon-search/>
            </template>
          </a-input>
        </a-input-group>
        <a-button type="primary" @click="search">
          <template #icon>
            <icon-search/>
          </template>
          <span>查询</span>
        </a-button>
        <a-button @click="reset">
          <template #icon>
            <icon-refresh/>
          </template>
          <span>重置</span>
        </a-button>
      </a-space>
    </a-row>

    <a-table class="gi_table" row-key="dictId" :data="dictList" :bordered="{ cell: true }" :loading="loading"
             :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination"
             :row-selection="{ type: 'checkbox', showCheckedAll: true }" :selected-keys="selectedKeys" @select="select"
             @select-all="selectAll">
      <template #columns>
        <a-table-column title="序号" :width="64">
          <template #cell="cell">{{ cell.rowIndex + 1 }}</template>
        </a-table-column>
        <a-table-column title="字典名称" data-index="dictName"></a-table-column>
        <a-table-column title="字典编码" data-index="dictCode"></a-table-column>
        <a-table-column title="状态" :width="100" align="center" :ellipsis="true">
          <template #cell="{ record }">
            <CwrsCellTag :value="record.dictStatus" :dict="sysStatus"></CwrsCellTag>
          </template>
        </a-table-column>
        <a-table-column title="排序" data-index="dictSort" :width="80"></a-table-column>
        <a-table-column title="描述" data-index="desc" :ellipsis="true" :tooltip="true"></a-table-column>
        <a-table-column title="创建时间" data-index="createdTime" :width="180">
          <template #cell="cell">{{ parseTime(cell.record.createdTime) }}</template>
        </a-table-column>
        <a-table-column title="操作" :width="280" align="center" :fixed="fixed">
          <template #cell="{ record }">
            <a-space>
              <a-button status="success" size="mini" @click="onViewDictData(record)">
                <template #icon>
                  <icon-storage/>
                </template>
                <span>数据</span>
              </a-button>
              <a-button type="primary" size="mini" @click="onEdit(record)">
                <template #icon>
                  <icon-edit/>
                </template>
                <span>编辑</span>
              </a-button>
              <a-popconfirm type="warning" style="width: 180px" content="确定删除该字典吗?" @ok="onDelete(record)">
                <a-button status="danger" size="mini">
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
    <AddDictModal ref="AddDictModalRef" @save-success="search"></AddDictModal>
    <DictDataModal ref="DictDataModalRef"></DictDataModal>
  </a-card>
</template>

<script setup lang="ts">
import {Message} from '@arco-design/web-vue'
import AddDictModal from './AddDictModal.vue'
import DictDataModal from './DictDataModal/index.vue'
import {useTable} from '@/hooks'
import {useDict} from '@/hooks/app'
import {delDict, getDictList} from '@/apis/system'
import {parseTime} from "@/utils/time";

defineOptions({name: 'SystemRole'})

const {data: sysStatus} = useDict({dictCode: 'sys_status'})
const AddDictModalRef = useTemplateRef('AddDictModalRef')
const DictDataModalRef = useTemplateRef('DictDataModalRef')

const form = reactive({
  pageNum: 1,
  pageSize: 10,
  dictName: '',
  dictStatus: ''
})

const {
  loading,
  tableData: dictList,
  pagination,
  search,
  select,
  selectAll,
  selectedKeys,
  fixed
} = useTable(() => getDictList(form), {immediate: true, rowKey: 'dictId'})

const reset = () => {
  form.dictName = ''
  form.dictStatus = ''
  search()
}

// 批量删除
const isConfirmVisible = ref(false);
const onMulDelete = async () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择字典！')
  }
  isConfirmVisible.value = true;
}

// 删除
const handleDelete = async () => {
  const dictIds = Object.values(selectedKeys.value).toString()
  const res = await delDict({dictIds: dictIds})
  if (res) {
    Message.success(res.msg)
    search()
  }
};

// 取消删除
const handleCancel = () => {
  Message.info('已取消删除');
  isConfirmVisible.value = false;
};

const onAdd = () => {
  AddDictModalRef.value?.add()
}

const onEdit = (item: any) => {
  AddDictModalRef.value?.edit(item.dictId)
}

const onDelete = async (item: any) => {
  const res = await delDict({dictIds: item.dictId})
  if (res) {
    Message.success(res.msg)
    search()
  }
}

const onViewDictData = (item: any) => {
  DictDataModalRef.value?.open({dictCode: item.dictCode})
}
</script>

<style lang="scss" scoped></style>
