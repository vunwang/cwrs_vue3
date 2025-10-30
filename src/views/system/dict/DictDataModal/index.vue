<template>
  <el-dialog v-model="visible" title="字典项数据" width="60%" :close-on-click-modal="true" :show-close="true">
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">字典项数据</span>
      </div>
    </template>
    <el-row justify="space-between">
      <div>
        <el-button type="primary" v-hasPerm="['sys:dictItem:add']" @click="onAdd">
          <template #icon>
            <el-icon>
              <Plus/>
            </el-icon>
          </template>
          新增
        </el-button>
        <el-button type="danger" :disabled="!selectedKeys.length" v-hasPerm="['sys:dictItem:del']" @click="onMulDelete">
          <template #icon>
            <el-icon>
              <Delete/>
            </el-icon>
          </template>
          批量删除
        </el-button>
        <!-- 确认框 -->
        <el-dialog v-model="isConfirmVisible" width="300px" title="确认删除" @confirm="handleDelete"
                   @cancel="handleCancel">
          <p>确定要删除选中的数据吗？</p>
          <template #footer>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleDelete">确定</el-button>
          </template>
        </el-dialog>
      </div>
    </el-row>
    <el-table
        :data="tableData"
        row-key="dictItemId"
        style="width: 100%;margin-top: 10px"
        border
        v-loading="loading"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" width="64" type="index" :index="1"/>

      <el-table-column prop="itemName" label="字典名"/>
      <el-table-column prop="itemValue" label="字典值"/>
      <el-table-column prop="itemColor" label="颜色" align="center" width="80">
        <template #default="{ row }">
          <el-color-picker v-model="row.itemColor" size="small" disabled show-alpha/>
        </template>
      </el-table-column>

      <el-table-column label="下拉菜单" width="120" align="center">
        <template #default="{ row }">
          <el-popconfirm
              title="确定切换该字典项下拉菜单状态吗?"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleEdit(row, 'itemSelect')"
              @cancel="getList"
          >
            <template #reference>
              <el-switch
                  v-model="row.itemSelect"
                  :active-value="'1'"
                  :inactive-value="'0'"
                  active-text="显示"
                  inactive-text="隐藏"
                  inline-prompt
                  :disabled="!hasPerm('sys:dictItem:itemSelect')"
              />
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-popconfirm
              title="确定切换该字典项状态吗?"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleEdit(row, 'itemStatus')"
              @cancel="getList"
          >
            <template #reference>
              <CwrsSwitch
                  v-model="row.itemStatus"
                  size="default"
                  :disabled="!hasPerm('sys:dictItem:itemStatus')"
              />
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" v-hasPerm="['sys:dictItem:edit']" @click="onEdit(row)">
            <template #icon>
              <el-icon>
                <Edit/>
              </el-icon>
            </template>
            编辑
          </el-button>
          <el-popconfirm
              title="确定删除该字典项吗?"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="onDelete(row)"
          >
            <template #reference>
              <el-button type="danger" size="small" v-hasPerm="['sys:dictItem:del']">
                <template #icon>
                  <el-icon>
                    <Delete/>
                  </el-icon>
                </template>
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex; justify-content: flex-end">
      <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </div>

    <AddDictDataModal ref="AddDictDataModalRef" @save-success="getList"/>
  </el-dialog>
</template>

<script lang="ts" setup>
import {reactive, ref, useTemplateRef} from 'vue'
import {ElMessage} from 'element-plus'
import {
  Plus,
  Delete,
  Edit
} from '@element-plus/icons-vue'

import AddDictDataModal from './AddDictDataModal.vue'
import {delDictItem, editDictItem, getDictDataList} from '@/apis/system'
import {hasPerm} from '@/utils/has'

// 模态框控制
const visible = ref(false)
const AddDictDataModalRef = useTemplateRef('AddDictDataModalRef')
const isConfirmVisible = ref(false)

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])
const selectedKeys = ref<string[]>([]) // Element Plus selection 返回数组
const total = ref(0) // 分页总数

// 分页查询参数（必须叫 queryParams，字段必须是 pageNum / pageSize）
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dictCode: ''
})

// 查询方法（必须叫 getList）
const getList = async () => {
  loading.value = true
  try {
    const res = await getDictDataList(queryParams)
    tableData.value = res.data || []
    total.value = res.total || 0
    loading.value = false
  } catch (error) {
    loading.value = false
    return false
  }
}

// 打开弹窗
const open = async (data: { dictCode: string }) => {
  visible.value = true
  queryParams.pageNum = 1 // 重置页码
  queryParams.dictCode = data.dictCode
  await getList()
}

// 表格多选变化
const handleSelectionChange = (selection: any[]) => {
  selectedKeys.value = selection.map(item => item.dictItemId)
}

// 批量删除
const onMulDelete = () => {
  if (!selectedKeys.value.length) {
    return ElMessage.warning('请选择字典数据！')
  }
  isConfirmVisible.value = true
}

const handleDelete = async () => {
  try {
    const dictItemIds = selectedKeys.value.join(',')
    const res = await delDictItem({dictItemIds})
    if (res) {
      ElMessage.success(res.msg)
      isConfirmVisible.value = false
      await getList()
    }
  } catch (error) {
    return false
  }
}

const handleCancel = () => {
  ElMessage.info('已取消删除')
  isConfirmVisible.value = false
}

// 单条删除
const onDelete = async (item: any) => {
  try {
    const res = await delDictItem({dictItemIds: item.dictItemId})
    if (res) {
      ElMessage.success(res.msg)
      await getList()
    }
  } catch (error) {
    return false
  }
}

// 新增/编辑
const onAdd = () => {
  AddDictDataModalRef.value?.add(queryParams.dictCode)
}

const onEdit = (item: any) => {
  AddDictDataModalRef.value?.edit(item.dictItemId)
}

// 开关状态编辑
const handleEdit = async (item: any, type: string) => {
  try {
    let res
    if (type === 'itemSelect') {
      res = await editDictItem({dictItemId: item.dictItemId, itemSelect: item.itemSelect})
    } else if (type === 'itemStatus') {
      res = await editDictItem({dictItemId: item.dictItemId, itemStatus: item.itemStatus})
    }
    if (res) {
      ElMessage.success(res.msg)
      await getList()
    }
  } catch (error) {
    return false
  }
}

defineExpose({open})
</script>