<template>
  <el-card class="gi_page_card">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="user-card__header">
          <div class="avatar-container">
            <img
              v-if="userStore.avatar"
              :src="userStore.avatar"
              style="
                width: 200px;
                height: 200px;
                border-radius: 50%;
                position: relative;
                z-index: 2;
              "
            />
            <img
              v-else
              src="@/assets/images/logo.png"
              style="
                width: 200px;
                height: 200px;
                border-radius: 50%;
                position: relative;
                z-index: 2;
              "
            />
          </div>
        </div>
        <div class="user-card__box">
          <div class="box">
            <!-- <div class="name">{{ userStore.nickName }}</div> -->
            <ul class="user-card__list">
              <li class="list-item">
                <span class="icon">
                  <el-icon size="50" color="#3491FA"><Avatar /></el-icon>
                </span>
                <span>{{ userStore.userName }}</span>
              </li>
              <li class="list-item">
                <span class="icon">
                  <el-icon size="50" color="#3491FA"
                    ><PhoneFilled
                  /></el-icon> </span
                ><span>{{ userStore.userPhone }}</span>
              </li>
              <li class="list-item">
                <span class="icon">
                  <el-icon size="50" color="#3491FA"
                    ><Message
                  /></el-icon> </span
                ><span>{{ userStore.email || "-" }}</span>
              </li>
            </ul>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <el-divider>
          <el-icon color="#b4b5b6" size="24"><Star /></el-icon>
        </el-divider>
        <div>基本信息</div>
        <el-descriptions :column="1" style="margin-top: 20px">
          <el-descriptions-item label="性别">
            <CwrsCellTag
              :value="userStore.gender"
              :dict="sysGender"
            ></CwrsCellTag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-space wrap :size="5">
              <CwrsCellTag
                :value="userStore.userStatus"
                :dict="sysStatus"
              ></CwrsCellTag>
            </el-space>
          </el-descriptions-item>
          <el-descriptions-item label="生日">{{
            userStore.birth
          }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{
            userStore.desc
          }}</el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
  </el-card>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores";
import { useDict } from "@/hooks/app";

const { data: sysGender } = useDict({ dictCode: "sys_gender" });
const { data: sysStatus } = useDict({ dictCode: "sys_status" });

defineOptions({ name: "SystemAccount" });
const userStore = useUserStore().userInfo;
</script>

<style lang="scss" scoped>
.user-card__header {
  position: absolute;
  left: 5%;
  top: 50px;
}
.avatar-container {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
}
//  外层渐变圆环
.avatar-container::before {
  content: "";
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border-radius: 50%;
  border: 15px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
    linear-gradient(135deg, #0a35ee, #f4f8fb) border-box;
  z-index: 1;
  pointer-events: none;
}

.user-card__box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 150px;
  font-size: 24px;
}
.box {
  width: 60%;
  padding: 50px;
  box-sizing: border-box;
  border-radius: 20px;
  border-top: 3px solid #c8e1fa;
  border-bottom: 3px solid #c8e1fa;
  border-left: 3px dashed #ddebfa;
  border-right: 3px dashed #ddebfa;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
.name {
  font-size: 50px;
  text-align: center;
  // padding-right: 30px;
  // padding-top: 40px;
  color: #01264c;
  font-weight: 900;
}
.user-card__list {
  list-style: none;
  padding-top: 50px;
  .list-item {
    padding-bottom: 10px;
    display: flex;
  }
  .icon {
    margin-right: 10px;
  }
}
</style>
