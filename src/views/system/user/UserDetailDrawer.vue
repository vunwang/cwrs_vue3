<template>
  <el-drawer
      v-model="visible"
      title="用户详情"
      size="50%"
      resizable
      :close-on-click-modal="true"
      :close-on-press-escape="true"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">用户详情</span>
      </div>
    </template>
    <!-- 详情布局：2列展示，长字段跨列 -->
    <el-descriptions
        :column="2"
        border
        label-width="140px"
        class="user-detail-descriptions"
    >
     <el-descriptions-item label="用户ID">{{
          user?.userId || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="用户名">{{
          user?.userName || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="昵称">
        <CwrsCellAvatar
            :avatar="user?.avatar"
            :name="user?.nickName || '未知昵称'"
            style="vertical-align: middle"
        ></CwrsCellAvatar>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <CwrsCellTag
            :value="user?.userStatus"
            :dict="userStatusOptions"
            fallback="-"
        ></CwrsCellTag>
      </el-descriptions-item>
      <el-descriptions-item label="性别">
        <CwrsCellTag
            :value="user?.gender"
            :dict="genderOptions"
            fallback="-"
        ></CwrsCellTag>
      </el-descriptions-item>
      <el-descriptions-item label="出生日期">{{
          parseTime(user?.birth, "{y}-{m}-{d}") || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="手机号">{{
          user?.userPhone || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="邮箱">{{
          user?.email || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="所属组织">{{
          user?.deptName || "系统默认组织"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="岗位名称">{{
          user?.postName || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="角色名称">{{
          user?.roleName || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
          parseTime(user?.createdTime) || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="创建用户">{{
          user?.createdUserName || "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="描述">{{
          user?.desc || "-"
        }}
      </el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>

<script lang="ts" setup>
import {ref, computed} from "vue";
import {ElMessage} from "element-plus";
import {parseTime} from "@/utils/time";
import {useDict} from "@/hooks/app";
import {getUserDetail} from "@/apis/system/user";

// ========== 1. 字典数据 ==========
const {data: userStatusOptions} = useDict({dictCode: "sys_status"});
const {data: genderOptions} = useDict({dictCode: "sys_gender"});

// ========== 2. 响应式变量 ==========
const visible = ref(false); // 抽屉显示状态
const userId = ref(""); // 当前查看的用户ID
const user = ref<any>(null); // 用户详情数据


/**
 * 获取用户详情数据
 */
const getDetail = async () => {
  try {
    const res = await getUserDetail({userId: userId.value});
    if (res.code === 200) {
      user.value = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    return false
  }
};

// ========== 4. 对外暴露方法 ==========
const open = async (id: string) => {
  userId.value = id;
  visible.value = true;
  await getDetail(); // 打开抽屉时加载详情数据
};

defineExpose({open});
</script>

<style lang="scss" scoped>
.user-detail-descriptions {
  margin-top: 20px;

  // 调整描述项间距和样式
  :deep(.el-descriptions-item) {
    padding: 12px 16px;

    // 标签组件垂直居中
    :deep(.cwrs-cell-tag) {
      vertical-align: middle;
    }

    // 图片组件间距
    :deep(.el-image) {
      margin-right: 8px;
    }
  }

  // 跨列项样式
  :deep(.el-descriptions-item--span-2) {
    padding-left: 16px;
  }
}
</style>
