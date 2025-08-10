<template>
  <progress v-if="paths.length > 0" :value="completed.size" :max="paths.length" class="w-full h-1 progress progress-primary" />
</template>

<script setup lang="ts">
import { useFilesStore } from '../store/store'

const filesStore = useFilesStore()
const { paths, completed } = storeToRefs(filesStore)
</script>
