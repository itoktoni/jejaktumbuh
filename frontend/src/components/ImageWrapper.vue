<template>
  <div class="overflow-hidden bg-surface-container-low" :class="containerClass" :style="containerStyle">
    <img v-if="!hasError && src" :src="src" :alt="alt" class="w-full h-full object-cover" @error="hasError = true" />
    <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl opacity-40">image_not_supported</span>
      <span class="text-xs opacity-40">Gambar tidak tersedia</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  height: { type: String, default: '220px' },
  rounded: { type: String, default: '' }
})

const hasError = ref(false)

const containerClass = computed(() => props.rounded ? `rounded-[${props.rounded}]` : '')
const containerStyle = computed(() => ({ height: props.height }))
</script>
