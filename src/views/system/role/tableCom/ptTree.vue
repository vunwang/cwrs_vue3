<template>
  <div>
    <!-- 头部标题与操作区 -->
    <div class="menu-permission-header">
      <div class="dis_flex_center">
        <div class="shuxian"></div>
        <div class="fontStyle14">平台菜单权限</div>
      </div>
      <div class="table-operation">
        <el-checkbox v-model="isExpandAll" @change="onExpandAllChange">
          展开/折叠
        </el-checkbox>
        <el-checkbox v-model="isAllSelected" @change="handleCheckedTreeNodeAll">
          全选/全不选
        </el-checkbox>
        <el-checkbox v-model="isCheckStr" @change="handleCheckedTreeConnect"
        >父子联动
        </el-checkbox>
        <el-select
            v-model="dataPurviewAll"
            placeholder="请选择数据权限"
            style="width: 120px;margin-left: 10px"
            size="small"
            @change="handleSelectChangeAll"
        >
          <!-- 下拉选项：假设用系统菜单类型字典 sysMenuType -->
          <el-option
              v-for="item in filteredOptions"
              :key="item.dictItemId"
              :label="item.itemName"
              :value="item.itemValue"
          ></el-option>
        </el-select>
      </div>
    </div>
    <!-- 树形表格 -->
    <el-tree
        v-show="treeReady"
        ref="treeRef"
        style="height: 370px"
        :data="innerMenuData"
        show-checkbox
        node-key="menuId"
        check-on-click-node
        :default-checked-keys="checkedMenuIds"
        :props="{children: 'children', label: 'title'}"
        :check-strictly="!isCheckStr"
        :expand-on-click-node="false"
        @check-change="handleTreeData"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span style="margin-right: 30px">
            <CwrsCellTag :value="data.type" :dict="props.sysMenuType"></CwrsCellTag>
            </span>
        </div>
        <div style="width: 130px">
          <el-select
              v-if="data.type != '3'"
              v-model="data.dataPurview"
              placeholder="请选择数据权限"
              style="width: 120px"
              size="small"
              @click.stop
              @change="(val) => handleSelectChange(val, data)"
          >
            <!-- 下拉选项：假设用系统菜单类型字典 sysMenuType -->
            <el-option
                v-for="item in filteredOptions"
                :key="item.dictItemId"
                :label="item.itemName"
                :value="item.itemValue"
            ></el-option>
          </el-select>
        </div>
        <div style="width: 90px">
          <!-- 部门选择按钮：仅自定义权限显示 -->
          <el-button type="text" size="small" v-if="data.dataPurview === 'custom' && data.type != '3'" @click.stop
                     @click="handleOpen(data)">
            选择部门 <span v-if="data.deptIds.length > 0">{{ data.deptIds.length }}</span>
          </el-button>
        </div>
      </template>
    </el-tree>
  </div>

  <!-- 部门选择弹窗 -->
  <el-dialog v-model="dialogTableVisible" title="选择部门" width="500px">
    <el-tree
        ref="deptTreeRef"
        node-key="deptId"
        :check-strictly="true"
        :props="defaultProps"
        show-checkbox
        check-on-click-node
        :expand-on-click-node="false"
        :data="dataTree"
        default-expand-all
    />
    <template #footer>
      <div style="display: flex; justify-content: right">
        <el-button @click="dialogTableVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCheckChange">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 导入依赖：接口、组件、Vue API
import {getDeptList} from "@/apis/system";
import {ref, nextTick} from "vue";
import {ElTree} from "element-plus";
import {useUserStore} from '@/stores'

const userStore = useUserStore()

const treeReady = ref(false);
const checkedMenuIds = ref<string[]>([]);
const treeRef = ref()
const deptTreeRef = ref();
const dataTree = ref([]); // 部门树形数据
const menuTreeRes = ref([]); // 菜单树形数据选中结果
const menuNodeRes = ref({}); // 菜单节点数据
const dataPurviewAll = ref();

const isExpandAll = ref(false);
const isAllSelected = ref(false);
const isCheckStr = ref(false);
const dialogTableVisible = ref(false); // 部门弹窗显隐

const innerMenuData = ref([]); // 菜单数据
let parentIdMap = {};


//  父组件Props（带默认值）
const props = withDefaults(
    defineProps<{
      menuData: any[]; // 父组件传入的原始菜单数据
      dataPurview: []; // 数据权限字典
      sysMenuType: []; // 菜单类型字典
      roleMenus?: {
        menuId: string;
        dataPurview: string;
        deptIds: string[];
        menuType: string;
      }[]; // 父组件传入的已有权限
    }>(),
    {
      roleMenus: () => [],
    }
);

const filteredOptions = computed(() => {
  return props.dataPurview.filter(item => {
    if (item.itemSelect === '0') {
      return false
    }

    if (userStore.roleCode !== 'sys_admin' && item.itemValue === 'all') {
      return false
    }
    return true
  })
})

//  树形组件配置
const defaultProps = {
  label: "deptName",
  value: "deptId",
  children: "children",
};
//递归数据拷贝
const deepCloneWithMenuIdString = (data: any[]) => {
  if (!Array.isArray(data)) return [];
  return data.map(item => {
    const cloned = {
      ...item,
      menuId: String(item.menuId),
      dataPurview: item.dataPurview || '',
      deptIds: Array.isArray(item.deptIds) ? [...item.deptIds] : [],
    };
    if (item.children) {
      cloned.children = deepCloneWithMenuIdString(item.children);
    }
    return cloned;
  });
};

// 同步props到内部数据
watch(
    () => [props.menuData, props.roleMenus],
    ([newMenuData, newRoleMenus]) => {
      if (!newMenuData || !Array.isArray(newMenuData)) return;
      innerMenuData.value = deepCloneWithMenuIdString(newMenuData);
      parentIdMap = buildParentMap(innerMenuData.value);
      isCheckStr.value = false
      checkedMenuIds.value = [];
      treeReady.value = false;

      // roleMenus 存在时则为修改，设置已有权限
      if (newRoleMenus && newRoleMenus.length > 0) {
        // 构建 menuId -> role 配置的映射，便于快速查找
        const roleMap = new Map<string, any>();
        newRoleMenus.forEach(role => {
          roleMap.set(String(role.menuId), role);
        });

        // 递归注入权限配置到 innerMenuData
        const injectRolePermissions = (nodes: any[]) => {
          nodes.forEach(node => {
            const role = roleMap.get(node.menuId);
            if (role) {
              // 回显 dataPurview 和 deptIds
              node.dataPurview = role.dataPurview || '';
              node.deptIds = Array.isArray(role.deptIds) ? [...role.deptIds] : [];
            }
            // 递归子节点
            if (node.children && node.children.length) {
              injectRolePermissions(node.children);
            }
          });
        };

        injectRolePermissions(innerMenuData.value);

        // 自动勾选所有 有权限的菜单节点
        checkedMenuIds.value = newRoleMenus.map(item => String(item.menuId));
      }
      nextTick(() => {
        treeReady.value = true;
      });
    },
    {immediate: true, deep: true}
);

// 递归获取所有节点的 key
const getAllNodeKeys = (nodes) => {
  const keys = []
  const traverse = (list) => {
    list.forEach(node => {
      keys.push(node.menuId) // 或你用的 node-key 字段
      if (node.children && node.children.length) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return keys
}

/** 树权限（全选/全不选） */
const handleCheckedTreeNodeAll = (val) => {
  const allKeys = val ? getAllNodeKeys(innerMenuData.value) : []
  treeRef.value.setCheckedKeys(allKeys)
}

/** 树权限（展开/折叠） */
const onExpandAllChange = (val: boolean) => {
  const tree = treeRef.value
  if (!tree) return
  // 递归展开所有节点
  const expandNode = (nodeData) => {
    if (!nodeData || !nodeData.menuId) return

    // 通过 menuId 获取 TreeStore 中的节点对象
    const node = tree.getNode(nodeData.menuId)
    if (node && node.childNodes && node.childNodes.length > 0) {
      node.expanded = val
      // 递归子节点
      nodeData.children?.forEach(child => expandNode(child))
    }
  }

  let treeList = innerMenuData.value;
  // 从根节点开始
  treeList.forEach(rootNode => expandNode(rootNode))
}

/** 树权限（父子联动） */
const handleCheckedTreeConnect = (val) => {
  isCheckStr.value = val
}

/**
 * 父组件数据权限更新时，同步子组件数据权限
 */
const handleSelectChangeAll = (val: string) => {
  // 递归设置所有节点的 dataPurview
  const setAllDataPurview = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.type === '3') return;
      node.dataPurview = val;
      if (node.children && node.children.length) {
        setAllDataPurview(node.children);
      }
    });
  };

  setAllDataPurview(innerMenuData.value);
  nextTick(() => {
    handleTreeData(); // 重新收集选中数据
  });
};

const handleSelectChange = (val: string, nodeData: any) => {
  // 从当前节点开始，递归设置所有子节点
  const setChildrenDataPurview = (node: any) => {
    if (node.type === '3') return;
    node.dataPurview = val;
    if (node.children && node.children.length) {
      node.children.forEach((child: any) => {
        setChildrenDataPurview(child);
      });
    }
  };
  setChildrenDataPurview(nodeData);
  nextTick(() => {
    handleTreeData();
  });
};

/** 树权限数据处理 */
const handleTreeData = () => {
  let allNodes = []
  if (!isCheckStr.value) {
    const checkedKeys = treeRef.value.getCheckedKeys();
    const newCheckedSet = new Set(checkedKeys);
    // 遍历当前所有选中的节点，补全它们的祖先
    checkedKeys.forEach(key => {
      const ancestors = getAncestorIds(key);
      ancestors.forEach(id => newCheckedSet.add(id));
    });
    // 重新设置选中状态（包含子节点 + 所有祖先）
    treeRef.value.setCheckedKeys(Array.from(newCheckedSet));
    allNodes = treeRef.value.getCheckedNodes();
  } else {
    const checkedNodes = treeRef.value.getCheckedNodes();
    const halfCheckedNodes = treeRef.value.getHalfCheckedNodes();
    // 合并全选 + 半选（此时半选就是父节点）
    allNodes = [...new Set([...checkedNodes, ...halfCheckedNodes])];
  }
  menuTreeRes.value = allNodes.map((item) => {
    return {
      menuId: item.menuId,
      dataPurview: item.dataPurview,
      deptIds: item.deptIds,
      menuType: item.type,
    };
  });
  console.log("menuTreeRes", menuTreeRes.value)
};

// 获取所有祖先 ID
function getAncestorIds(nodeId) {
  const ancestors = [];
  let current = nodeId;
  while (parentIdMap[current]) {
    const parentId = parentIdMap[current];
    ancestors.push(parentId);
    current = parentId;
  }
  return ancestors;
}

// 构建 parentId 映射
function buildParentMap(nodes, map = {}, parent = null) {
  nodes.forEach(node => {
    if (parent) map[node.menuId] = parent.menuId;
    if (node.children) {
      buildParentMap(node.children, map, node);
    }
  });
  return map;
}

/**
 * 部门树勾选变化
 */
const handleCheckChange = () => {
  const selectedDeptIds = deptTreeRef.value.getCheckedKeys();
  const currentNode = menuNodeRes.value;

  if (!currentNode) return;

  // 更新当前节点
  currentNode.deptIds = selectedDeptIds;

  // 如果是目录（有子节点），则递归同步 deptIds 到所有子节点
  if (currentNode.type === '1') {
    const isDirectory = Array.isArray(currentNode.children) && currentNode.children.length > 0;
    if (isDirectory) {
      const syncDeptIdsToChildren = (nodes: any[], deptIds: string[]) => {
        nodes.forEach(child => {
          if (child.type === '3') return;
          // 更新当前子节点
          child.deptIds = [...deptIds];
          // 递归处理孙子节点
          if (Array.isArray(child.children) && child.children.length > 0) {
            syncDeptIdsToChildren(child.children, deptIds);
          }
        });
      };

      syncDeptIdsToChildren(currentNode.children, selectedDeptIds);
    }
  }

  // 关闭弹窗并清理
  dialogTableVisible.value = false;
  menuNodeRes.value = null;

  // 触发权限数据收集
  nextTick(() => {
    handleTreeData();
  });
};

/**
 * 打开部门选择弹窗
 */
const handleOpen = (data: any) => {
  menuNodeRes.value = data;
  let selectedDeptIds = Array.isArray(data.deptIds) ? [...data.deptIds] : [];

  // 加载部门树形数据
  getDeptList()
      .then((res) => {
        dataTree.value = res.data || [];
        dialogTableVisible.value = true;
        // 等待树渲染完成后设置选中状态
        nextTick(() => {
          deptTreeRef.value?.setCheckedKeys(selectedDeptIds);
        });
      })
      .catch((error) => {
        console.error("获取部门树失败：", error);
      });
};

//  重置方法：暴露给父组件
const reset = () => {
  // 重置表格状态
  treeRef.value?.setCheckedKeys([]);
  isExpandAll.value = false;
  dataPurviewAll.value = "";
  // 重置弹窗状态
  dialogTableVisible.value = false;
  // 重置内部菜单数据（恢复为props原始值）
  innerMenuData.value = deepCloneWithMenuIdString(props.menuData);
};
const getRoleMenus = () => {
  return menuTreeRes.value

};


//  暴露方法给父组件
defineExpose({reset, getRoleMenus});
</script>

<style scoped>
/* 头部样式：标题与操作区对齐 */
.menu-permission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* 操作区样式：按钮与复选框间距 */
.table-operation {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

/* 表格单元格样式优化 */
.el-table .cell {
  line-height: 24px;
}

/* 部门选择按钮：数字标注意识 */
.el-button--text span {
  color: #409eff;
  margin-left: 4px;
}

/* 弹窗树样式：避免溢出 */
.el-tree {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}
</style>
