<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div v-for="proj in projects" :key="proj.title"
      class="bento-card group bg-canvas-cream rounded-[24px] overflow-hidden border-4 border-[#B7D9BC] shadow-md cursor-pointer transition-all hover:shadow-lg flex flex-col"
      @click="$emit('open-project', proj)">
      <div class="h-48 overflow-hidden relative shrink-0">
        <img v-if="!failedImages.has(proj.title)" :src="proj.image" :alt="proj.title" class="w-full h-full object-cover" @error="onImgError(proj)" />
        <div v-else class="w-full h-full bg-success-soft flex flex-col items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-1">broken_image</span>
          <span class="text-xs font-medium">Gambar tidak tersedia</span>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div class="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-primary border border-[#B7D9BC]">
          {{ proj.duration }}
        </div>
        <div class="absolute bottom-3 left-3 flex items-center gap-2">
          <span class="bg-white/90 rounded-full px-3 py-1 text-xs font-bold border border-[#B7D9BC]" :style="{ color }">
            {{ proj.difficulty }}
          </span>
        </div>
      </div>
      <div class="p-5 flex flex-col flex-1">
        <h3 class="font-headline-md text-headline-md mb-2">{{ proj.title }}</h3>
        <p class="text-sm text-on-surface-variant mb-3">{{ proj.desc }}</p>
        <div class="bg-white rounded-xl p-4 mb-3 border-2 border-[#B7D9BC]/50">
          <p class="font-label-lg text-label-lg text-primary mb-2 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-success-soft border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs">📦</span>
            Bahan yang Dibutuhkan
          </p>
          <ul class="space-y-1.5">
            <li v-for="m in proj.materials" :key="m" class="flex items-center gap-2 text-xs text-on-surface-variant">
              <span class="material-symbols-outlined text-sm text-primary">check_box_outline_blank</span>
              {{ m }}
            </li>
          </ul>
        </div>
        <div class="flex items-center gap-2 text-primary font-label-lg mt-auto pt-3 border-t-2 border-[#B7D9BC]/50">
          <span class="material-symbols-outlined text-xl">palette</span>
          Mulai Proyek
          <span class="material-symbols-outlined text-xl ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
  projects: { type: Array, required: true },
  color: { type: String, default: '#176c33' }
})
defineEmits(['open-project'])

const failedImages = reactive(new Set())
function onImgError(proj) {
  failedImages.add(proj.title)
}
</script>
