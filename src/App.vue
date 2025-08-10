<template>
  <div class="flex flex-col bg-base-100 size-full">
    <div class="flex flex-row justify-between items-center bg-base-100 border-b border-base-content/20 navbar">
      <h1 class="text-xl">
        Nerc's BLP Converter
      </h1>
      <button class="btn btn-soft btn-ghost btn-sm" @click="filesStore.reset()">
        <SolarRestartLinear class="-scale-x-100" />
        Reset
      </button>
    </div>
    <div class="relative flex flex-col flex-1 justify-center items-center overflow-hidden">
      <DropZone class="absolute inset-0" @drop="onFilesDropped" />
      <span v-if="paths.length === 0" class="flex items-center h-full">Drop files here to convert</span>
      <FileList class="flex-1" />
    </div>
    <Toolbar />
  </div>
</template>

<script setup lang="ts">
import { useFilesStore } from './store/store'

const filesStore = useFilesStore()
const { paths } = storeToRefs(filesStore)

function onFilesDropped(droppedFiles: string[]) {
  filesStore.addPaths(droppedFiles)
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
