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
  const targetType = ref<string>('') // the target type for conversion, e.g. 'blp', 'png', 'jpg', etc.
  const completed = ref<Map<string, boolean>>(new Map()) // a map to track completed conversions boolean shows whether the conversion for a file was successful

  async function getAllImageDimensions() {
    const dims = await invoke('get_image_dimensions', { paths: paths.value })
    return dims as { width: number, height: number, path: string }[]
  }

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

  function isPowerOfTwo(value: number): boolean {
    return (value & (value - 1)) === 0 && value > 0
  }

  async function checkPaths() {
    if (targetType.value !== 'blp_dxt') return
    const dimensions = await getAllImageDimensions()
    // when targetType is 'blp_dxt', we need to check if the images have dimensions with a power of two
    // filter out the paths that do not have power of two dimensions and show a warning when something was filtered out
    const invalidPaths = paths.value.filter((path) => {
      const dim = dimensions.find(d => d.path === path)
      if (!dim) return false // skip if no dimensions found
      return !isPowerOfTwo(dim.width) || !isPowerOfTwo(dim.height)
    })
    if (invalidPaths.length > 0) {
      push.warning({
        title: 'Invalid Image Dimensions',
        message: `The following images do not have dimensions that are a power of two and will be skipped: ${invalidPaths.map(p => p.split('/').pop()).join(', ')}`,
      })
      // remove the invalid paths from the list
      paths.value = paths.value.filter(path => !invalidPaths.includes(path))
    }
    if (paths.value.length === 0) {
      push.error({
        title: 'No Valid Images',
        message: 'No images with valid dimensions found for conversion.',
      })
      throw new Error('No valid images found for conversion')
    }
  }

  async function convert() {
    await checkPaths()
    isConverting.value = true
    listen('conversion-status', (a: { payload: string }) => {
      const payload = JSON.parse(a.payload) as { status: string, source: string, target: string }

      const { status, source } = payload
      if (status !== 'completed' || !source) {
        completed.value.set(source || 'Unknown source', false)
        console.error(`Conversion failed for source: ${source}, status: ${status}`)
        push.error({
          title: 'Conversion Error',
          message: `Failed to convert ${source ? source.split('/').pop() : 'Unknown file'} to ${targetFormat.value}`,
        })
      }
      else {
        completed.value.set(source, true)
      }

      if (completed.value.size === paths.value.length && isConverting.value) {
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
          targetFormat: targetType.value,
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
    targetType,
    completed,
    setOutputPath,
    addPaths,
    clearPaths,
    removePath,
    convert,
    reset,
    getAllImageDimensions,
  }
})
