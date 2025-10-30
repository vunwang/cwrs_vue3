<template>
  <el-row justify="space-between">
    <div>
      <el-button type="primary" @click="onAdd" v-hasPerm="['sys:param:add']">
        <el-icon class="el-icon--left">
          <Plus/>
        </el-icon>
        新增
      </el-button>
      <el-button
          type="danger"
          @click="onBatchDelete"
          :disabled="!multipleSelection.length"
          v-hasPerm="['sys:param:del']"
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
            v-model="queryParams.createdUserName"
            placeholder="创建用户"
            style="width: 200px"
            clearable
        />
      </el-form-item>
      <el-form-item label="">
        <DeptTreeSelect
            v-model="queryParams.deptId"
            placeholder="请选择所属组织"
            style="width: 200px"
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
  <el-table
      v-loading="loading"
      ref="tableRef"
      :data="paramList"
      style="width: 100%"
      border
      row-key="paramId"
      @selection-change="handleSelectionChange"
  >
    <el-table-column
        type="selection"
        width="55"
        align="center"
        :selectable="isSelectable"
    />
    <el-table-column type="index" width="70" label="序号" align="center"/>
    <el-table-column prop="sysLogo" label="logo" width="60" align="center">
      <template #default="scope">
        <div v-if="scope.row.sysLogo">
          <el-image
              preview-teleported
              style="width: 30px; height: 30px"
              :src="scope.row.sysLogo"
              :hide-on-click-modal="true"
              fit="fill"
              :preview-src-list="[scope.row.sysLogo]"
          />
        </div>
        <div v-else>-</div>
      </template>
    </el-table-column>
    <el-table-column
        prop="sysTitle"
        label="平台名称"
        show-overflow-tooltip
    />
    <el-table-column
        prop="largeScreenTitle"
        label="大屏标题"
        show-overflow-tooltip
    />
    <el-table-column label="所属组织" prop="deptName" show-overflow-tooltip>
      <template #default="scope">
        <span>{{ scope.row.deptName || '系统默认组织' }}</span>
      </template>
    </el-table-column>
    <el-table-column
        prop="createdUserName"
        label="创建用户"
        show-overflow-tooltip
    />
    <el-table-column
        prop="createdTime"
        label="创建时间"
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
            @click="handleEdit(scope.row)"
            v-hasPerm="['sys:param:edit']"
        >
          编辑
        </el-button>
        <el-button size="small" type="success" @click="handleDetail(scope.row)">
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
                v-hasPerm="['sys:param:del']"
                type="danger"
                size="small"
                v-if="scope.row.deptId != 'all'"
            >
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
        label-width="150px"
        style="margin-top: 20px"
    >
      <el-form-item label="所属组织" prop="deptId"  v-if="dialogForm.deptId != 'all'">
        <DeptTreeSelect
            :disabled="isDisabled"
            v-model="dialogForm.deptId"
            placeholder="请选择所属组织"
        />
      </el-form-item>
      <el-form-item label="logo图片" prop="sysLogo">
        <div style=" display: flex; align-items: center; justify-content: center; ">
          <div>
            <el-image
                v-if="dialogForm.sysLogo"
                style="width: 50px; height: 50px; margin-right: 20px"
                :src="dialogForm.sysLogo"
                :preview-src-list="[dialogForm.sysLogo]"
                :hide-on-click-modal="true"
                fit="fill"
            />
          </div>
          <ElUpload
              ref="uploadRef"
              accept=".jpg,.png"
              :fileMaxSize="20"
              dirName="images"
              @onSubmitUploadResult="handleUploadResult"
          ></ElUpload>
        </div>
      </el-form-item>
      <el-form-item label="平台名称" prop="sysTitle">
        <el-input v-model="dialogForm.sysTitle" maxlength="10" placeholder="请输入平台名称"/>
      </el-form-item>
      <el-form-item label="大屏标题" prop="largeScreenTitle">
        <el-input
            v-model="dialogForm.largeScreenTitle"
            placeholder="请输入大屏标题"
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
      title="系统参数详情"
      v-model="detailVisible"
      size="30%"
      resizable
      direction="rtl"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">{{ dialogTitle }}</span>
      </div>
    </template>
    <el-descriptions :column="1" border label-width="200px">
      <el-descriptions-item label="logo图片">
        <el-image
            :preview-src-list="[detailData.sysLogo]"
            v-if="detailData.sysLogo"
            :src="detailData.sysLogo"
            style="width: 50px; height: 50px"
            fit="fill"
            :hide-on-click-modal="true"
            preview-teleported
        />
      </el-descriptions-item>
      <el-descriptions-item label="所属组织" v-if="detailData.deptName">
        {{ detailData.deptName }}
      </el-descriptions-item>
      <el-descriptions-item label="平台名称">
        {{ detailData.sysTitle }}
      </el-descriptions-item>
      <el-descriptions-item label="大屏标题">
        {{ detailData.largeScreenTitle }}
      </el-descriptions-item>
      <el-descriptions-item label="创建用户">
        {{ detailData.createdUserName }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ parseTime(detailData.createdTime) }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="detailVisible = false">关闭</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from "vue";
import {ElMessage, ElMessageBox, ElForm} from "element-plus";
import {parseTime} from "@/utils/time";
import {
  getParamList, //获取系统参数数据列表
  detailSysParam, //查询系统参数详情
  delSysParam, //删除系统参数
  addSysParam, //新增系统参数
  editSysParam, //修改系统参数
} from "@/apis/system/parameter";

defineOptions({name: "SystemParameter"});
//==========上传文件并提交数据==========
const uploadRef = ref();
const loading = ref(true);

// 类型定义
interface SystemParam {
  paramId?: string;
  createdTime?: string;
  createdUserName?: string;
  deptId?: string;
  deptName?: string;
  largeScreenTitle?: string;
  sysLogo?: string;
  sysTitle?: string;
}

// 响应式数据
const paramList = ref<SystemParam[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const detailVisible = ref(false);
const isDisabled = ref(false);

const dialogTitle = ref("新增系统参数");
const editId = ref(""); //编辑接口入参id
const selectDeptName = ref(""); //下拉框回显赋值中文
const detailData = ref<SystemParam>({});
const formRef = ref<InstanceType<typeof ElForm>>();
const tableRef = ref<any>(null);
const multipleSelection = ref<SystemParam[]>([]);
// 表单数据
const queryParams = reactive({
  createdUserName: "",
  deptId: "",
  pageNum: 1,
  pageSize: 10,
});
// 对话框表单数据
const dialogForm = reactive<SystemParam>({
  deptId: "",
  largeScreenTitle: "",
  sysLogo: "",
  sysTitle: "",
});
// 表单验证规则
const formRules = reactive({
  deptId: [{required: true, message: "请选择所属组织", trigger: "change"}],
  largeScreenTitle: [
    {required: true, message: "请输入大屏标题", trigger: "blur"},
  ],
  sysTitle: [{required: true, message: "请输入平台名称", trigger: "blur"}],
});
// 生命周期钩子
onMounted(() => {
  getList();
});
// 把原来的search方法转移到getList
const search = () => {
  getList();
};

const isSelectable = (row) => {
  return row.deptId != "all";
};

// 处理选择变化
const handleSelectionChange = (val: SystemParam[]) => {
  multipleSelection.value = val;
};

// 获取系统参数列表
const getList = async () => {
  try {
    loading.value = true;
    const res = await getParamList(queryParams);
    if (res && res.data) {
      paramList.value = res.data; // 直接赋值后端树形数据
      total.value = res.total;
      loading.value = false;
    }
  } catch (error) {
    loading.value = false;
    return false
  }
};
const transformDeptData = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) return [];
  return nodes.map((node) => {
    return {
      key: node.deptId,
      title: node.deptName,
      children: transformDeptData(node.children),
    };
  });
};

// 上传
const handleUploadResult = (uploadResult, imageUrl, fileSize) => {
  if (uploadResult === "success") {
    dialogForm.sysLogo = imageUrl;
  }
};
// 重置
const reset = () => {
  queryParams.createdUserName = "";
  queryParams.deptId = "";
  selectDeptName.value = ""; // 清除部门中文显示
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  search();
};

// 新增
const onAdd = () => {
  dialogTitle.value = "新增系统参数";
  isDisabled.value = false;
  editId.value = "";
  // 重置表单
  Object.assign(dialogForm, {
    deptId: "",
    largeScreenTitle: "",
    sysLogo: "",
    sysTitle: "",
  });
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: SystemParam) => {
  dialogTitle.value = "编辑系统参数";
  isDisabled.value = true;
  editId.value = row.paramId as string;
  // 填充表单数据
  Object.assign(dialogForm, {
    deptId: row.deptId,
    largeScreenTitle: row.largeScreenTitle,
    sysLogo: row.sysLogo,
    sysTitle: row.sysTitle,
  });
  dialogVisible.value = true;
};

// 详情
const handleDetail = async (row: SystemParam) => {
  try {
    dialogTitle.value = "系统参数详情";
    if (!row.paramId) return;
    const res = await detailSysParam({paramId: row.paramId});
    if (res && res.data) {
      detailData.value = res.data;
      detailVisible.value = true;
    }
  } catch (error) {
    return false
  }
};

// 批量删除系统参数
const onBatchDelete = async () => {
  try {
    // 1. 检查是否有选中的记录
    if (multipleSelection.value.length === 0) {
      ElMessage.warning("请选择要删除的系统参数记录");
      return;
    }
    // 新增：删除确认弹窗（核心新增逻辑）
    await ElMessageBox.confirm(
        `确定要删除选中的 ${multipleSelection.value.length} 条系统参数记录吗？删除后数据不可恢复！`,
        "确认删除",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          draggable: true,
        }
    );
    // 用户点击「确定」后，再调用删除接口
    const res = await delSysParam({
      paramIds: multipleSelection.value.map((item) => item.paramId).join(","),
    });
    if (res.code === 200) {
      ElMessage.success(res.msg);
      await getList(); // 刷新用户列表
      multipleSelection.value = []; // 清空已选中的ID
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false
  }
};
// 删除
const handleDelete = async (row: SystemParam) => {
  try {
    if (!row.paramId) {
      ElMessage.warning("记录ID不存在，无法删除");
      return;
    }
    const res = await delSysParam({paramIds: row.paramId});
    if (res && res.code === 200) {
      ElMessage.success(res.msg);
      search(); // 刷新表格数据
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false
  }
};

// 对话框确认
const handleDialogConfirm = async () => {
  try {
    // 1. 表单验证
    if (!formRef.value) return;
    const valid = await formRef.value.validate();
    if (!valid) return;
    let finalImageUrl = dialogForm.sysLogo; // 默认使用当前的sysLogo
    // 2. 如果有上传组件且选择了新文件，则等待上传完成
    if (uploadRef.value) {
      try {
        // 尝试上传，如果没有选择新文件，uploadRef.value.submitUpload()会返回原有的imageUrl
        const imageUrl = await uploadRef.value.submitUpload(
            dialogForm.sysLogo,
            // dialogForm.fileSize
        );
        finalImageUrl = imageUrl; // 使用上传返回的URL（可能是新的也可能是原有的）
        // 手动触发一次验证（可选，根据实际情况）
      } catch (error) {
        // 上传失败或取消，使用原有的图片URL
        finalImageUrl = dialogForm.sysLogo;
      }
    }
    // 3. 更新表单中的图片URL
    dialogForm.sysLogo = finalImageUrl;
    if (dialogForm.sysLogo == "") {
      ElMessage.warning("请上传logo");
      return;
    }
    // 4. 执行新增/编辑操作
    if (editId.value) {
      const res = await editSysParam({...dialogForm, paramId: editId.value});
      if (res?.code === 200) ElMessage.success(res.msg);
    } else {
      const res = await addSysParam(dialogForm);
      if (res?.code === 200) ElMessage.success(res.msg);
    }

    // 5. 关闭弹窗并刷新
    dialogVisible.value = false;
    search();
  } catch (error) {
    return false
  }
};

// 对话框关闭
const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.clearValidate();
  }
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
