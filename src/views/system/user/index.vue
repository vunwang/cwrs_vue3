<template>
  <el-card class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">用户管理</div>
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
      <el-row>
        <el-form :inline="true" :model="queryParams" class="demo-form-inline">
          <el-row>
            <el-form-item label="">
              <el-input
                v-model="queryParams.userName"
                style="width: 200px"
                placeholder="输入用户名搜索"
                clearable
              />
            </el-form-item>
            <el-form-item label="">
              <el-input
                v-model="queryParams.userPhone"
                style="width: 200px"
                placeholder="输入手机号搜索"
                clearable
              />
            </el-form-item>
            <el-form-item label="">
              <el-date-picker
                @change="handleDateChange"
                v-model="createTime"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
            <div>
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
            </div>
          </el-row>
        </el-form>
        <div
          style="
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 10px;
          "
        >
          <div>
            <el-button
              type="primary"
              @click="onAdd"
              v-hasPerm="['sys:user:add']"
            >
              <el-icon class="el-icon--left">
                <Plus />
              </el-icon>
              新增
            </el-button>

            <el-button
              v-hasPerm="['sys:user:del']"
              type="danger"
              @click="handleBatchDelete"
              :disabled="!selectedIds.length"
            >
              <el-icon class="el-icon--left">
                <Delete />
              </el-icon>
              批量删除
            </el-button>
          </div>
        </div>
      </el-row>

      <el-table
        class="gi_table"
        row-key="userId"
        v-loading="loading"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
          :selectable="isSelectable"
        ></el-table-column>
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column label="用户名" width="120">
          <template #default="scope">
            <el-link
              @click="openDetail(scope.row)"
              type="primary"
              underline="never"
              >{{ scope.row.userName }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="手机号"
          prop="userPhone"
          width="130"
        ></el-table-column>
        <el-table-column label="昵称" width="150">
          <template #default="scope">
            <CwrsCellAvatar
              :avatar="scope.row.avatar"
              :name="scope.row.nickName"
              :isLink="false"
            ></CwrsCellAvatar>
          </template>
        </el-table-column>
        <el-table-column label="所属组织" prop="deptName" width="180">
          <template #default="scope">
            <span>{{ scope.row.deptName || "系统默认组织" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="角色"
          prop="roleName"
          width="120"
        ></el-table-column>
        <el-table-column
          label="出生日期"
          prop="birth"
          width="120"
          align="center"
        ></el-table-column>
        <el-table-column label="性别" width="80" align="center" prop="gender">
          <template #default="scope">
            <CwrsCellTag
              :value="scope.row.gender"
              :dict="genderOptions"
            ></CwrsCellTag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="userStatus"
          label="状态"
          width="80"
          show-overflow-tooltip
        >
          <template #default="scope">
            <CwrsCellTag
              :value="scope.row.userStatus"
              :dict="userStatusOptions"
            ></CwrsCellTag>
          </template>
        </el-table-column>
        <el-table-column
          label="邮箱"
          prop="email"
          width="150"
          show-overflow-tooltip
        >
          <template #default="scope">
            <span>{{ scope.row.email || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="岗位名称" prop="postName" width="120">
          <template #default="scope">
            <span>{{ scope.row.postName || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="创建用户"
          prop="createdUserName"
          width="100"
        ></el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">
            {{ parseTime(scope.row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="onEdit(scope.row)"
              v-hasPerm="['sys:user:edit']"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除该用户吗？"
              confirm-button-text="确认"
              cancel-button-text="取消"
              @confirm="handleDelete(scope.row)"
            >
              <template #reference>
                <el-button
                  v-if="
                    scope.row.userName !== 'admin' &&
                    scope.row.userId !== userStore.userInfo.userId
                  "
                  type="danger"
                  size="small"
                  v-hasPerm="['sys:user:del']"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm
              title="确定重置该用户的密码吗？"
              confirm-button-text="确认"
              cancel-button-text="取消"
              @confirm="handleResetPassword(scope.row)"
            >
              <template #reference>
                <el-button
                  type="warning"
                  size="small"
                  v-hasPerm="['sys:user:reset']"
                >
                  重置密码
                </el-button>
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
    <AddUserModal ref="AddUserModalRef" @save-success="search"></AddUserModal>
    <UserDetailDrawer ref="UserDetailDrawerRef"></UserDetailDrawer>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, nextTick, useTemplateRef, reactive, ref } from "vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import AddUserModal from "./AddUserModal.vue";
import UserDetailDrawer from "./UserDetailDrawer.vue";
import { parseTime } from "@/utils/time";
import { useDept, useDict } from "@/hooks/app";
import { getUserList, deleteUser, resetPassword } from "@/apis/system/user";
import { useUserStore } from "@/stores";

const userStore = useUserStore();

defineOptions({ name: "SystemUser" });
// 字典数据（通过useDict获取）
const { data: userStatusOptions } = useDict({ dictCode: "sys_status" });
const { data: genderOptions } = useDict({ dictCode: "sys_gender" });
const AddUserModalRef = useTemplateRef("AddUserModalRef");
const UserDetailDrawerRef = useTemplateRef("UserDetailDrawerRef");
const treeInputValue = ref("");
const createTime = ref(["", ""]);
// 部门树相关
const treeRef = useTemplateRef("treeRef");
const { deptList, getDeptList } = useDept({
  onSuccess: () => {
    nextTick(() => {
      treeRef.value?.expandAll(true);
    });
  },
});
getDeptList();
// 选中的用户ID（批量操作用）
const selectedIds = ref<string[]>([]);
const loading = ref(false);

// ========== 类型定义 ==========
interface UserItem {
  userId: string; // 用户主键
  userName: string; // 用户名
  nickName: string; // 昵称
  avatar?: string; // 头像
  password?: string; // 密码
  userStatus: string; // 用户状态（字典）
  birth?: string; // 出生日期
  createdTime?: string; // 创建时间
  createdUserName?: string; // 创建人名称
  deptName?: string; // 所属部门名称
  desc?: string; // 描述
  email?: string; // 邮箱
  gender?: string; // 性别（字典）
  postName?: string; // 岗位名称
  roleName?: string; // 角色名称
  signature?: string; // 个性签名
  updatedTime?: string; // 更新时间
  updatedUserId?: string; // 更新人ID
  userPhone?: string; // 手机号
}

const tableData = ref<UserItem[]>([]); // 列表
const total = ref(1); // 总条数
// 查询参数
const queryParams = reactive({
  startTime: "", // 创建开始时间查询
  endTime: "", // 创建结束时间查询
  deptId: "", // 部门ID查询
  userName: "", // 用户名查询
  userPhone: "", // 手机号查询
  pageNum: 1, // 页码
  pageSize: 10, // 页大小
});

onMounted(() => {
  getList(); // 首次加载
});

const isSelectable = (row) => {
  return row.userName !== "admin";
};

const search = () => {
  getList();
};
const treeCheck = (selectedKeys: string[], info: any) => {
  if (selectedKeys && selectedKeys.length > 0) {
    // 如果是单选，则取第一个元素
    queryParams.deptId = selectedKeys[0];
  }
  search();
};
const queryDeptList = () => {
  const keyword = treeInputValue.value?.trim() || "";
  if (keyword) {
    deptList.value = filterMenuTree(deptList.value, keyword);
  } else {
    getDeptList();
  }
};

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

const handleResetPassword = async (row: UserItem) => {
  const res = await resetPassword({ userId: row.userId });
  if (res.code === 200) {
    ElMessage.success(res.msg);
    await getList(); // 刷新列表
  } else {
    ElMessage.error(res.msg);
  }
};
const handleDateChange = (val: any) => {
  if (val.length) {
    queryParams.startTime = val[0];
    queryParams.endTime = val[1];
  }
};
const reset = () => {
  queryParams.userType = "";
  queryParams.userName = "";
  queryParams.userPhone = "";
  queryParams.deptId = "";
  queryParams.startTime = "";
  queryParams.endTime = "";
  search();
};
// 获取用户列表
const getList = async () => {
  try {
    loading.value = true;
    const res = await getUserList({ ...queryParams });
    if (res.code === 200) {
      tableData.value = res.data;
      total.value = res.total;
      loading.value = false;
    }
  } catch (error) {
    loading.value = false;
    return false;
  }
};
// 单个删除用户
const handleDelete = async (row: UserItem) => {
  try {
    const res = await deleteUser({ userIds: row.userId });
    if (res.code === 200) {
      ElMessage.success(res.msg);
      await getList(); // 刷新列表
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false;
  }
};

// 批量删除用户
const handleBatchDelete = async () => {
  try {
    if (selectedIds.value.length === 0) {
      ElMessage.warning("请选择需要删除的用户");
      return;
    }
    // 新增：删除确认弹窗（核心新增逻辑）
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条用户数据吗？删除后数据不可恢复！`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true,
      }
    );
    // 用户点击「确定」后，再调用删除接口
    const res = await deleteUser({ userIds: selectedIds.value.join(",") });
    if (res.code === 200) {
      ElMessage.success(res.msg);
      await getList(); // 刷新用户列表
      selectedIds.value = []; // 清空已选中的ID
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false;
  }
};
const handleSelectionChange = (selection) => {
  // 处理选择变化，替代原有的select和selectAll方法
  selectedIds.value = selection.map((item) => item.userId);
};

const onAdd = () => {
  AddUserModalRef.value?.add();
};

const onEdit = (item: UserItem) => {
  AddUserModalRef.value?.edit(item);
};

const openDetail = (item: UserItem) => {
  UserDetailDrawerRef.value?.open(item.userId);
};
</script>

<style lang="scss" scoped></style>
