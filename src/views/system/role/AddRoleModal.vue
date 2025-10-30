<template>
  <!-- :before-close="handleBeforeClose" -->
  <el-dialog
      v-model="visible"
      :title="title"
      width="50%"
      @close="close"
  >
    <!-- 自定义头部插槽 -->
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">{{ title }}</span>
      </div>
    </template>
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="default"
        label-width="100px"
    >
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="所属组织" prop="deptId">
            <DeptTreeSelect
                v-model="form.deptId"
                placeholder="请选择所属组织"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色名称" prop="roleName">
            <el-input
                v-model.trim="form.roleName"
                placeholder="请输入角色名称"
                clearable
                :maxlength="10"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色编码" prop="roleCode">
            <el-input
                v-model.trim="form.roleCode"
                placeholder="请输入角色编码"
                clearable
                :disabled="isEdit"
                :maxlength="10"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="roleSort">
            <el-input-number
                v-model="form.roleSort"
                :min="1"
                style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="roleStatus">
            <CwrsSwitch v-model="form.roleStatus" size="default"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="描述" prop="desc">
            <el-input
                type="textarea"
                v-model.trim="form.desc"
                placeholder="请填写描述"
                :maxlength="200"
                show-word-limit
                resize="none"
                :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 平台菜单权限区域 -->
    <el-row :gutter="50" style="margin-top: 20px">
      <el-col :span="24">
        <PtTree
            ref="ptTreeRef"
            :menu-data="menuData"
            :data-purview="dataPurview"
            :sys-menu-type="sysMenuType"
            :role-menus="form.roleMenus"
        />
      </el-col>
      <!--      <el-col :span="12">-->
      <!--        <appTree-->
      <!--            ref="appTreeRef"-->
      <!--            :menu-app-data="menuAppData"-->
      <!--            :data-purview="dataPurview"-->
      <!--            :sys-menu-type="sysMenuType"-->
      <!--            :role-menus-app="form.roleMenusApp"-->
      <!--        />-->
      <!--      </el-col>-->
    </el-row>

    <template #footer>
      <div style="display: flex; justify-content: right">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="save">提交</el-button>
      </div>
      <span class="dialog-footer"> </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import PtTree from "./tableCom/ptTree.vue"; // 导入子组件
import appTree from "./tableCom/appTree.vue"; // 导入子组件
import {
  getRoleDetail,
  addRole,
  getDeptList,
  getMenuList,
  updateRole,
  getMenuAppList,
} from "@/apis/system";
import {ref, computed, watch, nextTick, onMounted} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {useDict} from "@/hooks/app";
import type {FormInstance} from "element-plus";
// import type { ElTable } from "element-plus";
// 获取子组件ref
const ptTreeRef = ref<any>(null);
const appTreeRef = ref<any>(null);
const {data: sysMenuType} = useDict({dictCode: "sys_menu_type"});
// 定义组件事件
const emit = defineEmits<{
  (e: "save-success"): void;
}>();

// 表单相关 refs
const formRef = ref<FormInstance | null>(null);
const roleId = ref("");
const isEdit = computed(() => !!roleId.value);
const visible = ref(false);
const title = computed(() => (isEdit.value ? "编辑角色" : "新增角色"));
const deptList = ref([]);

// 表单数据
const form = ref({
  deptId: "",
  roleName: "",
  roleCode: "",
  roleSort: 1,
  roleStatus: "1",
  desc: "",
  roleMenus: [],
  roleMenusApp: [],
});

const {data: dataPurview} = useDict({dictCode: "sys_data_purview"});

// 表单校验规则
const rules = ref({
  deptId: [{required: true, message: "请选择所属组织", trigger: "blur"}],
  roleName: [
    {required: true, message: "请输入角色名称", trigger: "blur"},
    {min: 3, max: 10, message: "长度在 3 - 10 个字符", trigger: "blur"},
  ],
  roleCode: [
    {required: true, message: "请输入角色编码", trigger: "blur"},
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: "格式错误！需英文开头，可包含英文、数字、下划线",
      trigger: "blur",
    },
  ],
  roleSort: [{required: true, message: "请设置排序", trigger: "blur"}],
  roleStatus: [{required: true, message: "请选择状态", trigger: "change"}],
});

// 定义 MenuItem 接口（拆分dataPurview和dictItemId为同级字段）
interface MenuItem {
  menuId: string; // 接口返回的唯一标识
  name: string;
  menuType: string;
  dataPurview: string; // 存储itemValue
  dictItemId: string; // 存储dictItemId
  children?: MenuItem[];
  hasChildren?: boolean;
  showDeptBtn?: boolean; // 新增：是否显示“选择部门”按钮
}

// 保存menuData的初始副本
// const initialMenuData = ref<MenuItem[]>([]);
// 初始化菜单数据（包含两个独立字段）
const menuData = ref<MenuItem[]>([]);
// 新增：APP菜单数据（存储getMenuAppList的结果）
const menuAppData = ref<MenuItem[]>([]); // 转换菜单接口数据为 MenuItem 格式
const transformMenuData = (menuNodes: any[]): MenuItem[] => {
  if (!menuNodes || !Array.isArray(menuNodes)) return [];
  return menuNodes.map((node) => {
    const children = transformMenuData(node.children || node.childMenus);
    return {
      menuId: node.menuId,
      name: node.menuName || node.name,
      menuType: node.type,
      dataPurview: "",
      dictItemId: "",
      children: children.length > 0 ? children : undefined,
      hasChildren: children.length > 0,
      showDeptBtn: false, // 初始隐藏按钮
    };
  });
};
onMounted(async () => {
  try {
    const [deptRes, menuRes, menuAppRes] = await Promise.all([
      getDeptList(),
      getMenuList(),
      getMenuAppList(),
    ]);
    deptList.value = transformDeptData(deptRes.data);
    menuData.value = addDeptIdsField(menuRes.data); // 赋值给menuData，子组件通过props接收
    menuAppData.value = addDeptIdsField(menuAppRes.data);
  } catch (error) {
    return false
  }
});

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

// 新增角色
const add = () => {
  roleId.value = "";
  visible.value = true;
  resetForm();
};

// 为树形菜单每个节点添加 deptIds: []
const addDeptIdsField = (nodes) => {
  if (!Array.isArray(nodes)) return []
  return nodes.map(node => {
    // 创建新对象，避免修改原始数据
    const newNode = {
      ...node,
      deptIds: [] // 初始化为空数组
    }
    // 递归处理 children
    if (node.children && Array.isArray(node.children)) {
      newNode.children = addDeptIdsField(node.children)
    }
    return newNode
  })
}

// 编辑角色时回显
const edit = async (roleIdParam: string) => {
  try {
    roleId.value = roleIdParam;
    visible.value = true;
    const res = await getRoleDetail({roleId: roleIdParam});
    const roleData = res.data;
    // 回显所属组织
    form.value = {
      ...form.value,
      deptId: roleData.deptId,
      roleName: roleData.roleName,
      roleCode: roleData.roleCode,
      roleSort: roleData.roleSort,
      roleStatus: roleData.roleStatus,
      desc: roleData.desc,
      roleMenus: roleData.roleMenus || [],
      roleMenusApp: roleData.roleMenusApp || [],
    };
  } catch (error) {
    return false
  }
};

// 递归查找组织路径
const findDeptPath = (
    deptList: any[],
    targetId: string,
    currentPath: string[] = []
): string[] => {
  for (const node of deptList) {
    const nodeValue = String(node.value);
    const targetValue = String(targetId);
    const newPath = [...currentPath, nodeValue];
    if (nodeValue === targetValue) {
      return newPath;
    }
    if (
        node.children &&
        Array.isArray(node.children) &&
        node.children.length > 0
    ) {
      const result = findDeptPath(node.children, targetId, newPath);
      if (result.length > 0) {
        return result;
      }
    }
  }
  return [];
};

// 重置表单和表格状态
const resetForm = () => {
  formRef.value?.resetFields();
  form.value = {
    deptId: "",
    roleName: "",
    roleCode: "",
    roleSort: 1,
    roleStatus: "1",
    desc: "",
    roleMenus: [],
    roleMenusApp: [],
  };
};
// 关闭弹窗
const close = () => {
  resetForm();
  visible.value = false;
  // 调用子组件的重置方法
  ptTreeRef.value?.reset();
  appTreeRef.value?.reset();
};
// 保存角色
const save = async () => {
  try {
    await formRef.value?.validate();
    form.value = {
      ...form.value,
      roleId: roleId.value,
      roleMenus: ptTreeRef.value?.getRoleMenus() || [],
      roleMenusApp: appTreeRef.value?.getRoleAppMenus() || [],
    };
    let res;
    if (isEdit.value) {
      // 编辑操作：添加roleId并调用更新接口
      res = await updateRole(form.value);
    } else {
      // 新增操作：调用新增接口
      res = await addRole(form.value);
    }
    if (res) {
      ElMessage.success(res.msg);
      emit("save-success");
      close();
    }
  } catch (error) {
    return false
  }
};
// 暴露组件方法给父组件
defineExpose({add, edit});
</script>

<style scoped>
.menu-permission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.table-operation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tips-text p {
  margin: 4px 0;
}

.dialog-footer {
  display: flex;
  gap: 8px;
}
</style>
