<template>
  <Notivue v-slot="item">
    <Notification :item="item" />
  </Notivue>
  <div class="flex flex-col bg-base-100 size-full select-none">
    <div class="flex flex-row justify-between items-center gap-1 bg-base-100 border-b border-base-content/20 navbar">
      <span class="flex-1">
        <h1 class="text-xl">
          WoW Image Converter
        </h1>
        <h2 class="pl-4 text-xs italic">
          by <a href="https://github.com/Nercus" target="_blank">Nerc</a>
        </h2>
      </span>

      <button class="btn btn-error btn-sm" @click="filesStore.reset()">
        <SolarRestartLinear class="-scale-x-100" />
        Reset
      </button>
      <div class="m-0 divider divider-horizontal" />
      <a class="btn btn-neutral btn-sm" target="_blank" href="https://github.com/Nercus/wow-img-converter">
        <SolarCodeCircleLinear />
      </a>
      <label class="mx-0 swap swap-rotate btn btn-sm">
        <input type="checkbox" class="theme-controller" value="business">
        <SolarSun2Linear class="fill-current swap-off" />
        <SolarMoonLinear class="fill-current swap-on" />
      </label>
    </div>
    <div class="relative flex flex-col flex-1 justify-center items-center overflow-hidden">
      <DropZone class="absolute inset-0" @drop="onFilesDropped" />
      <span v-if="paths.length === 0" class="flex items-center h-full">Drop files here to convert</span>
      <FileList class="h-full" />
    </div>
    <Toolbar />
  </div>
</template>

<script setup lang="ts">
import { Notification, Notivue } from 'notivue'
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
