<template>
  <Transition name="fade">
    <div v-if="isHovered" class="p-2 size-full">
      <div class="flex justify-center items-center bg-base-100/80 border-2 border-dashed rounded-lg size-full">
        <SolarWallpaperLinear class="size-1/3" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
import { readDir, stat } from '@tauri-apps/plugin-fs'

const emits = defineEmits<{
  (e: 'drop', files: string[]): void
}>()
const isHovered = ref(false)

const ALLOWED_EXTENSIONS = ['.blp', '.png', '.tga', '.svg']

function hasAllowedExtension(filePath: string): boolean {
  return ALLOWED_EXTENSIONS.some(ext => filePath.toLowerCase().endsWith(ext))
}

async function getFileList(paths: string[]) {
  const filePromises = paths.map(async (path) => {
    const fileStat = await stat(path)
    if (fileStat.isFile) {
      return hasAllowedExtension(path) ? [path] : []
    }
    else if (fileStat.isDirectory) {
      const dirFiles = await getFilesInDirectory(path)
      const filteredDirFiles = await Promise.all(
        dirFiles.map(async (file) => {
          const fileStat = await stat(file)
          return fileStat.isFile && hasAllowedExtension(file) ? file : null
        }),
      )
      return filteredDirFiles.filter((file): file is string => file !== null)
    }
    return []
  })

  const results = await Promise.all(filePromises)
  return results.flat()
}
function getFilesInDirectory(path: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    readDir(path)
      .then((entries) => {
        const files = entries
          .filter(entry => !entry.name.startsWith('.')) // Skip hidden files
          .map((entry) => {
            return `${path}/${entry.name}`
          })
        resolve(files)
      })
      .catch(reject)
  })
}

let unlisten: (() => void) | undefined
onMounted(async () => {
  unlisten = await getCurrentWindow().onDragDropEvent(async (event) => {
    if (event.payload.type === 'over') {
      isHovered.value = true
    }
    else if (event.payload.type === 'drop') {
      emits('drop', await getFileList(event.payload.paths))
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
