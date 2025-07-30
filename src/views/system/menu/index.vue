<template>
  <a-card title="菜单管理" class="gi_page_card">
    <a-row justify="space-between">
      <a-space wrap>
        <a-button type="primary" v-hasPerm="['sys:menu:add']" @click="onAdd">
          <template #icon>
            <icon-plus/>
          </template>
          <span>新增</span>
        </a-button>
        <a-button status="success" v-hasPerm="['sys:menu:edit']" @click="onMulEdit">
          <template #icon>
            <icon-edit/>
          </template>
          <span>编辑</span>
        </a-button>
        <a-button status="danger" v-hasPerm="['sys:menu:del']" @click="onMulDelete">
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
        <a-tooltip content="展开/折叠">
          <a-button type="primary" status="success" @click="onExpanded">
            <template #icon>
              <icon-list v-if="!isExpanded"/>
              <icon-mind-mapping v-else/>
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="查看数据结构">
          <a-button type="primary" status="warning" @click="onViewCode">
            <template #icon>
              <icon-code/>
            </template>
          </a-button>
        </a-tooltip>
      </a-space>

      <a-space wrap>
        <a-input-group>
          <CwrsSelect v-model="form.status" :options="sysStatus" :width="120" placeholder="状态" allow-clear />
          <a-input v-model="form.title" placeholder="输入菜单名称搜索" allow-clear style="width: 250px">
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

    <a-table ref="tableRef" class="gi_table" row-key="menuId" :data="menuList" :loading="loading"
             :bordered="{ cell: true }" size="mini"
             :scroll="{ x: '100%', y: '100%', minWidth: 1700 }" :pagination="false"
             :row-selection="rowSelection" :selected-keys="selectedKeys"
             @select="select" @select-all="selectAll">
      <template #expand-icon="{ expanded }">
        <IconDown v-if="expanded"/>
        <IconRight v-else/>
      </template>
      <template #columns>
        <a-table-column title="菜单名称" :width="200">
          <template #cell="{ record }">{{ record.title || '' }}</template>
        </a-table-column>
        <a-table-column title="类型" :width="80" align="center">
          <template #cell="{ record }">
            <CwrsCellTag :value="record.type" :dict="sysMenuType"></CwrsCellTag>
          </template>
        </a-table-column>
        <a-table-column title="排序" :width="80" align="center">
          <template #cell="{ record }">{{ record.sort || 0 }}</template>
        </a-table-column>
        <a-table-column title="路由路径" data-index="path"></a-table-column>
        <a-table-column title="路由名称">
          <template #cell="{ record }">{{ transformPathToName(record.path) }}</template>
        </a-table-column>
        <a-table-column title="组件路径" data-index="component"></a-table-column>
        <a-table-column title="权限标识" data-index="permission" :width="150"></a-table-column>
        <a-table-column title="菜单图标" data-index="icon" :width="100" align="center">
          <template #cell="{ record }">
            <CwrsSvgIcon v-if="record.svgIcon" :size="24" :name="record.svgIcon"></CwrsSvgIcon>
            <template v-else>
              <component :is="record.icon" v-if="record.icon" :size="24"></component>
            </template>
          </template>
        </a-table-column>
        <a-table-column title="状态" :width="80" align="center">
          <template #cell="{ record }">
            <a-popconfirm type="warning" content="确定切换该菜单状态吗?" @ok="statusOk(record)" @cancel="statusCancel">
              <CwrsSwitch v-model="record.status" :disabled="!hasPerm('sys:menu:status')" size="small"/>
            </a-popconfirm>
          </template>
        </a-table-column>
        <a-table-column title="是否缓存" :width="100" align="center">
          <template #cell="{ record }">
            <a-tag v-if="record.keepAlive" size="small" color="green">是</a-tag>
            <a-tag v-else size="small" color="red">否</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="是否隐藏" :width="100" align="center">
          <template #cell="{ record }">
            <a-tag v-if="record.hidden" size="small" color="green">是</a-tag>
            <a-tag v-else size="small" color="red">否</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="是否外链" :width="100" align="center">
          <template #cell="{ record }">
            <a-tag v-if="isExternal(record.path)" size="small" color="green">是</a-tag>
            <a-tag v-else size="small" color="red">否</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" :width="200" align="center" :fixed="fixed">
          <template #cell="{ record }">
            <a-space>
              <a-button type="primary" v-hasPerm="['sys:menu:edit']" size="mini" @click="onEdit(record)">
                <template #icon>
                  <icon-edit/>
                </template>
                <span>编辑</span>
              </a-button>
              <a-button v-if="[1, 2].includes(record.type)" type="primary" status="success" size="mini">
                <template #icon>
                  <icon-plus/>
                </template>
              </a-button>
              <a-popconfirm type="warning" content="确定删除该菜单吗?" @ok="onDelete(record)">
                <a-button status="danger" v-hasPerm="['sys:menu:del']" size="mini">
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

    <AddMenuModal ref="AddMenuModalRef" :menus="menuList" @save-success="search"></AddMenuModal>
    <EditMenusParentId ref="EditMenusParentIdRef" :menus="menuList" @edit-success="search"></EditMenusParentId>
  </a-card>
</template>

<script setup lang="ts">
import {Drawer, Message} from '@arco-design/web-vue'
import AddMenuModal from './AddMenuModal.vue'
import EditMenusParentId from './EditMenusParentId.vue'
import {getMenuList, delMenu, editMenuStatus} from '@/apis/system'
import {isExternal} from '@/utils/validate'
import {transformPathToName} from '@/utils'
import {useDict} from '@/hooks/app'
import {useTable} from '@/hooks'
import CwrsCodeView from '@/components/CwrsCodeView/index.vue'
import {hasPerm} from "@/utils/has";

defineOptions({name: 'SystemMenu'})

const {data: sysStatus} = useDict({dictCode: 'sys_status'})
const {data: sysMenuType} = useDict({dictCode: 'sys_menu_type'})

const AddMenuModalRef = useTemplateRef('AddMenuModalRef')
const EditMenusParentIdRef = useTemplateRef('EditMenusParentIdRef')

const tableRef = useTemplateRef('tableRef')
const isExpanded = ref(false)
const onExpanded = () => {
  isExpanded.value = !isExpanded.value
  tableRef.value?.expandAll(isExpanded.value)
}

const form = reactive({title: '', status: ''})

const rowSelection = computed(() => ({
  type: 'checkbox',
  showCheckedAll: false,
}));

const {
  loading,
  tableData: menuList,
  search,
  select,
  selectAll,
  selectedKeys,
  fixed
} = useTable(() => getMenuList(form), {
  immediate: true, rowKey: 'menuId'
})

// 批量编辑
const onMulEdit = async () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择菜单！')
  }
  EditMenusParentIdRef.value?.edits(selectedKeys.value)
}

// 删除
const onDelete = async (item: MenuItem) => {
  const res = await delMenu({menuIds: item.menuId})
  if (res) {
    Message.success(res.msg)
    search()
  }
}

// 批量删除
const isConfirmVisible = ref(false);
const onMulDelete = async () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择菜单！')
  }
  isConfirmVisible.value = true;
}

// 删除
const handleDelete = async () => {
  const menuIds = Object.values(selectedKeys.value).toString()
  const res = await delMenu({menuIds: menuIds})
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

const reset = () => {
  form.title = ''
  form.status = ''
  search()
}

const onAdd = () => {
  AddMenuModalRef.value?.add()
}

const onEdit = (item: any) => {
  AddMenuModalRef.value?.edit(item.menuId)
}

const statusOk = async (record: any) => {
  const res = await editMenuStatus({menuId: record.menuId, status: record.status})
  if (res) {
    Message.success(res.msg)
    search()
  }
}

const statusCancel = () => {
  search()
}

const onViewCode = () => {
  Drawer.open({
    title: '数据结构',
    content: () => h(CwrsCodeView, {codeJson: JSON.stringify(menuList.value, null, '\t')}),
    width: 560
  })
}
</script>

<style lang="scss" scoped></style>
