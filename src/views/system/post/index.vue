<template>
  <el-card class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">岗位管理</div>
      </div>
    </template>
    <CwrsSplitPane>
      <template #left>
        <a-input
          v-model="treeInputValue"
          style="width: 200px"
          placeholder="输入组织名称搜索"
          allow-clear
          :style="{ marginBottom: '8px' }"
          @change="queryDeptList"
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <div class="gi_full_column">
          <a-scrollbar
            style="height: 100%; overflow: auto"
            outer-style="height: 100%"
          >
            <a-tree
              ref="treeRef"
              block-node
              show-line
              default-expand-all
              :data="deptList"
              :field-names="{
                key: 'deptId',
                title: 'deptName',
                children: 'children',
              }"
              @select="treeCheck"
            >
            </a-tree>
          </a-scrollbar>
        </div>
      </template>
      <el-row justify="space-between" style="margin-bottom: 10px">
        <el-space wrap>
          <el-button type="primary" @click="onAdd">
            <el-icon class="el-icon--left">
              <Plus />
            </el-icon>
            新增
          </el-button>
          <!-- <el-popconfirm
            :visible="showConfirm"
            @confirm="handleDelete"
            @cancel="handleCancel"
            title="确定要删除选中的数据吗？"
          >
            <template #reference> -->
          <el-button
            type="danger"
            @click="onMulDelete"
            :disabled="!selectedKeys.length"
          >
            <el-icon class="el-icon--left">
              <Delete />
            </el-icon>
            批量删除
          </el-button>
          <!-- </template>
          </el-popconfirm> -->
        </el-space>
        <el-space wrap>
          <CwrsSelect
            v-model="queryParams.postStatus"
            :options="sysStatus"
            :width="120"
            placeholder="状态"
            allow-clear
          />

          <el-input
            v-model="queryParams.postName"
            placeholder="输入岗位名称搜索"
            clearable
            style="width: 250px"
          />
          <el-button type="primary" @click="search">
            <el-icon class="el-icon--left">
              <Search />
            </el-icon>
            查询
          </el-button>
          <el-button @click="reset">
            <el-icon class="el-icon--left">
              <RefreshRight />
            </el-icon>
            重置
          </el-button>
        </el-space>
      </el-row>
      <el-table
        class="gi_table"
        row-key="postId"
        v-loading="loading"
        :data="tableData"
        border
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        @selection-change="handleSelectionChange"
      >
        <!-- 复选框列 -->
        <el-table-column
          type="selection"
          width="55"
          align="center"
        ></el-table-column>

        <!-- 序号列 -->
        <el-table-column
          label="序号"
          width="60"
          type="index"
          :index="(index) => index + 1"
        ></el-table-column>

        <!-- 岗位名称列 -->
        <el-table-column label="岗位名称" prop="postName" width="150">
          <template #default="scope">
            <el-link
              @click="openDetail(scope.row)"
              type="primary"
              underline="never"
            >
              {{ scope.row.postName }}
            </el-link>
          </template>
        </el-table-column>

        <!-- 岗位编码列 -->
        <el-table-column
          label="岗位编码"
          prop="postCode"
          width="150"
        ></el-table-column>

        <!-- 所属组织列 -->
        <el-table-column label="所属组织" prop="deptName" width="180">
          <template #default="scope">
            <span>{{ scope.row.deptName || "系统默认组织" }}</span>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <CwrsCellTag
              :value="scope.row.postStatus"
              :dict="sysStatus"
            ></CwrsCellTag>
          </template>
        </el-table-column>

        <!-- 排序列 -->
        <el-table-column
          label="排序"
          prop="postSort"
          width="80"
          align="center"
        ></el-table-column>

        <!-- 描述列 -->
        <el-table-column label="描述" prop="desc" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.desc || "-" }}</span>
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column label="创建时间" prop="createTime" width="180">
          <template #default="scope"
            >{{ parseTime(scope.row.createdTime) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="onEdit(scope.row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除该岗位吗?"
              @confirm="onDelete(scope.row)"
            >
              <template #reference>
                <el-button type="danger" size="small"> 删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div style="display: flex; justify-content: flex-end">
        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </CwrsSplitPane>

    <AddPostModal ref="AddPostModalRef" @save-success="search"></AddPostModal>
    <PostDetailDrawer ref="PostDetailDrawerRef"></PostDetailDrawer>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { Message } from "@arco-design/web-vue";
import AddPostModal from "./AddPostModal.vue";
import PostDetailDrawer from "./PostDetailDrawer.vue";
import { useDept, useDict } from "@/hooks/app";
import { getPostList, delSysPost } from "@/apis/system";
import { parseTime } from "@/utils/time";

defineOptions({ name: "SystemPost" });

const { data: sysStatus } = useDict({ dictCode: "sys_status" });

const treeRef = useTemplateRef("treeRef");
const AddPostModalRef = useTemplateRef("AddPostModalRef");
const PostDetailDrawerRef = useTemplateRef("PostDetailDrawerRef");
const treeInputValue = ref("");

const total = ref(0);
const tableData = ref([]);
const loading = ref(false);
const selectedKeys = ref([]);

const { deptList, getDeptList } = useDept({
  onSuccess: () => {
    nextTick(() => {
      treeRef.value?.expandAll(true);
    });
  },
});
getDeptList();

const queryDeptList = () => {
  const keyword = treeInputValue.value?.trim() || "";
  if (keyword) {
    deptList.value = filterMenuTree(deptList.value, keyword);
  } else {
    getDeptList();
  }
};

/**
 * 递归过滤树形结构菜单
 * @param {Array} treeData - 菜单列表
 * @param {String} keyword - 搜索关键词
 * @returns {Array} 过滤后的新树
 */
function filterMenuTree(treeData, keyword) {
  if (!keyword) return treeData; // 无关键词，返回原树

  const result = [];

  treeData.forEach((menu) => {
    const titleMatch = menu.deptName?.includes(keyword);

    // 子菜单过滤
    const filteredChildren = menu.children?.length
      ? filterMenuTree(menu.children, keyword)
      : [];

    // 如果自己匹配，或子节点中有匹配的，就保留
    if (titleMatch || filteredChildren.length > 0) {
      // 创建新对象，避免修改原数据
      const newNode = { ...menu };
      if (filteredChildren.length > 0) {
        newNode.children = filteredChildren;
      }
      // 如果自己匹配，但子节点不匹配，也保留自己（不删 children）
      result.push(newNode);
    }
  });

  return result;
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  postId: "",
  postStatus: "",
  postName: "",
  deptId: "",
});

onMounted(() => {
  search();
});
const search = () => {
  getList();
};
const getList = async () => {
  loading.value = true;
  const res = await getPostList(queryParams);
  if (res) {
    tableData.value = res.data;
    total.value = res.total;
  }
  loading.value = false;
};
const reset = () => {
  queryParams.postName = "";
  queryParams.postStatus = "";
  search();
};
const handleSelectionChange = (val) => {
  selectedKeys.value = val.map((item) => item.postId);
};
/**
 * search 方法用于处理树节点选择事件
 * @param selectedKeys 选中的节点的 key（即 deptId）数组
 * @param info 包含更多关于选择的信息
 */
const treeCheck = (selectedKeys: string[], info: any) => {
  if (selectedKeys && selectedKeys.length > 0) {
    // 如果是单选，则取第一个元素
    queryParams.deptId = selectedKeys[0];
  }
  search();
};

// 批量删除
const onMulDelete = async () => {
  try {
    if (!selectedKeys.value.length) {
      return ElMessage.warning("请选择岗位！");
    }
    // 新增：删除确认弹窗（核心新增逻辑）
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedKeys.value.length} 条岗位数据吗？删除后数据不可恢复！`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true,
      }
    );

    // 用户点击「确定」后，再调用删除接口
    const res = await delSysPost({ postIds: selectedKeys.value.join(",") });
    if (res.code === 200) {
      ElMessage.success(res.msg);
      await getList(); // 刷新岗位列表
      selectedKeys.value = []; // 清空已选中的ID
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false;
  }
};

const onDelete = async (item: any) => {
  try {
    const res = await delSysPost({ postIds: item.postId });
    if (res) {
      Message.success(res.msg);
      search();
    }
  } catch (error) {
    return false;
  }
};

const onAdd = () => {
  AddPostModalRef.value?.add();
};

const onEdit = (item: any) => {
  AddPostModalRef.value?.edit(item.postId);
};

const openDetail = (item: any) => {
  PostDetailDrawerRef.value?.open(item.postId);
};
</script>

<style lang="scss" scoped></style>
