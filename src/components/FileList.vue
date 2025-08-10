<template>
  <div class="flex flex-col gap-2 p-2 w-full h-full overflow-y-auto">
    <FileListEntry v-for="path in paths" :key="path" :path="path" />
  </div>
</template>

<script setup lang="ts">
import { useFilesStore } from '../store/store'

const fileStore = useFilesStore()
const { paths } = storeToRefs(fileStore)
</script>
