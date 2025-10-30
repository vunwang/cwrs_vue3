<template>
  <el-card class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">组织管理</div>
      </div>
    </template>
    <!-- 左侧按钮组 -->
    <el-row justify="space-between">
      <div>
        <el-button type="primary" v-hasPerm="['sys:dept:add']" @click="onAdd()">
          <el-icon>
            <Plus/>
          </el-icon>
          <span>新增</span>
        </el-button>
        <!--        <el-button-->
        <!--          type="danger"-->
        <!--          v-hasPerm="['sys:dept:del']"-->
        <!--          @click="onMulDelete"-->
        <!--          :disabled="!selectedKeys.length"-->
        <!--        >-->
        <!--          <el-icon>-->
        <!--            <Delete />-->
        <!--          </el-icon>-->
        <!--          <span>批量删除</span>-->
        <!--        </el-button>-->
      </div>
      <!-- 右侧搜索区 -->
      <el-space wrap>
        <CwrsSelect
            v-model="form.deptStatus"
            :options="sysStatus"
            :width="120"
            placeholder="状态"
            allow-clear
        />
        <el-input
            v-model="form.deptName"
            placeholder="输入组织名称搜索"
            clearable
            style="width: 250px"
        >
        </el-input>
        <el-button type="primary" @click="search">
          <template #icon>
            <icon-search/>
          </template>
          <span>查询</span>
        </el-button>
        <el-button @click="reset">
          <template #icon>
            <icon-refresh/>
          </template>
          <span>重置</span>
        </el-button>
      </el-space>
    </el-row>
    <!-- 表格 -->
    <el-table
        ref="tableRef"
        class="gi_table"
        :data="deptList"
        row-key="deptId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
        v-loading="loading"
        border
        style="width: 100%; margin-top: 10px"
        :row-selection="{
        type: 'checkbox',
        selectedKeys: selectedKeys,
      }"
        @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <!--      <el-table-column type="selection" align="center" width="55"/>-->
      <el-table-column prop="deptName" label="组织名称"/>
      <el-table-column
          prop="deptSort"
          label="排序"
          width="100"
          align="center"
      />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <CwrsCellTag :value="row.deptStatus" :dict="sysStatus"/>
        </template>
      </el-table-column>
      <el-table-column prop="createdTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ parseTime(row.createdTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              v-hasPerm="['sys:dept:add']"
              @click="onAdd(row)"
          >
            <span>新增</span>
          </el-button>
          <el-button
              type="primary"
              size="small"
              v-hasPerm="['sys:dept:edit']"
              @click="onEdit(row)"
          >
            <span>编辑</span>
          </el-button>
          <el-popconfirm
              title="确定删除该组织吗?"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="onDelete(row)"
          >
            <template #reference>
              <el-button v-if="row.deptId !== userStore.deptId"
                  type="danger"
                  size="small"
                  v-hasPerm="['sys:dept:del']"
              >
                <span>删除</span>
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <AddDeptModal ref="AddDeptModalRef" @save-success="search"/>
  </el-card>
</template>

<script setup lang="ts">
import {ref, reactive, computed, nextTick, onMounted} from "vue";
import {ElForm, ElMessage, ElMessageBox} from "element-plus";
import {Plus, Delete, Search, Refresh, Edit} from "@element-plus/icons-vue";
import AddDeptModal from "./AddDeptModal.vue";
import {useTable} from "@/hooks";
import {delDept, getDeptList} from "@/apis/system";
import {useDict} from "@/hooks/app";
import {parseTime} from "@/utils/time";
import {useUserStore} from "@/stores";

const userStore = useUserStore()

defineOptions({name: "SystemDept"});

const {data: sysStatus} = useDict({dictCode: "sys_status"});

const AddDeptModalRef = ref();
const tableRef = ref();

const form = reactive({
  deptName: "",
  deptStatus: "",
});

// 选中的行 keys
const selectedKeys = ref<string[]>([]);

const {
  loading,
  tableData: deptList,
  search,
  fixed,
} = useTable(() => getDeptList(form), {
  immediate: true,
  rowKey: "deptId",
});

const reset = () => {
  form.deptName = "";
  form.deptStatus = "";
  search();
};

// 行选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedKeys.value = selection.map((item) => item.deptId);
};

// 新增（无参数为根新增，有参数为子新增）
const onAdd = (item?: any) => {
  AddDeptModalRef.value?.add(item?.deptId || "");
};

// 编辑
const onEdit = (item: any) => {
  AddDeptModalRef.value?.edit(item.deptId);
};

// 批量删除
const onMulDelete = async () => {
  try {
    if (selectedKeys.value.length === 0) {
      ElMessage.warning("请选择组织！");
      return;
    }
    await ElMessageBox.confirm("确定要删除选中的数据吗？", "确认删除", {
      type: "warning",
    });
    const deptIds = selectedKeys.value.join(",");
    const res = await delDept({deptIds});
    if (res) {
      ElMessage.success(res.msg);
      search();
      selectedKeys.value = []; // 清空选择
    }
  } catch (error) {
    return false
  }
};

// 单个删除
const onDelete = async (item: any) => {
  try {
    const res = await delDept({deptIds: item.deptId});
    if (res) {
      ElMessage.success(res.msg);
      search();
    }
  } catch (error) {
    return false
  }
};
</script>

<style lang="scss" scoped></style>
