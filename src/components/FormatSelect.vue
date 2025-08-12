<template>
  <div class="dropdown-top dropdown dropdown-end">
    <div class="m-1 text-xs btn" role="button" tabindex="0" :disbled="isConverting">
      {{ targetFormat ? `Convert ${options.find(o => targetFormat === o.format && targetType === o.type)?.label}` : 'Select Format' }}
    </div>
    <ul tabindex="0" class="z-1 bg-base-100 shadow-sm p-2 rounded-box w-52 menu dropdown-content">
      <li v-for="option in options" :key="option.format">
        <button @click="targetFormat = option.format; targetType = option.type">
          <SolarCheckSquareLinear v-if="targetFormat === option.format && targetType === option.type" />
          <SolarStopLinear v-else />
          {{ option.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useFilesStore } from '../store/store'

const filesStore = useFilesStore()
const { targetFormat, targetType, isConverting } = storeToRefs(filesStore)
const options = [
  { label: 'To BLP (Compressed)', type: 'blp_dxt', format: 'blp' },
  { label: 'To BLP (Uncompressed)', type: 'blp_raw', format: 'blp' },
  { label: 'To TGA', type: 'tga', format: 'tga' },
  { label: 'To PNG', type: 'png', format: 'png' },
]
</script>
