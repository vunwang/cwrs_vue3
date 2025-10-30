<template>
  <a-modal
      v-model:visible="visible"
      :title="title"
      width="90%"
      :modal-style="{ maxWidth: '625px' }"
      :body-style="{ maxHeight: '70vh' }"
      :mask-closable="true"
      @before-ok="saveSuccess"
      @before-open="close"
  >
    <a-form ref="formRef" :model="form" :rules="formRules" auto-label-width>
      <a-form-item label="菜单类型" field="type">
        <a-radio-group
            v-model="form.type"
            type="button"
            :disabled="isEdit"
            @change="onChangeType"
        >
          <a-radio
              v-for="item in sysMenuType"
              :key="item.itemValue"
              :value="item.itemValue"
          >{{ item.itemName }}
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="上级菜单" field="parentId">
        <a-tree-select
            v-model="form.parentId"
            placeholder="请选择上级菜单"
            allow-clear
            allow-search
            :data="menuSelectTree"
            :field-names="{
            key: 'menuId',
            title: 'title',
            children: 'children',
          }"
        />
      </a-form-item>

      <a-form-item
          style="width: 100%"
          label="菜单图标"
          field="icon"
          v-if="['1', '2'].includes(form.type)"
      >
        <a-image v-if="form.menuId" width="50" height="50" :src="form.icon"/>
        <CustomImageUpload style="margin-left: 10px"
                           ref="uploadRef" accept=".jpg,.png" :fileMaxSize="20" dirName="images"
                           @onSubUploadRes="handleUploadResult"
        ></CustomImageUpload>
      </a-form-item>

      <a-form-item label="菜单标题" field="title">
        <a-input
            v-model.trim="form.title"
            placeholder="请输入菜单标题"
            allow-clear
            :max-length="20"
        />
      </a-form-item>
      <a-form-item
          v-if="['1', '2'].includes(form.type)"
          label="IOS路由路径"
          field="iosPath"
      >
        <a-input
            v-model.trim="form.iosPath"
            placeholder="请输入IOS路由路径"
            allow-clear
            :max-length="50"
        />
      </a-form-item>
      <a-form-item
          v-if="['1', '2'].includes(form.type)"
          label="IOS组件路径"
          field="iosComponent"
      >
        <a-input
            v-model.trim="form.iosComponent"
            placeholder="请输入IOS组件路径"
            allow-clear
            :max-length="50"
        />
      </a-form-item>
      <a-form-item
          v-if="['1', '2'].includes(form.type)"
          label="Android路由路径"
          field="androidPath"
      >
        <a-input
            v-model.trim="form.androidPath"
            placeholder="请输入Android路由路径"
            allow-clear
            :max-length="50"
        />
      </a-form-item>
      <a-form-item
          v-if="['1', '2'].includes(form.type)"
          label="Android组件路径"
          field="androidComponent"
      >
        <a-input
            v-model.trim="form.androidComponent"
            placeholder="请输入Android组件路径"
            allow-clear
            :max-length="50"
        />
      </a-form-item>
      <a-form-item v-if="form.type === '3'" label="权限标识" field="permission">
        <a-input
            v-model.trim="form.permission"
            placeholder="sys:btn:add"
            allow-clear
            :max-length="50"
        />
      </a-form-item>

      <a-row :gutter="16">
        <a-col v-bind="col2Props">
          <a-form-item label="菜单排序" field="sort">
            <a-input-number
                v-model="form.sort"
                placeholder="请输入菜单排序"
                :min="1"
                mode="button"
                style="width: 120px"
            />
          </a-form-item>
        </a-col>
        <a-col v-bind="col2Props">
          <a-form-item label="状态" field="status">
            <a-switch v-model="form.status" checked-value="1" unchecked-value="0"
                      checked-text="正常"
                      unchecked-text="禁用"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {
  type ColProps,
  type FormInstance,
  Message,
} from "@arco-design/web-vue";
import {mapTree} from "xe-utils";
import type {MenuForm} from "./type";
import {
  getMenuDetail,
  addAppDirectory,
  addAppMenu,
  addAppButton,
  editAppDirectory,
  editAppMenu,
  editAppButton,
} from "@/apis/system";
import {isExternal} from "@/utils/validate";
import {filterTree, transformPathToName} from "@/utils";
import {useResetReactive} from "@/hooks";
import {useDict} from "@/hooks/app";
import CustomImageUpload from "@/components/CustomImageUpload/index.vue";
import {ref} from "vue";
import {hasPerm} from "@/utils/has";

interface Props {
  menus: any[];
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
});

const emit = defineEmits<{
  (e: "save-success"): void;
}>();

const {data: sysMenuType} = useDict({dictCode: "sys_menu_type"});
const menuSelectTree = computed(() => {
  const menus = JSON.parse(JSON.stringify(props.menus));
  const data = filterTree(menus, (i) => ["1", "2"].includes(i.type));
  const arr = mapTree(data, (i) => ({
    menuId: i.menuId,
    title: i.title,
    children: i.children,
  }));
  return arr;
});

const col2Props: ColProps = {xs: 24, sm: 24, md: 12, lg: 12, xl: 12, xxl: 12};
// const col3Props: ColProps = { xs: 12, sm: 12, md: 8, lg: 8, xl: 8, xxl: 8 };

const formRef = useTemplateRef("formRef");
const menuId = ref("");
const visible = ref(false);
const isEdit = computed(() => !!menuId.value);
const title = computed(() => (isEdit.value ? "编辑菜单" : "新增菜单"));

const isExternalUrl = ref(false);
const [form, resetForm] = useResetReactive<MenuForm>({
  type: "1", // 类型 字典 1目录 2菜单 3按钮
  icon: "", // arco 图标名称
  title: "", // 菜单或目录的名称
  sort: 1, // 排序
  status: "1", // 状态 字典 0禁用 1启用
  androidComponent: "", //安卓组件路径
  androidPath: "", //安卓路由路径
  iosComponent: "", //IOS组件路径
  iosPath: "", //IOS路由路径
  parentId: "",
  permission: "", //权限标识
});

const rules: FormInstance["rules"] = {
  parentId: [{required: true, message: "请选择上级菜单"}],
  title: [{required: true, message: "请输入菜单标题"}],
  androidPath: [{required: true, message: "请输入Android路由路径"}],
  iosPath: [{required: true, message: "请输入IOS路由路径"}],
};
const formRules = computed(() => {
  if (["1", "2"].includes(form.type)) {
    const {title, androidPath, iosPath} = rules;
    return {
      title,
      androidPath,
      iosPath,
    } as FormInstance["rules"];
  }
  if (form.type === "3") {
    const {parentId, title, permission} = rules;
    return {parentId, title, permission} as FormInstance["rules"];
  }
  return {};
});
//lss
// import { reactive, ref } from "vue";
// import axios from "axios";

// 切换类型清除校验
const onChangeType = () => {
  formRef.value?.clearValidate();
};

const add = (parentId: string, type: string) => {
  form.parentId = parentId === undefined ? "" : parentId;
  if (type === "1") {
    form.type = "2";
  } else if (type === "2") {
    form.type = "3";
  }
  menuId.value = "";
  visible.value = true;
};

const edit = async (id: string) => {
  try {
    visible.value = true;
    menuId.value = id;
    const res = await getMenuDetail({menuId: id});
    Object.assign(form, res.data);
    if (form.parentId === "0") {
      form.parentId = "";
    }
    if (isExternal(form.path)) {
      isExternalUrl.value = true;
    }
  } catch (error) {
    return false
  }
};

const close = () => {
  formRef.value?.resetFields();
  resetForm();
};

//==========上传文件并提交数据==========
const uploadRef = ref();
const saveSuccess = async () => {
  const valid = await formRef.value?.validate();
  if (valid) return false;
  await uploadRef.value?.submitUpload(form.icon);
}

const handleUploadResult = async (uploadResult, imageUrl, fileSize) => {
  if (uploadResult === "success") {
    form.icon = imageUrl; //文件上传后的文件地址
    await save();
  }
};

const save = async () => {
  try {
    let res = null;
    form.parentId = form.parentId || "0";
    if (isEdit.value) {
      //编辑
      if (form.type === "1") {
        // form.component = "Layout";
        res = await editAppDirectory(form);
      } else if (form.type === "2") {
        res = await editAppMenu(form);
      } else if (form.type === "3") {
        res = await editAppButton(form);
      }
    } else {
      //添加
      if (form.type === "1") {
        // form.component = "Layout";
        res = await addAppDirectory(form);
      } else if (form.type === "2") {
        res = await addAppMenu(form);
      } else if (form.type === "3") {
        res = await addAppButton(form);
      }
    }
    if (res) {
      Message.success(res.msg);
      emit("save-success");
      return true;
    }
  } catch (error) {
    return false;
  }
};
//==========上传文件并提交数据==========

defineExpose({add, edit});
</script>
<style scoped lang="less">
:deep(.custom-image-upload) {
  border: none;
  padding: 0;
}
</style>
