<template>
  <el-dialog
      v-model="visible"
      width="35%"
      :modal-append-to-body="true"
      :append-to-body="false"
      :max-width="600"
      :close-on-click-modal="true"
      @close="close"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-title">{{ title }}</span>
      </div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="所属组织" prop="deptId">
        <DeptTreeSelect v-model="form.deptId" placeholder="请选择所属组织"/>
      </el-form-item>

      <el-form-item label="岗位名称" prop="postName">
        <el-input
            v-model.trim="form.postName"
            placeholder="请输入岗位名称"
            clearable
            :maxlength="20"
        ></el-input>
      </el-form-item>

      <el-form-item label="岗位编号" prop="postCode">
        <el-input
            v-model.trim="form.postCode"
            placeholder="请输入岗位编号"
            :disabled="isEdit"
            clearable
            :maxlength="20"
        ></el-input>
      </el-form-item>

      <el-form-item label="描述" prop="desc">
        <el-input
            v-model.trim="form.desc"
            :maxlength="200"
            placeholder="请填写描述"
            type="textarea"
            :rows="3"
            show-word-limit
        />
      </el-form-item>

      <el-form-item label="排序" prop="postSort">
        <el-input-number
            v-model="form.postSort"
            placeholder="请输入排序"
            :min="1"
            controls-position="right"
            style="width: 120px"
        />
      </el-form-item>

      <el-form-item label="状态" prop="postStatus">
        <CwrsSwitch v-model="form.postStatus" size="default"/>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {type FormInstance, ElMessage} from "element-plus";
import {getPostDetail, editSysPost, addSysPost} from "@/apis/system";
import {useResetReactive} from "@/hooks";

const emit = defineEmits<{
  (e: "save-success"): void;
}>();

const formRef = ref<FormInstance>();
const postId = ref("");
const isEdit = computed(() => !!postId.value);
const title = computed(() => (isEdit.value ? "编辑岗位" : "新增岗位"));
const visible = ref(false);

const [form, resetForm] = useResetReactive({
  postId: "",
  postName: "", // 岗位名称
  postCode: "", // 岗位编号
  postSort: 1, // 排序
  postStatus: "1", // 状态 0禁用 1启用(正常)
  deptId: "", // 组织
  desc: "", // 描述
});

const rules = {
  postName: [
    {required: true, message: "请输入岗位名称", trigger: "blur"},
    {min: 1, max: 20, message: "长度在 1 - 20个字符", trigger: "blur"},
  ],
  postCode: [
    {required: true, message: "请输入岗位编号", trigger: "blur"},
    {min: 1, max: 20, message: "长度在 1 - 20个字符", trigger: "blur"},
  ],
};

const add = () => {
  postId.value = "";
  visible.value = true;
};

const edit = async (id: string) => {
  visible.value = true;
  postId.value = id;
  const res = await getPostDetail({postId: id});
  Object.assign(form, res.data);
};

const close = () => {
  formRef.value?.resetFields();
  resetForm();
  visible.value = false;
};

const save = async () => {
  try {
    await formRef.value?.validate();
    const res = isEdit.value ? await editSysPost(form) : await addSysPost(form);
    if (res) {
      ElMessage.success(res.msg);
      emit("save-success");
      visible.value = false;
    }
  } catch (error) {
    return false
  }
};

defineExpose({add, edit});
</script>
