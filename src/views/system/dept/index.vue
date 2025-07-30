<template>
  <a-card title="组织管理" class="gi_page_card">
    <a-row justify="space-between">
      <a-space wrap>
        <a-button type="primary" v-hasPerm="['sys:dept:add']" @click="onAdd">
          <template #icon>
            <icon-plus/>
          </template>
          <span>新增</span>
        </a-button>
        <a-button status="danger" v-hasPerm="['sys:dept:del']" @click="onMulDelete">
          <template #icon>
            <icon-delete/>
          </template>
          <span>删除</span>
        </a-button>
        <!-- 确认框 -->
        <a-modal v-model:visible="isConfirmVisible" width="300px" title="确认删除" @ok="handleDelete"
                 @cancel="handleCancel">
          <p>确定要删除选中的数据吗？</p>
        </a-modal>
      </a-space>

      <a-space wrap>
        <a-input-group>
          <CwrsSelect v-model="form.deptStatus" :options="sysStatus" :width="120" placeholder="状态" allow-clear />
          <a-input v-model="form.deptName" placeholder="输入组织名称搜索" allow-clear style="width: 250px">
            <template #prefix>
              <icon-search/>
            </template>
          </a-input>
        </a-input-group>
        <a-button type="primary" @click="search">
          <template #icon>
            <icon-search/>
          </template>
          <span>搜索</span>
        </a-button>
        <a-button @click="reset">
          <template #icon>
            <icon-refresh/>
          </template>
          <span>重置</span>
        </a-button>
      </a-space>
    </a-row>

    <a-table ref="tableRef" class="gi_table" row-key="deptId" :data="deptList" :loading="loading"
             :bordered="{ cell: true }"
             :scroll="{ x: '100%', y: '100%', minWidth: 1700 }" :pagination="false"
             :row-selection="{ type: 'checkbox', showCheckedAll: false }" :selected-keys="selectedKeys"
             @select="select" @select-all="selectAll">
      <template #expand-icon="{ expanded }">
        <IconDown v-if="expanded"/>
        <IconRight v-else/>
      </template>
      <template #columns>
        <a-table-column title="组织名称" data-index="deptName"></a-table-column>
        <a-table-column title="排序" data-index="deptSort" :width="100" align="center"></a-table-column>
        <a-table-column title="状态" :width="100" align="center">
          <template #cell="{ record }">
            <CwrsCellTag :value="record.deptStatus" :dict="sysStatus"></CwrsCellTag>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createdTime" :width="180">
          <template #cell="{record}">{{ parseTime(record.createdTime) }}</template>
        </a-table-column>
        <a-table-column title="操作" :width="280" align="center" :fixed="fixed">
          <template #cell="{ record }">
            <a-space>
              <a-button status="warning" v-hasPerm="['sys:dept:add']" size="mini" @click="onAdd(record)">
                <template #icon>
                  <icon-plus/>
                </template>
                <span>新增</span>
              </a-button>
              <a-button type="primary" v-hasPerm="['sys:dept:edit']" size="mini" @click="onEdit(record)">
                <template #icon>
                  <icon-edit/>
                </template>
                <span>编辑</span>
              </a-button>
              <a-popconfirm type="warning" content="确定删除该组织吗?" @ok="onDelete(record)">
                <a-button status="danger" v-hasPerm="['sys:dept:del']" size="mini">
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

    <AddDeptModal ref="AddDeptModalRef" @save-success="search"></AddDeptModal>
  </a-card>
</template>

<script setup lang="ts">
import {Message} from '@arco-design/web-vue'
import AddDeptModal from './AddDeptModal.vue'
import {useTable} from '@/hooks'
import {delDept, delMenu, type DeptItem, getDeptList} from '@/apis/system'
import {useDict} from '@/hooks/app'
import {parseTime} from "@/utils/time";

defineOptions({name: 'SystemDept'})

const {data: sysStatus} = useDict({dictCode: 'sys_status'})

const {data: options} = useDict({code: 'status'})
const AddDeptModalRef = useTemplateRef('AddDeptModalRef')
const tableRef = useTemplateRef('tableRef')

const form = reactive({
  deptName: '',
  deptStatus: ''
})

const {
  loading,
  tableData: deptList,
  selectedKeys,
  search,
  select,
  selectAll,
  fixed
} = useTable(() => getDeptList(form), {
  immediate: true, rowKey: 'deptId',
  onSuccess: () => {
    nextTick(() => {
      tableRef.value?.expandAll(true)
    })
  }
})

const reset = () => {
  form.deptName = ''
  form.deptStatus = ''
  search()
}

const onAdd = (item: any) => {
  AddDeptModalRef.value?.add(item.deptId)
}

const onEdit = (item: any) => {
  AddDeptModalRef.value?.edit(item.deptId)
}

// 批量删除
const isConfirmVisible = ref(false);
const onMulDelete = async () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择组织！')
  }
  isConfirmVisible.value = true;
}

// 删除
const handleDelete = async () => {
  const deptIds = Object.values(selectedKeys.value).toString()
  const res = await delDept({deptIds: deptIds})
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

// 删除
const onDelete = async (item: any) => {
  const res = await delDept({deptIds: item.deptId})
  if (res) {
    Message.success(res.msg)
    search()
  }
}
</script>

<style lang="scss" scoped></style>
