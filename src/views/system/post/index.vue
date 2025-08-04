<template>
  <a-card title="岗位管理" class="gi_page_card">
    <CwrsSplitPane>
      <template #left>
        <a-input v-model="treeInputValue" placeholder="输入组织名称搜索" allow-clear :style="{ marginBottom: '8px' }"
                 @change="queryDeptList">
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
            }" @select="treeCheck">
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
            <CwrsSelect v-model="form.postStatus" :options="sysStatus" :width="120" placeholder="状态" allow-clear/>
            <a-input v-model="form.postName" placeholder="输入岗位名称搜索" allow-clear style="width: 250px">
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
               :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination"
               :row-selection="{ type: 'checkbox', showCheckedAll: true }" :selected-keys="selectedKeys"
               @select="select"
               @select-all="selectAll">
        <template #columns>
          <a-table-column title="序号" :width="60">
            <template #cell="cell">{{ cell.rowIndex + 1 }}</template>
          </a-table-column>
          <a-table-column title="岗位名称" data-index="postName" :width="150">
            <template #cell="{ record }">
              <a-link @click="openDetail(record)">{{ record.postName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="岗位编码" data-index="postCode" :width="150"/>
          <a-table-column title="所属组织" data-index="deptName" :width="180"></a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <CwrsCellTag :value="record.postStatus" :dict="sysStatus"></CwrsCellTag>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="postSort" :width="80" align="center"/>
          <a-table-column title="描述" data-index="desc" :ellipsis="true" :tooltip="true"></a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180">
            <template #cell="{record}">{{ parseTime(record.createdTime) }}</template>
          </a-table-column>
          <a-table-column title="操作" :width="200" align="center" :fixed="fixed">
            <template #cell="{ record }">
              <a-space>
                <a-button type="primary" size="mini" @click="onEdit(record)">
                  <template #icon>
                    <icon-edit/>
                  </template>
                  <span>编辑</span>
                </a-button>
                <a-popconfirm type="warning" content="确定删除该岗位吗?" @ok="onDelete(record)">
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
import {getPostList, delSysPost} from '@/apis/system'
import {parseTime} from "@/utils/time";

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

const queryDeptList = () => {
  getDeptList({deptName: treeInputValue.value})
}

const form = reactive({pageNum: 1, pageSize: 10, postId: '', postStatus: '', postName: '', deptId: ''})

const {
  loading,
  tableData: postList,
  pagination,
  selectedKeys,
  select,
  search,
  selectAll,
  fixed
} = useTable(() => getPostList(form), {immediate: true, rowKey: 'postId'})

const reset = () => {
  form.deptId = ''
  form.postName = ''
  form.postStatus = ''
  treeInputValue.value = ''
  search()
  getDeptList()
}

/**
 * search 方法用于处理树节点选择事件
 * @param selectedKeys 选中的节点的 key（即 deptId）数组
 * @param info 包含更多关于选择的信息
 */
const treeCheck = (selectedKeys: string[], info: any) => {
  if (selectedKeys && selectedKeys.length > 0) {
    // 如果是单选，则取第一个元素
    form.deptId = selectedKeys[0];
  }
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
  const postIds = Object.values(selectedKeys.value).toString()
  const res = await delSysPost({postIds: postIds})
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

const onDelete = async (item: any) => {
  const res = await delSysPost({postIds: item.postId})
  if (res) {
    Message.success(res.msg)
    search()
  }
}

const onAdd = () => {
  AddPostModalRef.value?.add()
}

const onEdit = (item: any) => {
  AddPostModalRef.value?.edit(item.postId)
}

const openDetail = (item: any) => {
  PostDetailDrawerRef.value?.open(item.postId)
}
</script>

<style lang="scss" scoped></style>
