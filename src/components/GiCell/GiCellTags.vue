<template>
  <a-overflow-list v-if="data.length">
    <a-tag v-for="(item, index) in data" :key="index" :color="item.itemColor" size="small">
      {{ item.itemName }}
    </a-tag>
    <template #overflow="{ number }">
      <a-popover :content-style="{ maxWidth: '300px', padding: '8px 12px' }">
        <a-tag color="arcoblue" size="small">+{{ number }}</a-tag>
        <template #content>
          <a-space wrap>
            <a-tag v-for="tag in data.filter((i, n) => n >= data.length - number)" :key="tag" :color="tag.itemColor" size="small">
              {{ tag.itemName }}
            </a-tag>
          </a-space>
        </template>
      </a-popover>
    </template>
  </a-overflow-list>
</template>

<script lang="ts" setup>
import {defineProps} from "vue";

defineOptions({ name: 'GiCellTags' })

const props = defineProps<{
  data: { itemName: string; itemValue: string | number; itemColor?: string }[]
}>()

</script>

<style lang="scss" scoped></style>
