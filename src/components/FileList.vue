<template>
  <div v-bind="containerProps" class="flex flex-col gap-2 p-2 w-full h-full">
    <div v-bind="wrapperProps">
      <FileListEntry v-for="path in list" :key="path.index" :path="path.data" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'
import { useFilesStore } from '../store/store'

const fileStore = useFilesStore()
const { paths } = storeToRefs(fileStore)

const { list, containerProps, wrapperProps } = useVirtualList(
  paths,
  {
    itemHeight: 56,
  },
)
</script>
