<template>
  <div class="relative flex flex-row justify-between items-center bg-base-100 inner-shadow px-4 border-t border-base-content/20 w-full h-16">
    <div class="flex flex-row items-center gap-4">
      <div class="join">
        <input v-model="outputPath" type="text" class="min-w-xs input join-item input-sm" placeholder="Set output path">
        <button class="btn btn-soft join-item btn-square btn-sm" @click="selectFolder">
          <SolarFolderWithFilesLinear />
        </button>
      </div>
      <span>{{ paths.length }} Files</span>
    </div>
    <FormatSelect />
    <button class="btn btn-primary" :disabled="!allowConversion" @click="filesStore.convert()">
      Convert
      <SolarBlackHoleLinear v-if="isConverting" class="animate-spin" />
      <SolarAltArrowRightLinear v-else />
    </button>
    <ConversionProgress class="top-0 absolute inset-x-0 -translate-y-full" />
  </div>
</template>

<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'
import { storeToRefs } from 'pinia'
import { useFilesStore } from '../store/store'

const filesStore = useFilesStore()
const { paths, outputPath, isConverting, targetFormat } = storeToRefs(filesStore)

const allowConversion = computed(() => {
  return paths.value.length > 0 && outputPath.value.trim().length > 0 && !isConverting.value && targetFormat.value !== ''
})

async function selectFolder() {
  const folder = await open({
    multiple: false,
    directory: true,
  })
  if (folder) {
    outputPath.value = folder as string
  }
}
</script>
