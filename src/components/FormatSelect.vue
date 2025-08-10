<template>
  <div class="dropdown-top dropdown dropdown-end">
    <div class="m-1 btn" role="button" tabindex="0">
      {{ targetFormat ? `Converting ${options.find(o => o.value === targetFormat)?.label}` : 'Select Format' }}
    </div>
    <ul tabindex="0" class="z-1 bg-base-100 shadow-sm p-2 rounded-box w-52 menu dropdown-content">
      <li v-for="option in options" :key="option.value">
        <button @click="targetFormat = option.value">
          <SolarCheckSquareLinear v-if="targetFormat === option.value" />
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
const { targetFormat } = storeToRefs(filesStore)
const options = [
  { label: 'To BLP', value: 'blp' },
  { label: 'To TGA', value: 'tga' },
  { label: 'To PNG', value: 'png' },
]
</script>
