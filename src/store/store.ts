import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { basename, join } from '@tauri-apps/api/path'
import { push } from 'notivue'
import { defineStore } from 'pinia'

export const useFilesStore = defineStore('files', () => {
  const paths = ref<string[]>([])
  const outputPath = ref<string>('')
  const isConverting = ref<boolean>(false)
  const targetFormat = ref<string>('')
  const completed = ref<Map<string, boolean>>(new Map()) // a map to track completed conversions boolean shows whether the conversion for a file was successful

  function reset() {
    paths.value = []
    outputPath.value = ''
    isConverting.value = false
    targetFormat.value = ''
    completed.value.clear()
  }

  function setOutputPath(path: string) {
    outputPath.value = path
  }

  function addPaths(newPaths: string[]) {
    // insert the files at the end of the list
    // only include files that are not already in the list
    const existingFiles = new Set(paths.value)
    newPaths = newPaths.filter(file => !existingFiles.has(file))
    if (newPaths.length === 0) return
    // add the new files to the list
    paths.value.push(...newPaths)
  }

  function clearPaths() {
    paths.value = []
  }

  function removePath(path: string) {
    const index = paths.value.indexOf(path)
    if (index !== -1) {
      paths.value.splice(index, 1)
    }
  }

  async function convert() {
    isConverting.value = true
    listen('conversion-status', (a: { payload: string }) => {
      const payload = JSON.parse(a.payload) as { status: string, source: string, target: string }

      const { status, source } = payload
      if (status !== 'completed' || !source) {
        completed.value.set(source || 'Unknown source', false)
        console.error(`Conversion failed for source: ${source}, status: ${status}`)
        push.error({
          title: 'Conversion Error',
          message: `Failed to convert ${source} to ${targetFormat.value}`,
        })
        return
      }
      completed.value.set(source, true)
      if (completed.value.size === paths.value.length) {
        isConverting.value = false
        push.success({
          title: 'Conversion Completed',
        })
      }
    })
    for (const path of paths.value) {
      const base = await basename(path)
      const fileName = base.split('.').slice(0, -1).join('.')
      try {
        invoke('convert', {
          sourcePath: path,
          targetPath: await join(outputPath.value, `${fileName}.${targetFormat.value}`),
          sourceFormat: path.split('.').pop() || '',
          targetFormat: targetFormat.value,
        })
      }
      catch (error) {
        console.error(`Error converting file ${path}:`, error)
        completed.value.set(path, false)
      }
    }
  }

  return {
    paths,
    outputPath,
    isConverting,
    targetFormat,
    completed,
    setOutputPath,
    addPaths,
    clearPaths,
    removePath,
    convert,
    reset,
  }
})
