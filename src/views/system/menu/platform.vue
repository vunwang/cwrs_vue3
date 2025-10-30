<template>
  <a-row justify="space-between">
    <a-space wrap>
      <el-button type="primary" v-hasPerm="['sys:menu:add']" @click="onAdd">
        <template #icon>
          <icon-plus/>
        </template>
        <span>新增</span>
      </el-button>
      <el-button type="primary" :disabled="!selectedKeys.length" v-hasPerm="['sys:menu:edit']" @click="onMulEdit">
        <template #icon>
          <icon-edit/>
        </template>
        <span>编辑</span>
      </el-button>
      <el-button type="danger" :disabled="!selectedKeys.length" v-hasPerm="['sys:menu:del']" @click="onMulDelete">
        <template #icon>
          <icon-delete/>
        </template>
        <span>批量删除</span>
      </el-button>
      <!-- 确认框 -->
      <a-modal v-model:visible="isConfirmVisible" width="300px" title="确认删除" @ok="handleDelete"
               @cancel="handleCancel">
        <p>确定要删除选中的数据吗？</p>
      </a-modal>
      <a-tooltip content="展开/折叠">
        <el-button type="success" @click="onExpanded">
          <template #icon>
            <icon-list v-if="!isExpanded"/>
            <icon-mind-mapping v-else/>
          </template>
        </el-button>
      </a-tooltip>
      <a-tooltip content="查看数据结构">
        <el-button type="warning" @click="onViewCode">
          <template #icon>
            <icon-code/>
          </template>
        </el-button>
      </a-tooltip>
    </a-space>

    <a-space wrap>
      <a-input-group>
        <a-input v-model="form.title" placeholder="输入菜单名称搜索" allow-clear style="width: 250px"></a-input>
      </a-input-group>
      <a-button type="primary" @click="searchTable">
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

  <a-table ref="tableRef" class="gi_table" row-key="menuId" :data="menuList" :loading="loading"
           :bordered="{ cell: true }" size="mini" style="height: 700px"
           :scroll="{ x: '100%', y: '100%', minWidth: 1700 }" :pagination="false"
           :row-selection="rowSelection" :selected-keys="selectedKeys"
           @select="select" @select-all="selectAll">
    <template #expand-icon="{ expanded }">
      <IconDown v-if="expanded"/>
      <IconRight v-else/>
    </template>
    <template #columns>
      <a-table-column title="菜单名称" :width="200">
        <template #cell="{ record }">
          {{ record.title || '' }}
        </template>
      </a-table-column>
      <a-table-column title="类型" :width="80" align="center">
        <template #cell="{ record }">
          <CwrsCellTag :value="record.type" :dict="sysMenuType"></CwrsCellTag>
        </template>
      </a-table-column>
      <a-table-column title="排序" :width="80" align="center">
        <template #cell="{ record }">{{ record.sort || 0 }}</template>
      </a-table-column>
      <a-table-column title="路由路径" data-index="path">
        <template #cell="{ record }">{{ record.path || '-' }}</template>
      </a-table-column>
      <a-table-column title="路由名称">
        <template #cell="{ record }">{{ transformPathToName(record.path) || '-' }}</template>
      </a-table-column>
      <a-table-column title="组件路径" data-index="component">
        <template #cell="{ record }">{{ record.component || '-' }}</template>
      </a-table-column>
      <a-table-column title="权限标识" data-index="permission" :width="150">
        <template #cell="{ record }">{{ record.permission || '-' }}</template>
      </a-table-column>
      <a-table-column title="菜单图标" data-index="icon" :width="100" align="center">
        <template #cell="{ record }">
          <CwrsSvgIcon v-if="record.svgIcon" :size="24" :name="record.svgIcon"></CwrsSvgIcon>
          <template v-else-if="record.icon">
            <component :is="record.icon" v-if="record.icon" :size="24"></component>
          </template>
          <span v-else>-</span>
        </template>
      </a-table-column>
      <a-table-column title="状态" :width="80" align="center">
        <template #cell="{ record }">
          <a-popconfirm type="warning" content="确定切换该菜单状态吗?" @ok="menuEdit(record,'status')"
                        @cancel="search">
            <a-switch v-model="record.status" :disabled="!hasPerm('sys:menu:status')" size="small" checked-value="1"
                      unchecked-value="0"
                      checked-text="正常"
                      unchecked-text="禁用"/>
          </a-popconfirm>
        </template>
      </a-table-column>
      <a-table-column title="是否缓存" :width="100" align="center">
        <template #cell="{ record }">
            <span v-if="record.type !== '3'">
              <a-popconfirm type="warning" content="确定切换该菜单缓存状态吗?"
                            @ok="menuEdit(record,'keepAlive')" @cancel="search">
                <a-switch v-if="record.type !== '3'" v-model="record.keepAlive" type="round" :checked-value="true"
                          :unchecked-value="false"
                          checked-text="是" unchecked-text="否" :disabled="!hasPerm('sys:menu:keepAlive')"
                          size="small"/>
              </a-popconfirm>
            </span>
          <span v-else>-</span>
        </template>
      </a-table-column>
      <a-table-column title="是否隐藏" :width="100" align="center">
        <template #cell="{ record }">
            <span v-if="record.type !== '3'">
              <a-popconfirm type="warning" content="确定切换该菜单隐藏状态吗?"
                            @ok="menuEdit(record,'hidden')" @cancel="search">
                <a-switch v-model="record.hidden" type="round" :checked-value="true"
                          :unchecked-value="false"
                          checked-text="是" unchecked-text="否" :disabled="!hasPerm('sys:menu:hidden')" size="small"/>
              </a-popconfirm>
            </span>
          <span v-else>-</span>
        </template>
      </a-table-column>
      <a-table-column title="是否外链" :width="100" align="center">
        <template #cell="{ record }">
            <span v-if="record.type !== '3'">
              <a-tag v-if="isExternal(record.path)" size="small" color="green">是</a-tag>
              <a-tag v-else size="small" color="red">否</a-tag>
            </span>
          <span v-else>-</span>
        </template>
      </a-table-column>
      <a-table-column title="操作" :width="200" align="center" :fixed="fixed">
        <template #cell="{ record }">
          <a-space>
            <el-button v-if="['1', '2'].includes(record.type)" type="primary" size="small"
                       v-hasPerm="['sys:menu:add']" @click="onAdd(record)">
              <span>新增</span>
            </el-button>
            <el-button type="primary" v-hasPerm="['sys:menu:edit']" size="small" @click="onEdit(record)">
              <span>编辑</span>
            </el-button>
            <a-popconfirm type="warning" content="确定删除该菜单吗?" @ok="onDelete(record)">
              <el-button type="danger" v-hasPerm="['sys:menu:del']" size="small">
                <span>删除</span>
              </el-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table-column>
    </template>
  </a-table>

  <AddMenuModal ref="AddMenuModalRef" :menus="menuList" @save-success="search"></AddMenuModal>
  <EditMenusParentId ref="EditMenusParentIdRef" :menus="menuList" @edit-success="search"></EditMenusParentId>
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
} = useTable(() => getMenuList(), {
  immediate: true, rowKey: 'menuId'
})

/**
 * 递归过滤树形结构菜单
 * @param {Array} menus - 菜单列表
 * @param {String} keyword - 搜索关键词
 * @returns {Array} 过滤后的新树
 */
function filterMenuTree(menus, keyword) {
  if (!keyword) return menus; // 无关键词，返回原树

  const result = [];

  menus.forEach(menu => {
    const titleMatch = menu.title?.includes(keyword);
    const pathMatch = menu.path?.includes(keyword);
    const permissionMatch = menu.permission?.includes(keyword);
    const isMatch = titleMatch || pathMatch || permissionMatch;

    // 子菜单过滤
    const filteredChildren = menu.children?.length
        ? filterMenuTree(menu.children, keyword)
        : [];

    // 如果自己匹配，或子节点中有匹配的，就保留
    if (isMatch || filteredChildren.length > 0) {
      // 创建新对象，避免修改原数据
      const newNode = {...menu};
      if (filteredChildren.length > 0) {
        newNode.children = filteredChildren;
      }
      // 如果自己匹配，但子节点不匹配，也保留自己（不删 children）
      result.push(newNode);
    }
  });

  return result;
}

// 搜索按钮点击
const searchTable = () => {
  // 过滤：菜单名称包含关键词
  const keyword = form.title?.trim() || '';
  if (keyword) {
    menuList.value = filterMenuTree(menuList.value, keyword);
    // 可选：清除选中状态
  } else {
    search()
  }
  selectedKeys.value = [];
}

// 重置按钮
const reset = () => {
  form.title = ''
  search()
}

// 批量编辑
const onMulEdit = async () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择菜单！')
  }
  EditMenusParentIdRef.value?.edits(selectedKeys.value)
}

// 删除
const onDelete = async (item: MenuItem) => {
  try {
    const res = await delMenu({menuIds: item.menuId})
    if (res) {
      Message.success(res.msg)
      search()
    }
  } catch (error) {
    return false
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
  try {
    const menuIds = Object.values(selectedKeys.value).toString()
    const res = await delMenu({menuIds: menuIds})
    if (res) {
      Message.success(res.msg)
      search()
    }
  } catch (error) {
    return false
  }
};

// 取消删除
const handleCancel = () => {
  Message.info('已取消删除');
  isConfirmVisible.value = false;
};

const onAdd = (item: any) => {
  AddMenuModalRef.value?.add(item.menuId, item.type)
}

const onEdit = (item: any) => {
  AddMenuModalRef.value?.edit(item.menuId)
}

const menuEdit = async (record: any, type: string) => {
  const res = await editMenuStatus({
    menuId: record.menuId,
    type: type,
    status: record.status,
    hidden: record.hidden,
    keepAlive: record.keepAlive
  })
  if (res) {
    Message.success(res.msg)
    search()
  }
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
