<template>
  <el-card class="gi_page_card" style="padding: 30px 200px">
    <div style="width: 100%">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="user-card__header">
            <div class="avatar-container">
              <img
                v-if="userStore.userInfo.avatar"
                :src="userStore.userInfo.avatar"
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
                :src="userStore.sysLogo"
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
        </el-col>
        <el-col :span="14">
          <div
            style="
              height: 80px;
              width: 100%;
              border-radius: 50px;
              background: rgba(236, 236, 237, 0.5);
              display: flex;
              margin-top: 100px;
            "
          >
            <div class="imgbox" style="display: flex; align-items: center">
              <img
                src="@/assets/images/grzl.png"
                style="width: 60px; height: 50px"
              />
            </div>
            <div class="imgbox">
              <img
                src="@/assets/images/lxdh.png"
                style="width: 60px; height: 60px"
              />
            </div>
            <div class="imgbox">
              <img
                src="@/assets/images/lxyx.png"
                style="width: 60px; height: 50px"
              />
            </div>
            <div class="imgbox">
              <img
                src="@/assets/images/grsr.png"
                style="width: 60px; height: 60px"
              />
            </div>
          </div>
        </el-col>
      </el-row>
      <el-divider content-position="right">
        {{ userStore.userInfo.userName }}
      </el-divider>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="name">{{ userStore.userInfo.userName }}</div>
          <div style="margin-top: 20px">
            <span class="name1">性别:</span>
            <CwrsCellTag
              :value="userStore.userInfo.gender"
              :dict="sysGender"
            ></CwrsCellTag>
          </div>
          <div style="margin-top: 20px">
            <span class="name1">状态:</span>
            <el-space wrap :size="5">
              <CwrsCellTag
                :value="userStore.userInfo.userStatus"
                :dict="sysStatus"
              ></CwrsCellTag>
            </el-space>
          </div>
          <div style="margin-top: 20px" class="name1">
            <span>生日:</span>
            {{ userStore.userInfo.birth }}
          </div>
        </el-col>
        <el-col :span="8">
          <div class="dhBox">
            <div class="yuanquan"></div>
            <div class="dhBoxTitle">电话</div>
            <div class="lxdh">
              <el-icon size="60" color="#fff">
                <PhoneFilled />
              </el-icon>
              {{ userStore.userInfo.userPhone }}
            </div>
          </div>
          <div style="height: 20px">
            <!-- 占位 -->
          </div>
          <div class="dhBox1">
            <div class="yuanquan"></div>
            <div class="dhBoxTitle">邮箱</div>
            <div class="lxdh">
              <el-icon size="60" color="#fff">
                <Message />
              </el-icon>
              {{ userStore.userInfo.email || "-" }}
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div
            style="
              box-sizing: border-box;
              padding: 20px;
              height: 260px;
              border-radius: 14px;
              background-image: linear-gradient(to bottom, #f8f9fb, #f3f5fa);
              color: #01264c;
              font-size: 16px;
            "
          >
            <div></div>
            <div class="dis_flex_center">
              <div class="shuxian"></div>
              <div class="fontStyle16">描述</div>
            </div>
            <div style="margin-top: 10px; height: 180px; overflow-y: auto">
              {{ userStore.userInfo.desc }}
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores";
import { useDict } from "@/hooks/app";

const { data: sysGender } = useDict({ dictCode: "sys_gender" });
const { data: sysStatus } = useDict({ dictCode: "sys_status" });

defineOptions({ name: "SystemAccount" });
const userStore = useUserStore();
</script>

<style lang="scss" scoped>
::deep(.el-tag--small) {
  height: auto !important;
  padding: 4px 8px !important;
}

::deep(.el-tag) {
  font-size: 16px;
  padding: 4px 8px !important;
}

::deep(.el-divider__text) {
  color: #01264c;
  font-size: 20px;
  font-weight: 900;
}

.imgbox {
  width: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-card__header {
  display: flex;
  justify-content: center;
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
    //linear-gradient(135deg, #0a35ee, #fff) border-box;
    linear-gradient(135deg, #f96fb4, #a495f9, #58aafc) border-box;
  z-index: 1;
  pointer-events: none;
}

.dhBox1 {
  height: 120px;
  width: 100%;
  background: linear-gradient(306deg, #8672ff 0%, #50aeec 100%);
  // background-color: #3878fe;
  border-radius: 14px;
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  position: relative;
  // box-shadow: 5px 10px 20px rgba(83, 137, 251, 0.8);
}

.dhBox {
  height: 120px;
  width: 100%;
  background: linear-gradient(306deg, #1c9cff 0%, #6ec9ff 100%);
  // background-color: #29dba4;
  border-radius: 14px;
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  position: relative;
  // box-shadow: 5px 10px 20px rgba(83, 251, 220, 0.8);
}

.yuanquan {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fff;
}

.dhBoxTitle {
  position: absolute;
  left: 20px;
  top: 20px;
  font-size: 28px;
}

.lxdh {
  font-size: 30px;
  position: absolute;
  bottom: 10px;
  left: 20px;
  display: flex;
}

.name1 {
  font-size: 18px;
  margin-right: 20px;
  font-weight: 900;
  color: #01264c;
}

.name {
  font-size: 50px;
  text-align: center;
  color: #01264c;
  font-weight: 900;
}
</style>
