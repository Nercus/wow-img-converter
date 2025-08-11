<template>
  <div class="flex flex-row justify-between items-center bg-base-200/70 hover:bg-base-200/100 mb-2 px-4 py-2 rounded h-14 transition-colors" :class="{ 'opacity-50': isConverting }">
    <div class="flex flex-col justify-start w-full overflow-hidden">
      <span class="w-full overflow-ellipsis font-semibold text-md line-clamp-1">{{ fileName }}</span>
      <span class="overflow-ellipsis text-xs line-clamp-1">{{ props.path }}</span>
    </div>
    <SolarShieldCrossLinear v-if="isCompleted === false" class="size-6 text-error" />
    <SolarVerifiedCheckLinear v-else-if="isCompleted === true" class="size-6 text-success" />
    <button v-else class="btn btn-soft btn-square btn-sm btn-ghost" :disabled="isConverting" @click="filesStore.removePath(props.path)">
      <SolarListCrossMinimalisticLinear />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useFilesStore } from '../store/store'

const props = defineProps<{
  path: string
}>()

const filesStore = useFilesStore()
const { isConverting, completed } = storeToRefs(filesStore)

const isCompleted = computed(() => {
  return completed.value.get(props.path)
})

const fileName = computed(() => {
  return props.path.split('/').pop() || props.path
})
</script>
