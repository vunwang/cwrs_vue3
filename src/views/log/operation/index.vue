<template>
  <el-card class="gi_page_card">
    <template #header>
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle16">操作日志管理</div>
      </div>
    </template>
    <el-row justify="space-between" :gutter="20">
      <div>
        <!-- 添加删除按钮 -->
      </div>
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="">
          <el-input
              v-model="queryParams.operName"
              placeholder="请输入操作用户名称"
              style="width: 200px"
              clearable
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
              v-model="queryParams.status"
              placeholder="请输入状态码"
              style="width: 120px"
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

    <!-- 操作日志表格 -->
    <el-table
        v-loading="loading"
        ref="tableRef"
        :data="tableData"
        style="width: 100%"
        border
        row-key="operId"
    >
      <el-table-column type="index" width="70" label="序号" align="center"/>
      <el-table-column
          align="center"
          prop="operName"
          label="操作用户"
          width="180"
          show-overflow-tooltip
      />
      <el-table-column
          align="center"
          prop="method"
          label="请求方式"
          width="100"
          show-overflow-tooltip
      />
      <el-table-column
          align="center"
          prop="status"
          label="状态码"
          width="100"
          show-overflow-tooltip
      />
      <el-table-column
          prop="path"
          label="请求路径"
          show-overflow-tooltip
      />
      <el-table-column
          align="center"
          prop="latency"
          label="耗时"
          width="100"
          show-overflow-tooltip
      />
      <el-table-column
          align="center"
          prop="ip"
          label="客户端IP"
          width="200"
          show-overflow-tooltip
      />
      <el-table-column
          prop="operTime"
          label="操作时间"
          width="180"
          align="center"
      >
        <template #default="scope"
        >{{ parseTime(scope.row.operTime) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              type="success"
              @click="handleDetail(scope.row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="display: flex; justify-content: flex-end; margin-top: 10px">
      <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </div>

    <!-- 操作日志详情弹框 -->
    <el-drawer
        v-model="dialogVisible"
        title="操作日志详情"
        size="40%"
        resizable
        direction="rtl"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-header-title">操作日志详情</span>
        </div>
      </template>
      <el-descriptions
          :model="detailData"
          border
          :column="1"
          label-width="150px"
      >
        <el-descriptions-item label="日志主键" :width="535">{{
            detailData.operId
          }}
        </el-descriptions-item>
        <el-descriptions-item label="操作用户" :width="535">{{
            detailData.operName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="操作时间" :width="535">{{
            parseTime(detailData.operTime)
          }}
        </el-descriptions-item>
        <el-descriptions-item label="客户端IP" :width="535">{{
            detailData.ip
          }}
        </el-descriptions-item>
        <el-descriptions-item label="请求方法" :width="535">{{
            detailData.method
          }}
        </el-descriptions-item>
        <el-descriptions-item label="请求路径" :width="535">{{
            detailData.path
          }}
        </el-descriptions-item>
        <el-descriptions-item label="耗时" :width="535">{{
            detailData.latency
          }}
        </el-descriptions-item>
        <el-descriptions-item label="响应状态码" :width="535">{{
            detailData.status
          }}
        </el-descriptions-item>
        <el-descriptions-item label="请求参数" :width="535">
          <span
              v-if="detailData.method == 'GET' || detailData.method == 'DELETE'"
          >{{ detailData.reqBody }}</span
          >
          <div v-if="detailData.method == 'PUT' || detailData.method == 'POST'">
            <div
                style="
                height: 300px;
                width: 530px;
                overflow-y: auto;
                white-space: pre-wrap;
              "
            >
              <pre class="json-pre">{{ detailData.reqBody }}</pre>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="响应数据" :width="535">
          <div
              style="
              height: 300px;
              width: 530px;
              overflow-y: auto;
              white-space: pre-wrap;
            "
          >
            <pre class="json-pre">{{ detailData.resBody }}</pre>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from "vue";
import {ElMessage, ElTable} from "element-plus";
import {parseTime} from "@/utils/time";
import {
  getOperLogList, // 操作日志列表接口
  detailOperLog, // 操作日志详情接口
} from "@/apis/log/operLog"; // 假设操作日志接口路径
defineOptions({name: "LogOperation"});

// 操作日志数据类型定义
interface OperLogItem {
  operId?: string; // 日志主键
  operTime?: string; // 操作时间
  operName?: string; // 操作用户名称
  ip?: string; // 客户端IP
  method?: string; // 请求方法
  path?: string; // 请求路径
  latency?: string; // 耗时
  status?: number; // 响应状态码
  operUserId?: string; // 操作用户id
  reqBody?: string; // 请求参数
  resBody?: string; // 响应数据
}

// 响应式数据
const tableData = ref<OperLogItem[]>([]); // 操作日志列表
const total = ref(0); // 总条数
const tableRef = ref<InstanceType<typeof ElTable>>(); // 表格引用
const dialogVisible = ref(false); // 详情弹框显示状态
const detailData = ref<OperLogItem>({}); // 详情数据（存储单条日志详情）
const createTime = ref([]); // 创建时间范围
// 查询参数
const queryParams = reactive({
  operName: "", // 操作用户名称
  status: "", // 状态码
  startTime: "", // 操作开始时间
  endTime: "", // 操作结束时间
  pageNum: 1, // 页码
  pageSize: 10, // 页大小
});

// 加载状态
const loading = ref(true);

// 生命周期：组件挂载时初始化数据
onMounted(() => {
  getList(); // 获取操作日志列表
});
const handleDateChange = (val: any) => {
  if (val.length) {
    queryParams.startTime = val[0];
    queryParams.endTime = val[1];
  }
};
// 搜索（触发列表查询）
const search = () => {
  queryParams.pageNum = 1; // 搜索时重置页码为1
  getList();
};

// 获取操作日志列表
const getList = async () => {
  try {
    loading.value = true;
    const res = await getOperLogList(queryParams);
    if (res && res.data) {
      tableData.value = res.data;
      total.value = res.total;
      loading.value = false
    }
  } catch (error) {
    loading.value = false;
    return false
  }
};

// 查看详情：调用接口+弹框展示
const handleDetail = async (row: OperLogItem) => {
  try {
    if (!row.operId) return;
    const res = await detailOperLog({operId: row.operId});
    if (res && res.data) {
      let method = res.data.method;
      let reqBody = res.data.reqBody;
      let resBody = res.data.resBody;
      if (method == "POST" || method == "PUT") {
        res.data.reqBody = JSON.stringify(JSON.parse(reqBody), null, 2); // 缩进2个空格，保留JSON结构
      }
      // 尝试解析为 JSON 对象，再格式化为带缩进的字符串
      const parsedResBody = JSON.parse(resBody);
      res.data.resBody = JSON.stringify(parsedResBody, null, 2); // 缩进2个空格，保留JSON结构
      detailData.value = res.data; // 赋值格式化后的数据
      dialogVisible.value = true; // 显示弹框
    }
  } catch (error) {
    return false
  }
};

// 重置查询条件
const reset = () => {
  queryParams.operName = "";
  queryParams.status = "";
  queryParams.startTime = "";
  queryParams.endTime = "";
  createTime.value = []; // 清空创建时间范围
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  search();
};
</script>

<style lang="scss" scoped></style>
