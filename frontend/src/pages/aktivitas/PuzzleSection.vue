<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div v-for="pz in safePuzzles" :key="pz.title"
      class="bento-card group bg-canvas-cream rounded-[24px] overflow-hidden border-4 border-[#B7D9BC] shadow-md cursor-pointer transition-all hover:shadow-lg flex flex-col"
      @click="$emit('open-puzzle', pz)">
      <div class="p-5 pb-3 flex items-center justify-between bg-success-soft">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white border-2 border-white shadow-sm">🧩</div>
        <span class="bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-primary border border-[#B7D9BC]">
          {{ (pz.questions || []).length }} soal
        </span>
      </div>
      <div class="p-5 pt-3 flex flex-col flex-1">
        <h3 class="font-headline-md text-headline-md mb-2">{{ pz.title }}</h3>
        <p class="text-sm text-on-surface-variant mb-3">{{ pz.desc }}</p>
        <div class="flex items-center gap-2 text-primary font-label-lg mt-auto pt-3 border-t-2 border-[#B7D9BC]/50">
          <span class="material-symbols-outlined text-xl">psychology</span>
          Mulai Teka-Teki
          <span class="material-symbols-outlined text-xl ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  puzzles: { type: Array, required: true },
  color: { type: String, default: '#176c33' },
  bg: { type: String, default: '#E1F2E5' }
})
defineEmits(['open-puzzle'])

const safePuzzles = computed(() =>
  props.puzzles.filter(p => p && typeof p === 'object' && !Array.isArray(p) && p.questions)
)
</script>
