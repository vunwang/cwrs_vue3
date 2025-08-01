<template>
  <a-card title="岗位管理" class="gi_page_card">
    <CwrsSplitPane>
      <template #left>
        <a-input v-model="treeInputValue" placeholder="输入组织名称搜索" allow-clear :style="{ marginBottom: '8px' }" @change="getDeptList">
          <template #prefix>
            <icon-search/>
          </template>
        </a-input>
        <div class="gi_full_column">
          <a-scrollbar style="height: 100%; overflow: auto" outer-style="height: 100%">
            <a-tree ref="treeRef" block-node show-line default-expand-all :data="deptList" :field-names="{
              key: 'deptId',
              title: 'deptName',
              children: 'children',
            }" @select="search">
            </a-tree>
          </a-scrollbar>
        </div>
      </template>

      <a-row justify="space-between">
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

        <a-space wrap>
          <a-input-group>
            <CwrsSelect v-model="form.postStatus" :options="sysStatus" :width="120" placeholder="状态" allow-clear />
            <a-input v-model="form.postName" placeholder="输入岗位名称搜索" allow-clear style="max-width: 250px">
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

      <a-table class="gi_table" row-key="postId" :loading="loading" :data="postList" :bordered="{ cell: true }"
               :scroll="{ x: '100%', y: '100%', minWidth: 1700 }" :pagination="pagination"
               :row-selection="{ type: 'checkbox', showCheckedAll: true }" :selected-keys="selectedKeys"
               @select="select"
               @select-all="selectAll">
        <template #columns>
          <a-table-column title="序号" :width="64">
            <template #cell="cell">{{ cell.rowIndex + 1 }}</template>
          </a-table-column>
          <a-table-column title="岗位名称" data-index="postName" :width="120">
            <template #cell="{ record }">
              <a-link @click="openDetail(record)">{{ record.postName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="岗位编码" data-index="postCode" :width="150"/>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <CwrsCellTag :status="record.postStatus"></CwrsCellTag>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="postSort" :width="80" align="center"/>
          <a-table-column title="所属组织" data-index="deptName" :width="180"></a-table-column>
          <a-table-column title="描述" :width="200" data-index="desc" :ellipsis="true"
                          :tooltip="true"/>
          <a-table-column title="创建时间" data-index="createTime" :width="200"></a-table-column>
          <a-table-column title="操作" :width="180" align="center" :fixed="fixed">
            <template #cell="{ record }">
              <a-space>
                <a-button type="primary" size="mini" @click="onEdit(record)">
                  <template #icon>
                    <icon-edit/>
                  </template>
                  <span>编辑</span>
                </a-button>
                <a-popconfirm type="warning" content="确定删除该用户吗?">
                  <a-button type="primary" status="danger" size="mini" :disabled="record.disabled">
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
    </CwrsSplitPane>

    <AddPostModal ref="AddPostModalRef" @save-success="search"></AddPostModal>
    <PostDetailDrawer ref="PostDetailDrawerRef"></PostDetailDrawer>
  </a-card>
</template>

<script setup lang="ts">
import {Message} from '@arco-design/web-vue'
import AddPostModal from './AddPostModal.vue'
import PostDetailDrawer from './PostDetailDrawer.vue'
import {useTable} from '@/hooks'
import {useDept, useDict} from '@/hooks/app'
import {getPostList} from '@/apis/system'

defineOptions({name: 'SystemPost'})

const {data: sysStatus} = useDict({dictCode: 'sys_status'})
const treeRef = useTemplateRef('treeRef')
const AddPostModalRef = useTemplateRef('AddPostModalRef')
const PostDetailDrawerRef = useTemplateRef('PostDetailDrawerRef')
const treeInputValue = ref('')

const {deptList, getDeptList} = useDept({
  onSuccess: () => {
    nextTick(() => {
      treeRef.value?.expandAll(true)
    })
  }
})
getDeptList()

const form = reactive({postStatus: '', postName: ''})

const {
  loading,
  tableData: postList,
  pagination,
  selectedKeys,
  search,
  select,
  selectAll,
  fixed
} = useTable(() => getPostList(form), {immediate: true, rowKey: 'postId'})

const reset = () => {
  form.postStatus = ''
  form.postName = ''
  search()
}

// 批量删除
const onMulDelete = () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择用户！')
  }
}

const onAdd = () => {
  AddPostModalRef.value?.add()
}

const onEdit = (item: any) => {
  AddPostModalRef.value?.edit(item.id)
}

const openDetail = (item: any) => {
  PostDetailDrawerRef.value?.open(item.id)
}
</script>

<style lang="scss" scoped></style>
