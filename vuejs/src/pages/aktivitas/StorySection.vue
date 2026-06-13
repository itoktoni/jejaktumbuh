<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div v-for="story in stories" :key="story.title"
      class="bento-card group bg-canvas-cream rounded-[24px] overflow-hidden border-4 border-[#B7D9BC] shadow-md cursor-pointer transition-all hover:shadow-lg flex flex-col"
      @click="$emit('open-story', story)">
      <div class="h-48 overflow-hidden relative shrink-0">
        <img v-if="!failedImages.has(story.title)" :src="story.image" :alt="story.title" class="w-full h-full object-cover" @error="onImgError(story)" />
        <div v-else class="w-full h-full bg-success-soft flex flex-col items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-1">broken_image</span>
          <span class="text-xs font-medium">Gambar tidak tersedia</span>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div class="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-primary border border-[#B7D9BC]">
          {{ story.pages.length }} halaman
        </div>
      </div>
      <div class="p-5 flex flex-col flex-1">
        <h3 class="font-headline-md text-headline-md mb-2">{{ story.title }}</h3>
        <p class="text-sm text-on-surface-variant mb-3 line-clamp-2">{{ story.desc }}</p>
        <div class="bg-success-soft rounded-xl p-3 mb-3 border border-[#B7D9BC]/50">
          <p class="text-xs text-primary font-bold"><span class="w-5 h-5 rounded-full bg-white border border-[#B7D9BC] inline-flex items-center justify-center text-[10px] align-middle mr-1">💬</span> {{ story.moral }}</p>
        </div>
        <div class="flex items-center gap-2 text-primary font-label-lg mt-auto pt-3 border-t-2 border-[#B7D9BC]/50">
          <span class="material-symbols-outlined text-xl">auto_stories</span>
          Baca Cerita ({{ story.pages.length }} halaman)
          <span class="material-symbols-outlined text-xl ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
  stories: { type: Array, required: true },
  color: { type: String, default: '#176c33' }
})
defineEmits(['open-story'])

const failedImages = reactive(new Set())
function onImgError(story) {
  failedImages.add(story.title)
}
</script>
