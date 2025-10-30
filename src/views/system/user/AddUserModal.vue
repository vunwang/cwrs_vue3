<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="60%"
    :close-on-click-modal="true"
    :before-close="handleClose"
    :loading="loading"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">{{ title }}</span>
      </div>
    </template>
    <div
      v-loading="loading"
      style="max-height: 550px; overflow-y: auto; overflow-x: hidden"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="default"
        label-width="100"
      >
        <el-row :gutter="20">
          <el-col :span="8" v-if="userName !== 'admin'">
            <el-form-item label="所属组织" prop="deptId">
              <DeptTreeSelect
                v-model="form.deptId"
                placeholder="请选择所属组织"
                @change="handleDeptChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="手机号码" prop="userPhone">
              <el-input
                v-model.trim="form.userPhone"
                placeholder="请输入手机号码"
                clearable
                :maxlength="11"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用户名" prop="userName">
              <el-input
                v-model.trim="form.userName"
                placeholder="请输入用户名"
                clearable
                :disabled="form.userName === 'admin' && userId != ''"
                :maxlength="10"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="昵称" prop="nickName">
              <el-input
                v-model.trim="form.nickName"
                placeholder="请输入昵称"
                clearable
                :maxlength="10"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="userStatus">
              <el-select
                v-model="form.userStatus"
                placeholder="请选择状态"
                clearable
                :disabled="form.userName === 'admin' && userId != ''"
                filterable
              >
                <el-option
                  v-for="item in userStatusOptions"
                  :key="item.itemValue"
                  :label="item.itemName"
                  :value="item.itemValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出生日期" prop="birth">
              <el-date-picker
                style="width: 100%"
                v-model="form.birth"
                type="date"
                placeholder="请选择出生日期"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio
                  v-for="dict in genderOptions"
                  :key="dict.itemValue"
                  :label="dict.itemValue"
                >
                  {{ dict.itemName }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="userName !== 'admin'">
            <el-form-item label="角色" prop="roleId" :disabled="form.disabled">
              <el-select
                v-model="form.roleId"
                placeholder="请先选择组织在选择角色"
                clearable
                filterable
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="userName !== 'admin'">
            <el-form-item label="岗位" prop="postId" :disabled="form.disabled">
              <el-select
                v-model="form.postId"
                placeholder="请先选择组织在选择岗位"
                clearable
                filterable
              >
                <el-option
                  v-for="item in postOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model.trim="form.email"
                placeholder="请输入邮箱"
                clearable
                :maxlength="30"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="头像">
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                <div v-if="form.avatar">
                  <el-image
                    style="width: 50px; height: 50px; margin-right: 20px"
                    :src="form.avatar"
                    :preview-src-list="[form.avatar]"
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
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="desc">
              <el-input
                v-model.trim="form.desc"
                :maxlength="200"
                placeholder="请填写描述"
                type="textarea"
                :rows="3"
                resize="none"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from "vue";
import { ElMessage, ElForm, ElFormItem } from "element-plus";
import { useDict } from "@/hooks/app";
import * as Regexp from "@/utils/regexp";
import {
  getUserDetail,
  addUser,
  getRoleList,
  getPostList,
  editUser,
} from "@/apis/system";
import { useResetReactive } from "@/hooks";

const { data: genderOptions } = useDict({ dictCode: "sys_gender" });
const { data: userStatusOptions } = useDict({ dictCode: "sys_status" });

const emit = defineEmits<{
  (e: "save-success"): void;
}>();
//==========上传文件并提交数据==========
const uploadRef = ref<any>(null);

const formRef = useTemplateRef<InstanceType<typeof ElForm>>("formRef");
const userId = ref("");
const userName = ref("");
const isEdit = computed(() => !!userId.value);
const title = computed(() => (isEdit.value ? "编辑用户" : "新增用户"));
const visible = ref(false);
const roleOptions = ref([]);
const postOptions = ref([]);
const loading = ref(false);
// 表单数据
const [form, resetForm] = useResetReactive({
  oldDeptId: "", // 旧部门ID
  avatar: "", // 头像
  postId: "", //所属岗位
  birth: "", // 出生日期
  userStatus: "", // 用户状态
  userId: "",
  userName: "", // 用户名
  nickName: "", // 昵称
  gender: "1", // 性别 1男 2女
  userPhone: "", // 手机号
  email: "", // 邮箱
  deptId: "", // 部门
  roleId: "", // 角色
  desc: "", // 描述
});

// 表单验证规则
const rules = {
  userName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  userPhone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: Regexp.Phone, message: "手机号格式不正确", trigger: "blur" },
  ],
  userStatus: [{ required: true, message: "请输入状态", trigger: "blur" }],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
  deptId: [{ required: true, message: "请选择所属部门", trigger: "change" }],
  birth: [{ required: true, message: "请选择出生日期", trigger: "blur" }],
  email: [
    { pattern: Regexp.Email, message: "邮箱格式不正确", trigger: "blur" },
  ],
};

// 部门变化时，触发角色、岗位的重新查询
const handleDeptChange = async (deptId: string) => {
  form.deptId = deptId; // 保存旧部门ID
  form.roleId = ""; // 部门变化时，清空角色选择
  form.postId = ""; // 部门变化时，清空岗位选择
  await fetchRoleList(deptId); // 传入deptId，查询该部门下的角色
  await fetchPostList(deptId); // 传入deptId，查询该部门下的岗位
};
// 获取角色列表（支持按部门筛选）
const fetchRoleList = async (deptId?: string) => {
  try {
    // 调用接口时，传递deptId参数（若有则筛选，无则查全部）
    const res = await getRoleList({ deptId });
    if (res.code === 200) {
      roleOptions.value = res.data.map((item: any) => ({
        label: item.roleName,
        value: item.roleId,
      }));
    }
  } catch (error) {
    console.error("获取角色列表失败", error);
  }
};

// 获取岗位列表（支持按部门筛选）
const fetchPostList = async (deptId?: string) => {
  try {
    // 调用接口时，传递deptId参数（若有则筛选，无则查全部）
    const res = await getPostList({ deptId });
    if (res.code === 200) {
      postOptions.value = res.data.map((item: any) => ({
        label: item.postName,
        value: item.postId,
      }));
    }
  } catch (error) {
    console.error("获取岗位列表失败", error);
  }
};

// 上传
const handleUploadResult = (uploadResult, imageUrl, fileSize) => {
  if (uploadResult === "success") {
    form.avatar = imageUrl;
  }
};
// 新增用户
const add = () => {
  userId.value = "";
  userName.value = "";
  visible.value = true;
  resetForm();
};

// 编辑用户
const edit = async (item) => {
  try {
    visible.value = true;
    userId.value = item.userId;
    userName.value = item.userName;
    const res = await getUserDetail({ userId: item.userId });
    await fetchRoleList(res.data.deptId); // 传入deptId，查询该部门下的角色
    await fetchPostList(res.data.deptId); // 传入deptId，查询该部门下的岗位
    Object.assign(form, res.data);
    form.oldDeptId = form.deptId; // 保存旧部门ID
  } catch (error) {
    return false;
  }
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
  resetForm();
};

// 保存数据
const save = async () => {
  try {
    // 1. 表单验证
    if (!formRef.value) return;
    const valid = await formRef.value.validate();
    if (!valid) return;
    loading.value = true;
    let finalImageUrl = form.avatar; // 默认使用当前的feedbackImg
    if (uploadRef.value) {
      try {
        // 尝试上传，如果没有选择新文件，uploadRef.value.submitUpload()会返回原有的imageUrl
        const imageUrl = await uploadRef.value.submitUpload(form.avatar);
        finalImageUrl = imageUrl; // 使用上传返回的URL（可能是新的也可能是原有的）
      } catch (error) {
        // 上传失败或取消，使用原有的图片URL
        finalImageUrl = form.avatar;
      }
    }
    // 3. 更新表单中的图片URL
    form.avatar = finalImageUrl;
    // 4. 执行新增/编辑操作
    if (userId.value) {
      const res = await editUser({
        ...form,
        userId: userId.value,
      });
      if (res?.code === 200) ElMessage.success(res.msg);
      emit("save-success");
    } else {
      const res = await addUser(form);
      if (res?.code === 200) ElMessage.success(res.msg);
      emit("save-success");
    }
    // 5. 关闭弹窗并刷新
    visible.value = false;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    return false;
  }
};

// 暴露方法给父组件
defineExpose({ add, edit });
</script>
<style scoped>
.wjmBox {
  width: 50px;
  height: 50px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
}

.wjm {
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
  word-break: break-all;
  color: #606266;
}

.wjmBox:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>
