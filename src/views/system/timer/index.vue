<template>
  <el-card class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">任务管理</div>
      </div>
    </template>
    <el-row justify="space-between">
      <div>
        <el-button type="primary" @click="onAdd" v-hasPerm="['sys:timer:add']">
          <el-icon class="el-icon--left">
            <Plus/>
          </el-icon>
          新增
        </el-button>
        <el-button
            type="danger"
            @click="onBatchDelete"
            :disabled="!multipleSelection.length"
            v-hasPerm="['sys:timer:del']"
        >
          <el-icon class="el-icon--left">
            <Delete/>
          </el-icon>
          批量删除
        </el-button>
      </div>
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="">
          <el-input
              v-model="queryParams.taskName"
              placeholder="请输入任务名称"
              style="width: 200px"
              clearable
          />
        </el-form-item>

        <el-form-item label="">
          <CwrsSelect
              v-model="queryParams.taskStatus"
              :options="options"
              :width="120"
              placeholder="状态"
              allow-clear
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">
            <el-icon class="el-icon--left">
              <Search/>
            </el-icon>
            查询
          </el-button>
          <el-button @click="reset">
            <el-icon class="el-icon--left">
              <RefreshRight/>
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <!-- 留言表格 -->
    <el-table
        v-loading="loading"
        ref="tableRef"
        :data="tableData"
        style="width: 100%"
        border
        row-key="taskId"
        @selection-change="handleSelectionChange"
    >
      <!--      :cell-class-name="setCellClass"-->
      <el-table-column
          type="selection"
          width="55"
          align="center"
          :selectable="isSelectable"
      />
      <el-table-column type="index" width="70" label="序号" align="center"/>
      <el-table-column
          align="left"
          prop="taskName"
          label="任务名称"
          width="180"
          show-overflow-tooltip
      />
      <el-table-column
          align="left"
          prop="cronName"
          label="执行时间"
          width="180"
          show-overflow-tooltip
      />
      <el-table-column
          align="center"
          prop="cronExpr"
          label="Cron表达式"
          width="150"
          show-overflow-tooltip
      />
      <el-table-column
          align="left"
          prop="funcName"
          label="要执行的函数名"
          width="180"
          show-overflow-tooltip
      />
      <el-table-column
          align="center"
          prop="taskStatus"
          label="状态"
          width="100"
          show-overflow-tooltip
      >
        <template #default="scope">
          <CwrsCellTag
              :value="scope.row.taskStatus"
              :dict="options"
          ></CwrsCellTag>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          prop="taskStatus"
          label="修改状态"
          width="120"
          v-hasPerm="['sys:timer:edit']"
          show-overflow-tooltip
      >
        <template #default="scope">
          <el-switch
              v-model="scope.row.taskStatus"
              active-value="1"
              inactive-value="2"
              width="60"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
              @change="handleTaskStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
          align="left"
          prop="desc"
          label="描述"
          width="350"
          show-overflow-tooltip
      >
        <template #default="scope">
          <span>{{ scope.row.desc || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          prop="lastRunTime"
          label="最近一次开启/关闭时间"
          width="180"
          show-overflow-tooltip
      >
        <template #default="scope"
        >{{ parseTime(scope.row.lastRunTime) }}
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          prop="createdUserName"
          label="创建用户"
          width="120"
          show-overflow-tooltip
      />
      <el-table-column
          prop="createdTime"
          label="创建时间"
          width="180"
          align="center"
      >
        <template #default="scope"
        >{{ parseTime(scope.row.createdTime) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              v-if="scope.row.taskStatus == '2'"
              @click="handleEdit(scope.row)"
              v-hasPerm="['sys:timer:edit']"
          >
            编辑
          </el-button>
          <el-button
              size="small"
              type="success"
              @click="handleDetail(scope.row)"
          >
            详情
          </el-button>
          <el-popconfirm
              title="确定删除该用户吗？"
              confirm-button-text="确认"
              cancel-button-text="取消"
              @confirm="handleDelete(scope.row)"
          >
            <template #reference>
              <el-button
                  type="danger"
                  size="small"
                  v-if="scope.row.taskStatus == '2'"
                  v-hasPerm="['sys:timer:del']"
              >
                删除
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
        draggable
        v-model="dialogVisible"
        :title="dialogTitle"
        width="50%"
        @close="handleDialogClose"
        append-to-body
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-header-title">{{ dialogTitle }}</span>
        </div>
      </template>
      <el-form
          ref="formRef"
          :model="dialogForm"
          :rules="formRules"
          label-width="130px"
          style="margin-top: 20px"
      >
        <el-form-item label="任务名称" prop="taskName">
          <el-input
              v-model="dialogForm.taskName"
              placeholder="请输入任务名称"
              clearable
          />
        </el-form-item>

        <el-form-item label="执行时间" prop="cronName">
          <el-select
              v-model="dialogForm.cronName"
              placeholder="请选择执行时间"
              style="width: 100%"
          >
            <el-option
                v-for="item in cronNameOptions"
                :key="item.value"
                :label="item.itemName"
                :value="item.itemValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="要执行的函数名" prop="funcName">
          <el-input
              v-model="dialogForm.funcName"
              placeholder="请输入要执行的函数名"
              clearable
          />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
              v-model="dialogForm.desc"
              placeholder="请输入描述"
              clearable
              type="textarea"
              :rows="3"
              resize="none"
          />
        </el-form-item>
        <el-form-item label="JSON格式参数" prop="taskParamsStr">
          <el-input
              v-model="taskParamsStr"
              placeholder="请输入JSON格式参数"
              type="textarea"
              :rows="6"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-drawer
        title="任务详情"
        v-model="detailVisible"
        size="30%"
        resizable
        direction="rtl"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-header-title">任务详情</span>
        </div>
      </template>
      <el-descriptions :column="1" border label-width="200px">
        <el-descriptions-item label="任务名称">
          {{ detailData.taskName }}
        </el-descriptions-item>
        <el-descriptions-item label="执行时间">
          {{ detailData.cronName }}
        </el-descriptions-item>
        <el-descriptions-item label="Cron表达式">
          {{ detailData.cronExpr }}
        </el-descriptions-item>
        <el-descriptions-item label="要执行的函数名">
          {{ detailData.funcName }}
        </el-descriptions-item>
        <el-descriptions-item label="任务状态">
          {{ getTaskStatusText(detailData.taskStatus) }}
        </el-descriptions-item>
        <el-descriptions-item label="最近一次开启/关闭时间">
          {{ parseTime(detailData.lastRunTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="描述">
          {{ detailData.desc }}
        </el-descriptions-item>
        <el-descriptions-item label="创建用户">
          {{ detailData.createdUserName }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(detailData.createdTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="JSON格式参数">
          <div style="height: 250px; overflow-y: auto; white-space: pre-wrap">
            <pre class="json-pre">{{ detailData.taskParams }}</pre>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from "vue";
import {ElMessage, ElMessageBox, ElForm} from "element-plus";
import {parseTime} from "@/utils/time";
import {useDict} from "@/hooks/app";
import {
  getTaskList,
  detailTask,
  startTask,
  stopTask,
  addTask,
  delTask,
  editTask,
} from "@/apis/system/timer";

defineOptions({name: "SystemTimer"});

// 留言数据类型定义
interface TimerItem {
  taskId?: string; // 任务ID
  taskName?: string; // 任务名称
  taskStatus?: string; // 任务状态
  createdTime?: string; // 创建时间
  createdUserName?: string; // 创建用户名称
  cronExpr?: string; // Cron表达式
  cronName?: string; // 执行时间（字典关联）
  desc?: string; // 描述
  funcName?: string; // 要执行的函数名
  lastRunTime?: string; // 最近一次运行时间
  taskParams?: Record<string, any>; // JSON格式参数  （对象类型）
}

const {data: options} = useDict({dictCode: "sys_task_status"});
const {data: cronNameOptions} = useDict({dictCode: "sys_task_cron_expr"});
// 响应式数据
const tableData = ref<TimerItem[]>([]); // 列表
const total = ref(1); // 总条数
const dialogVisible = ref(false); // 新增/编辑弹窗显隐
const detailVisible = ref(false); // 详情弹窗显隐
const dialogTitle = ref("新增留言"); // 弹窗标题
const editId = ref(""); // 编辑ID
const detailData = ref<TimerItem>({}); // 详情数据
const formRef = ref<InstanceType<typeof ElForm>>(); // 表单引用
const tableRef = ref<any>(null); // 表格引用
const multipleSelection = ref<TimerItem[]>([]); // 表格多选数据

// 查询参数
const queryParams = reactive({
  taskStatus: "", // 状态查询
  taskName: "", // 任务名称查询
  pageNum: 1, // 页码
  pageSize: 10, // 页大小
});
// 弹窗表单数据
const dialogForm = reactive<TimerItem>({
  taskId: "",
  taskName: "",
  cronName: "",
  desc: "",
  funcName: "",
  taskParams: {},
});
// 绑定「JSON字符串输入」的响应式变量
const taskParamsStr = ref("");

// 表单验证规则
const formRules = reactive({
  taskName: [{required: true, message: "请输入任务名称", trigger: "blur"}],
  cronName: [{required: true, message: "请输入执行时间", trigger: "blur"}],
  funcName: [
    {required: true, message: "请输入要执行的函数名", trigger: "blur"},
  ],
});

// 加载状态
const loading = ref(true);

// 生命周期：组件挂载时初始化数据
onMounted(() => {
  getList(); // 获取留言列表
});

// 搜索（触发列表查询）
const search = () => {
  getList();
};

const isSelectable = (row) => {
  return row.taskStatus == "2";
};

// 根据任务状态数字，获取对应的中文名称（匹配字典）
const getTaskStatusText = (status?: string) => {
  // 1. 处理状态为空的情况
  if (!status) return "未知状态";
  // 2. 从字典中查找匹配项（item.itemValue 对应状态数字，item.itemName 对应中文）
  const matchItem = options.value?.find(
      (item) => item.itemValue === status // 关键：匹配字典的“值”与返回的状态数字
  );
  // 3. 找到返回中文，没找到返回原数字（避免显示异常）
  return matchItem?.itemName || status;
};
// 表格多选变化回调
const handleSelectionChange = (val: TimerItem[]) => {
  // 2为待处理
  const filteredVal = val.filter(
      (item) => item.taskStatus && item.taskStatus == "2"
  );
  // 若存在不符合条件的项被选中，给出提示并重置选中
  if (val.length > filteredVal.length) {
    ElMessage.warning("仅能选择状态为“停止”的任务进行批量删除");
    // 清空所有选中，再重新勾选符合条件的项
    tableRef.value?.clearSelection();
    filteredVal.forEach((item) => {
      tableRef.value?.toggleRowSelection(item, true);
    });
  }
  multipleSelection.value = filteredVal;
};
// 获取列表
const getList = async () => {
  try {
    const res = await getTaskList(queryParams);
    if (res && res.data) {
      tableData.value = res.data;
      total.value = res.total;
      loading.value = false;
    }
  } catch (error) {
    loading.value = false;
    return false
  }
};

// 处理任务状态改变
const handleTaskStatusChange = async (row: TimerItem) => {
  if (row.taskStatus === "2") {
    await stopTask({taskIds: row.taskId});
    ElMessage.success("任务已关闭");
  } else {
    await startTask({taskIds: row.taskId});
    ElMessage.success("任务已开启");
  }
  // 刷新当前行数据
  await getList();
};

// 重置查询条件
const reset = () => {
  queryParams.taskStatus = "";
  queryParams.taskName = "";
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  search();
};

// 新增任务
const onAdd = () => {
  dialogTitle.value = "新增任务";
  editId.value = "";
  // 重置表单
  taskParamsStr.value = "";
  Object.assign(dialogForm, {
    taskId: "",
    taskName: "",
    cronName: "",
    desc: "",
    funcName: "",
    taskParams: {},
  });
  dialogVisible.value = true;
};

// 编辑任务
const handleEdit = (row: TimerItem) => {
  dialogTitle.value = "编辑任务";
  editId.value = row.taskId as string;
  // 填充所有字段（含新增字段）
  Object.assign(dialogForm, {
    taskName: row.taskName,
    cronName: row.cronName + "," + row.cronExpr,
    desc: row.desc,
    funcName: row.funcName,
    taskId: row.taskId,
  });
  // 转换为JSON字符串
  taskParamsStr.value = JSON.stringify(row.taskParams);
  dialogVisible.value = true;
};

// 查看任务详情
const handleDetail = async (row: TimerItem) => {
  try {
    if (!row.taskId) return;
    const res = await detailTask({taskId: row.taskId});
    if (res && res.data) {
      detailData.value = res.data;
      detailVisible.value = true;
    }
  } catch (error) {
    return false
  }
};

// 批量删除任务
const onBatchDelete = async () => {
  try {
    if (multipleSelection.value.length === 0) {
      ElMessage.warning("请选择要删除的任务");
      return;
    }
    // 收集选中ID
    const idsList = multipleSelection.value
        .map((item) => item.taskId)
        .filter(Boolean);
    if (idsList.length === 0) {
      ElMessage.warning("选中记录无法删除");
      return;
    }
    // 弹窗确认
    await ElMessageBox.confirm(
        `确定要删除选中的${idsList.length}条任务吗？`,
        "确认删除",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
    );
    // 调用批量删除接口
    const res = await delTask({taskIds: idsList.join(",")});
    if (res && res.code === 200) {
      ElMessage.success(res.mag);
      search(); // 刷新列表
      multipleSelection.value = []; // 清空选中
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false
  }
};

// 删除单条任务
const handleDelete = async (row: TimerItem) => {
  try {
    if (!row.taskId) {
      ElMessage.warning("记录ID无效，无法删除");
      return;
    }
    // 调用单条删除接口
    const res = await delTask({taskIds: row.taskId});
    if (res && res.code === 200) {
      ElMessage.success(res.msg);
      search(); // 刷新列表
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false
  }
};

// 弹窗确认（新增/编辑）
const handleDialogConfirm = async () => {
  try {
    // 解析JSON字符串为对象
    if (taskParamsStr.value) {
      try {
        dialogForm.taskParams = JSON.parse(taskParamsStr.value);
      } catch (e) {
        ElMessage.error("请输入合法的JSON字符串");
        return;
      }
    }
    //  表单验证
    if (!formRef.value) return;
    const valid = await formRef.value.validate();
    if (!valid) return;
    if (editId.value) {
      const res = await editTask({
        ...dialogForm,
        taskId: editId.value,
      });
      if (res?.code === 200) ElMessage.success(res.msg);
    } else {
      const res = await addTask(dialogForm);
      if (res?.code === 200) ElMessage.success(res.msg);
    }
    // 5. 关闭弹窗并刷新
    dialogVisible.value = false;
    search();
  } catch (error) {
    return false
  }
};
// 弹窗关闭（重置表单验证）
const handleDialogClose = () => {
  formRef.value?.clearValidate();
};
</script>

<style lang="scss" scoped>
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

/* 隐藏选择框单元格内容 */
::v-deep .selection-hidden .el-checkbox {
  display: none;
}
</style>
