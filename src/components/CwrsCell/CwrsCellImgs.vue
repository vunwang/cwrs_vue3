<template>
  <a-image-preview-group infinite>
    <a-space>
      <a-image v-for="(item, index) in imageUrl" :key="index" :src="item" :width="width"/>
    </a-space>
  </a-image-preview-group>
</template>

<script lang="ts" setup>
defineOptions({name: 'CwrsCellImgs'})

const props = defineProps<{
  width: number
  imageUrl: []
}>()

</script>

<style lang="scss" scoped></style>
