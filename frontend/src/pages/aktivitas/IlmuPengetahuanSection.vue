<template>
  <div class="space-y-4">
    <div v-for="item in items" :key="item.title" class="bg-canvas-cream rounded-[24px] overflow-hidden border-4 border-[#B7D9BC] shadow-md">
      <!-- Image -->
      <div class="h-48 overflow-hidden relative shrink-0">
        <img v-if="!failedImages.has(item.title)" :src="item.image" :alt="item.title" class="w-full h-full object-cover" @error="onImgError(item)" />
        <div v-else class="w-full h-full bg-success-soft flex flex-col items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-1">broken_image</span>
          <span class="text-xs font-medium">Gambar tidak tersedia</span>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div class="absolute bottom-3 left-3">
          <span class="bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-primary border border-[#B7D9BC]">
            🔬 Eksperimen
          </span>
        </div>
      </div>

      <div class="p-5">
        <h3 class="font-headline-md text-headline-md mb-2">{{ item.title }}</h3>

        <!-- Materials -->
        <div v-if="item.materials && item.materials.length" class="bg-white rounded-2xl p-4 mb-3 border-2 border-[#B7D9BC]/50">
          <p class="font-label-lg text-label-lg text-primary mb-2">
            <span class="w-6 h-6 rounded-full bg-success-soft border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">📦</span>
            Bahan yang Dibutuhkan
          </p>
          <ul class="space-y-1.5">
            <li v-for="(m, i) in item.materials" :key="i" class="flex items-center gap-2 text-xs text-on-surface-variant">
              <span class="material-symbols-outlined text-sm text-primary">check_box_outline_blank</span>
              {{ m }}
            </li>
          </ul>
        </div>

        <!-- Steps -->
        <div v-if="item.steps && item.steps.length" class="mb-3">
          <p class="font-label-lg text-label-lg text-primary mb-3">
            <span class="w-6 h-6 rounded-full bg-success-soft border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">📋</span>
            Langkah-Langkah
          </p>
          <ol class="space-y-2">
            <li v-for="(step, i) in item.steps" :key="i" class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 border-2 border-white shadow-sm" style="background: #176c33">{{ i + 1 }}</div>
              <p class="text-sm text-on-surface-variant pt-0.5">{{ step }}</p>
            </li>
          </ol>
        </div>

        <!-- Explanation -->
        <div v-if="item.explanation" class="bg-success-soft rounded-2xl p-4 mb-3 border border-[#B7D9BC]/50">
          <p class="font-label-lg text-label-lg text-primary mb-1">
            <span class="w-6 h-6 rounded-full bg-white border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">💡</span>
            Penjelasan
          </p>
          <p class="text-sm text-on-surface-variant leading-relaxed">{{ item.explanation }}</p>
        </div>

        <!-- Fun Fact -->
        <div v-if="item.funFact" class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC]/50">
          <p class="font-label-lg text-label-lg text-primary mb-1">
            <span class="w-6 h-6 rounded-full bg-success-soft border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">⭐</span>
            Tahukah Kamu?
          </p>
          <p class="text-sm text-on-surface-variant leading-relaxed italic">{{ item.funFact }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
  items: { type: Array, required: true },
  color: { type: String, default: '#176c33' }
})

const failedImages = reactive(new Set())
function onImgError(item) {
  failedImages.add(item.title)
}
</script>
