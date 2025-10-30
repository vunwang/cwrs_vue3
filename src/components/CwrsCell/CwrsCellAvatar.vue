<template>
  <a-space fill>
    <a-avatar :size="24" shape="circle">
      <img v-if="props.avatar" :src="props.avatar"/>
      <img v-else :src="userStore.sysLogo"/>
    </a-avatar>
    <a-link v-if="props.isLink" @click="emit('click')">{{ props.name }}</a-link>
    <span v-else>{{ props.name }}</span>
  </a-space>
</template>

<script lang="ts" setup>
import {defineOptions} from 'vue'
import {useUserStore} from '@/stores'

const userStore = useUserStore()
defineOptions({name: 'CwrsCellAvatar'})

const props = defineProps<{
  avatar: string,
  name: string,
  isLink: boolean // 是否可以点击
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

</script>

<style lang="scss" scoped></style>
