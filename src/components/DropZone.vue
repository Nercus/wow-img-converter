<template>
  <Transition name="fade">
    <div v-if="isHovered || isLoading" class="p-2 size-full">
      <div class="flex justify-center items-center bg-base-100/80 border-2 border-dashed rounded-lg size-full">
        <div v-if="isLoading" class="flex flex-col justify-center items-center w-full">
          <SolarBlackHoleLinear class="size-1/4 animate-spin" />
          <span class="text-lg">Reading files...</span>
        </div>
        <template v-else>
          <SolarWallpaperLinear class="size-1/3" />
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

const emits = defineEmits<{
  (e: 'drop', files: string[]): void
}>()
const isHovered = ref(false)
const isLoading = ref(false)

async function getFileList(paths: string[]) {
  return await invoke<string[]>('get_allowed_files', { paths })
}

let unlisten: (() => void) | undefined
onMounted(async () => {
  unlisten = await getCurrentWindow().onDragDropEvent(async (event) => {
    if (event.payload.type === 'over') {
      isHovered.value = true
    }
    else if (event.payload.type === 'drop') {
      isLoading.value = true
      emits('drop', await getFileList(event.payload.paths))
      isLoading.value = false
      isHovered.value = false
    }
    else {
      isHovered.value = false
    }
  })
})

onUnmounted(() => {
  unlisten?.()
})
</script>
