<template>
  <div class="gi_page account">
    <a-row :gutter="14">
      <a-col :xs="24" :sm="24" :md="24" :lg="10" :xl="8" :xxl="7">
        <section class="user-card">
          <div class="user-card__header">
            <a-avatar :size="60" :trigger-icon-style="{ color: '#3491FA' }">
              <img v-if ="userStore.avatar" :src="userStore.avatar" />
              <img v-else src="@/assets/images/logo.png" />
              <template #trigger-icon>
                <IconCamera />
              </template>
            </a-avatar>
            <div class="name">{{ userStore.nickName }}</div>
            <p class="desc">{{ userStore.signature }}</p>
          </div>

          <ul class="user-card__list">
            <li class="list-item">
              <span class="icon"><icon-user :stroke-width="1" :size="16" /></span>
              <span>{{ userStore.userName }}</span>
            </li>
            <li class="list-item">
              <span class="icon"><icon-phone :stroke-width="1"
                  :size="16" /></span><span>{{ userStore.userPhone }}</span>
            </li>
            <li class="list-item">
              <span class="icon"><icon-email :stroke-width="1" :size="16" /></span><span>{{ userStore.email || '-' }}</span>
            </li>
          </ul>
          <a-divider type="dashed" />

          <a-typography-title :heading="6">标签</a-typography-title>
          <a-space wrap :size="5">
            <a-tag>vue3</a-tag>
            <a-tag>pinia</a-tag>
            <a-tag>vite</a-tag>
            <a-tag>ts</a-tag>
            <a-tag>arco design</a-tag>
          </a-space>

          <a-descriptions :column="1" style="margin-top: 20px">
            <a-descriptions-item label="性别">
              <CwrsCellTag :value="userStore.gender" :dict="sysGender"></CwrsCellTag>
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-space wrap :size="5">
                <CwrsCellTag :value="userStore.userStatus" :dict="sysStatus"></CwrsCellTag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="生日">{{ userStore.birth }}</a-descriptions-item>
            <a-descriptions-item label="描述">{{ userStore.desc }}</a-descriptions-item>
          </a-descriptions>
        </section>
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="14" :xl="16" :xxl="17">
        <RightBox></RightBox>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import RightBox from './RightBox.vue'
import { useUserStore } from '@/stores'
import {useDict} from "@/hooks/app";

const {data: sysGender} = useDict({dictCode: 'sys_gender'})
const {data: sysStatus} = useDict({dictCode: 'sys_status'})

defineOptions({ name: 'SystemAccount' })
const userStore = useUserStore().userInfo
</script>

<style lang="scss" scoped>
.user-card {
  width: 100%;
  height: fit-content;
  padding: $padding;
  box-sizing: border-box;
  background: var(--color-bg-1);
  border-radius: 2px;

  &__header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .name {
      font-size: 20px;
      font-weight: bolder;
      line-height: 1.5;
      margin: 8px;
      color: $color-text-1;
    }

    .desc {
      font-size: 12px;
      color: $color-text-3;
    }
  }

  &__list {
    margin-top: 20px;

    .list-item {
      padding-bottom: 16px;
      display: flex;

      >.icon {
        margin-right: 8px;
      }
    }
  }

  &__images {
    margin: 10px 0;

    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
  }
}
</style>
