import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { defineStore } from 'pinia'

export const useFilesStore = defineStore('files', () => {
  const paths = ref<string[]>([])
  const outputPath = ref<string>('')
  const isConverting = ref<boolean>(false)
  const targetFormat = ref<string>('')
  const completed = ref<Map<string, boolean>>(new Map())
  const errored = ref<Map<string, boolean>>(new Map())

  function reset() {
    paths.value = []
    outputPath.value = ''
    isConverting.value = false
    targetFormat.value = ''
    completed.value.clear()
    errored.value.clear()
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

  function convert() {
    listen('conversion-status', (a: { payload: string }) => {
      const payload = a.payload?.split(':')
      const status = payload[0]
      const source = payload[1]
      if (status !== 'completed' || !source) {
        errored.value.set(source || 'Unknown source', true)
        console.error(`Conversion failed for ${payload.join(':')}: ${status}`)
        return
      }
      completed.value.set(source, true)
    })
    for (const path of paths.value) {
      const fileName = path.split('/').pop()!.split('.').slice(0, -1).join('.')
      invoke('convert', {
        sourcePath: path,
        targetPath: `${outputPath.value}/${fileName}.${targetFormat.value}`,
        sourceFormat: path.split('.').pop() || '',
        targetFormat: targetFormat.value,
      })
    }
  }

  return {
    paths,
    outputPath,
    isConverting,
    targetFormat,
    completed,
    errored,
    setOutputPath,
    addPaths,
    clearPaths,
    removePath,
    convert,
    reset,
  }
})
