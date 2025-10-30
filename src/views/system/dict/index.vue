<template>
  <el-card title="字典管理" class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">字典管理</div>
      </div>
    </template>
    <el-row justify="space-between">
      <div>
        <el-button type="primary" v-hasPerm="['sys:dict:add']" @click="onAdd">
          <template #icon>
            <el-icon>
              <Plus/>
            </el-icon>
          </template>
          <span>新增</span>
        </el-button>
        <el-button
            type="danger"
            :disabled="!selectedKeys.length"
            v-hasPerm="['sys:dict:del']"
            @click="onMulDelete"
        >
          <template #icon>
            <el-icon>
              <Delete/>
            </el-icon>
          </template>
          <span>批量删除</span>
        </el-button>
      </div>
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="">
          <CwrsSelect
              v-model="queryParams.dictStatus"
              :options="sysStatus"
              :width="120"
              placeholder="状态"
              allow-clear
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
              v-model="queryParams.dictName"
              placeholder="字典类型名称/编码"
              allow-clear
              style="width: 250px"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="">
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
        :data="tableData"
        row-key="dictId"
        style="width: 100%"
        border
        v-loading="loading"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" width="64" type="index" :index="1"/>
      <el-table-column prop="dictName" label="字典名称"/>
      <el-table-column label="字典编码" prop="dictCode">
        <template #default="{ row }">
          <el-link
              type="primary"
              underline="never"
              @click="onViewDictData(row)"
          >{{ row.dictCode }}
          </el-link
          >
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <CwrsCellTag :value="row.dictStatus" :dict="sysStatus"></CwrsCellTag>
        </template>
      </el-table-column>
      <el-table-column
          label="排序"
          prop="dictSort"
          width="80"
      ></el-table-column>
      <el-table-column
          label="描述"
          prop="desc"
          show-overflow-tooltip
      >
        <template #default="scope">
          <span>{{ scope.row.desc || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdTime" width="180">
        <template #default="{ row }">{{ parseTime(row.createdTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
              type="primary"
              v-hasPerm="['sys:dict:edit']"
              size="small"
              @click="onEdit(row)"
          >
            <!-- <template #icon>
                <el-icon>
                  <Edit/>
                </el-icon>
              </template> -->
            <span>编辑</span>
          </el-button>
          <el-popconfirm
              title="确定删除该字典项吗?"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="onDelete(row)"
          >
            <template #reference>
              <el-button
                  type="danger"
                  size="small"
                  v-hasPerm="['sys:dict:del']"
              >
                <!-- <template #icon>
                    <el-icon>
                      <Delete/>
                    </el-icon>
                  </template> -->
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

    <AddDictModal ref="AddDictModalRef" @save-success="search"></AddDictModal>
    <DictDataModal ref="DictDataModalRef"></DictDataModal>
  </el-card>
</template>

<script setup lang="ts">
import {Message} from "@arco-design/web-vue";
import AddDictModal from "./AddDictModal.vue";
import DictDataModal from "./DictDataModal/index.vue";
import {useDict} from "@/hooks/app";
import {delDict, getDictList} from "@/apis/system";
import {parseTime} from "@/utils/time";
import {Delete, Edit, Plus} from "@element-plus/icons-vue";
import {ElForm, ElMessageBox, ElMessage} from "element-plus";

defineOptions({name: "SystemDict"});

const {data: sysStatus} = useDict({dictCode: "sys_status"});
const AddDictModalRef = useTemplateRef("AddDictModalRef");
const DictDataModalRef = useTemplateRef("DictDataModalRef");

// 表格数据
const loading = ref(false);
const tableData = ref<any[]>([]);
const selectedKeys = ref<string[]>([]); // Element Plus selection 返回数组
const total = ref(0); // 分页总数

// 分页查询参数（必须叫 queryParams，字段必须是 pageNum / pageSize）
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dictName: "",
  dictStatus: "",
});

onMounted(() => {
  getList();
});

// 查询方法（必须叫 getList）
const getList = async () => {
  loading.value = true;
  try {
    const res = await getDictList(queryParams);
    tableData.value = res.data || [];
    total.value = res.total || 0;
    loading.value = false
  } catch (error) {
    loading.value = false;
    return false
  }
};

const search = () => {
  getList();
};

const reset = () => {
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.dictName = "";
  queryParams.dictStatus = "";
  search();
};

// 批量删除
const onMulDelete = async () => {
  try {
    if (!selectedKeys.value.length) {
      return Message.warning("请选择字典！");
    }
    // 新增：删除确认弹窗（核心新增逻辑）
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedKeys.value.length} 条字典项吗？删除后数据不可恢复！`,
        "确认删除",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          draggable: true,
        }
    );
    // 用户点击「确定」后，再调用删除接口
    const res = await delDict({dictIds: selectedKeys.value.join(",")});
    if (res.code === 200) {
      ElMessage.success(res.msg);
      await getList(); // 刷新字典项列表
      selectedKeys.value = []; // 清空已选中的ID
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false
  }
};

// 表格多选变化
const handleSelectionChange = (selection: any[]) => {
  selectedKeys.value = selection.map((item) => item.dictId);
};

const onAdd = () => {
  AddDictModalRef.value?.add();
};

const onEdit = (item: any) => {
  AddDictModalRef.value?.edit(item.dictId);
};

const onDelete = async (item: any) => {
  try {
    const res = await delDict({dictIds: item.dictId});
    if (res) {
      Message.success(res.msg);
      search();
    }
  } catch (error) {
    return false
  }
};

const onViewDictData = (item: any) => {
  DictDataModalRef.value?.open({dictCode: item.dictCode});
};
</script>

<style lang="scss" scoped></style>
