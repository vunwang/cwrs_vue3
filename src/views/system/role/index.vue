<template>
  <el-card class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">角色管理</div>
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
            <icon-search/>
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
          <el-button type="primary" @click="onAdd" v-hasPerm="['sys:role:add']">
            <template #icon>
              <el-icon>
                <Plus/>
              </el-icon>
            </template>
            <span>新增</span>
          </el-button>
          <el-button
              type="danger"
              @click="onMulDelete"
              :disabled="!selectedKeys.length"
              v-hasPerm="['sys:role:del']"
          >
            <template #icon>
              <el-icon>
                <Delete/>
              </el-icon>
            </template>
            <span>批量删除</span>
          </el-button>
        </el-space>
        <el-space wrap>
          <CwrsSelect
              v-model="queryParams.roleStatus"
              :options="options"
              :width="120"
              placeholder="状态"
              allow-clear
          />
          <el-input
              v-model="queryParams.roleName"
              placeholder="输入角色名搜索"
              clearable
              style="width: 200px"
          >
          </el-input>
          <el-input
              v-model="queryParams.roleCode"
              placeholder="输入角色编码搜索"
              clearable
              style="width: 200px"
          >
          </el-input>

          <el-button type="primary" @click="search">
            <el-icon>
              <Search/>
            </el-icon>
            <span>查询</span>
          </el-button>
          <el-button @click="reset">
            <el-icon>
              <Refresh/>
            </el-icon>
            <span>重置</span>
          </el-button>
        </el-space>
      </el-row>
      <el-table class="gi_table" row-key="roleId" :data="tableData" v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" :selectable="isSelectable"/>
        <el-table-column type="index" label="序号" width="64"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleCode" label="角色编码"></el-table-column>
        <el-table-column label="所属组织" prop="deptName" width="180">
          <template #default="scope">
            <span>{{ scope.row.deptName || '系统默认组织' }}</span>
          </template>
        </el-table-column>
        <!-- 是否内置 -->
        <el-table-column label="是否内置" prop="isBuiltin">
          <template #default="scope">
            <span v-if="scope.row.isBuiltin === 1">是</span>
            <span v-else>否</span>
          </template>
        </el-table-column>

        <!-- 排序 -->
        <el-table-column
            prop="roleSort"
            width="100"
            label="排序"
        ></el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.status }}</span>
            <CwrsCellTag
                :value="scope.row.roleStatus"
                :dict="roleStatus"
            ></CwrsCellTag>
          </template>
        </el-table-column>

        <!-- 描述 -->
        <el-table-column
            prop="desc"
            label="描述"
            show-overflow-tooltip
        >
          <template #default="scope">
            <span>{{ scope.row.desc || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 创建用户 -->
        <el-table-column
            prop="createdUserName"
            label="创建用户"
        ></el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="创建时间" width="180" prop="createdTime">
          <template #default="scope">
            {{ parseTime(scope.row.createdTime) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-space v-if="scope.row.isBuiltin === 0">
              <el-button v-hasPerm="['sys:role:edit']" type="primary" size="small" :disabled="scope.row.disabled"
                         @click="onEdit(scope.row)">
                编辑
              </el-button>
              <el-popconfirm title="确定删除该角色吗?" @confirm="onSingleDelete(scope.row.roleId)">
                <template #reference>
                  <el-button v-if="scope.row.roleId !== userStore.roleId" v-hasPerm="['sys:role:del']" type="danger"
                             size="small" :disabled="scope.row.disabled">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </el-space>
            <el-space v-else> -</el-space>
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
    <AddRoleModal ref="AddRoleModalRef" @save-success="search"></AddRoleModal>
  </el-card>
</template>

<script setup lang="ts">
import {ElMessage, ElMessageBox} from "element-plus";
// import { Message } from "@arco-design/web-vue";
import AddRoleModal from "./AddRoleModal.vue";
import {useDept, useDict} from "@/hooks/app";
import {parseTime} from "@/utils/time";
import {type RoleItem, getRoleList, delRole} from "@/apis/system";
import {useUserStore} from "@/stores";

const userStore = useUserStore()

defineOptions({name: "SystemRole"});

const {data: roleStatus} = useDict({dictCode: "sys_status"});
const {data: options} = useDict({dictCode: "sys_status"});
const AddRoleModalRef = useTemplateRef("AddRoleModalRef");

const loading = ref(false);
const selectedKeys = ref([]);
const total = ref(0);
const tableData = ref([]);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  deptId: "", //所属组织
  roleCode: "", //角色编码
  roleName: "", //角色名称
  roleStatus: "", //角色状态
});

const treeRef = useTemplateRef("treeRef");
const treeInputValue = ref("");
const {deptList, getDeptList} = useDept({
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

const isSelectable = (row) => {
  return row.isBuiltin === 0;
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

onMounted(() => {
  search();
});
const search = () => {
  getList();
};

const handleSelectionChange = (val) => {
  selectedKeys.value = val.map((item) => item.roleId);
};
const reset = () => {
  queryParams.deptId = "";
  queryParams.roleCode = "";
  queryParams.roleName = "";
  queryParams.roleStatus = "";
  search();
};
//
const getList = () => {
  try {
    loading.value = true;
    getRoleList(queryParams).then((res) => {
      tableData.value = res.data || [];
      total.value = res.total || 0;
      loading.value = false;
    });
  } catch (error) {
    loading.value = false;
    return false
  }
};
// 单个删除
const onSingleDelete = async (roleId: string) => {
  try {
    // 调用删除接口，传入单个角色ID
    const res = await delRole({roleIds: roleId});
    ElMessage.success(res.msg);
    // 刷新列表
    search();
  } catch (error) {
    return false
  }
};

// 批量删除
const onMulDelete = async () => {
  try {
    if (!selectedKeys.value.length) {
      return ElMessage.warning("请选择角色！");
    }
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedKeys.value.length} 条角色数据吗？删除后数据不可恢复！`,
        "确认删除",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          draggable: true,
        }
    );
    // 将选中的ID数组转换为逗号分隔的字符串
    const roleIds = selectedKeys.value.join(",");
    const res = await delRole({roleIds});
    ElMessage.success(res.msg);
    // 刷新列表
    search();
    // 清空选中状态
    selectedKeys.value = [];
  } catch (error) {
    return false
  }
};

const onAdd = () => {
  AddRoleModalRef.value?.add();
};

const onEdit = (item: RoleItem) => {
  AddRoleModalRef.value?.edit(item.roleId);
};
</script>

<style lang="scss" scoped></style>
<script setup lang="ts"></script>
