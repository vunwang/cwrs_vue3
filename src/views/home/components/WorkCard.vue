<template>
  <a-card title="工作台" :bordered="false" size="medium" class="card">
    <template #extra>
      <NowTime></NowTime>
    </template>
    <a-row align="center" wrap :gutter="[{ xs: 0, sm: 14, md: 14, lg: 14, xl: 14, xxl: 14 }, 16]" class="content">
      <a-col :xs="24" :sm="24" :md="14" :lg="16" :xl="16" :xxl="18">
        <a-space size="medium">
          <a-avatar :size="68">
            <img v-if ="userStore.avatar" :src="userStore.avatar" />
            <img v-else :src="userStore.sysLogo" />
          </a-avatar>
          <div class="welcome">
            <p class="hello">
              <span>{{ goodTimeText() }}！{{ userStore.name }}，开始您一天的工作吧！</span>
            </p>
            <p>今日阴转大雨，25℃ - 38℃，出门记得带伞哦。</p>
          </div>
        </a-space>
      </a-col>

      <a-col :xs="24" :sm="24" :md="10" :lg="8" :xl="8" :xxl="6">
        <a-row justify="space-between" align="center">
          <a-statistic :value="16" :value-from="0" :start="true" animation>
            <template #title>
              <a-space>
                <CwrsSvgIcon name="icon-num"></CwrsSvgIcon>
                <span>项目数</span>
              </a-space>
            </template>
          </a-statistic>
          <a-statistic :value="3" :value-from="0" :start="true" animation>
            <template #title>
              <a-space>
                <CwrsSvgIcon name="icon-wait"></CwrsSvgIcon>
                <span>待办</span>
              </a-space>
            </template>
            <template #suffix>/15</template>
          </a-statistic>
          <a-statistic :value="35" :value-from="0" :start="true" animation>
            <template #title>
              <a-space>
                <CwrsSvgIcon name="icon-msg"></CwrsSvgIcon>
                <span>消息</span>
              </a-space>
            </template>
          </a-statistic>
        </a-row>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import NowTime from './NowTime/index.vue'
import { useUserStore } from '@/stores'
import { goodTimeText } from '@/utils'

const userStore = useUserStore()
</script>

<style lang="scss" scoped>
:deep(.arco-statistic-title) {
  margin-bottom: 0;
}

.card {
  margin-top: $margin;

  .content {
    padding: 8px 20px;

    .welcome {
      margin: 8px 0;
      color: $color-text-3;

      .hello {
        font-size: 1.25rem;
        color: $color-text-1;
        margin-bottom: 10px;
      }

      .gi-demo-star {
        vertical-align: middle;
      }
    }
  }
}
</style>
