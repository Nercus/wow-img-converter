<template>
  <div v-bind="containerProps" class="p-2 w-full h-full overflow-y-auto">
    <div v-bind="wrapperProps">
      <FileListEntry v-for="{ data } in list" :key="data" :path="data" />
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
    overscan: 5,
  },
)

watchEffect(() => {
  if (paths.value.length > 0) {
    containerProps.onScroll()
  }
})
</script>
