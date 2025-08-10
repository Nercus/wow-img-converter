<template>
  <div class="flex flex-row justify-between items-center bg-base-200/70 hover:bg-base-200/100 px-4 py-2 rounded transition-colors" :class="{ 'opacity-50': isConverting || isLoading }">
    <div class="flex flex-col justify-start">
      <span class="font-semibold text-md">{{ fileName }} ({{ imgDimensions?.height }} x {{ imgDimensions?.width }})</span>
      <span class="text-xs">{{ props.path }}</span>
    </div>
    <SolarBlackHoleLinear v-if="(isConverting || isLoading)" class="animate-spin" />
    <button v-if="!isCompleted && !isErrored" class="btn btn-soft btn-square btn-sm btn-ghost" :disabled="isConverting || isLoading" @click="filesStore.removePath(props.path)">
      <SolarListCrossMinimalisticLinear />
    </button>
    <SolarVerifiedCheckLinear v-else-if="isCompleted" class="size-6 text-success" />
    <SolarShieldCrossLinear v-else-if="isErrored" class="size-6 text-error" />
  </div>
</template>

<script setup lang="ts">
import { readFile } from '@tauri-apps/plugin-fs'
import { useFilesStore } from '../store/store'

const props = defineProps<{
  path: string
}>()

const filesStore = useFilesStore()
const { isConverting, completed, errored } = storeToRefs(filesStore)

const isCompleted = computed(() => {
  return completed.value.has(props.path)
})

const isErrored = computed(() => {
  return errored.value.has(props.path)
})

const fileName = computed(() => {
  return props.path.split('/').pop() || props.path
})

const isLoading = shallowRef(false)

const imgDimensions = computedAsync(async () => {
  const imageData = await readFile(props.path)
  // Create a Blob from the binary data
  const blob = new Blob([imageData as BlobPart], { type: 'image/*' })
  // Create an object URL for the Blob
  const url = URL.createObjectURL(blob)
  // Load the image and get its dimensions
  return new Promise<{ width: number, height: number }>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(url)
    }
    img.onerror = (err) => {
      reject(err)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}, null, isLoading)
</script>
