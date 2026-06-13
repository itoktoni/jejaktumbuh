<template>
  <div class="space-y-4">
    <div v-for="ex in exercises" :key="ex.title" class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
      <h3 class="font-headline-md text-headline-md mb-3"><span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] inline-flex items-center justify-center text-base align-middle mr-1">🧘</span> {{ ex.title }}</h3>
      <ol class="space-y-3 mb-4">
        <li v-for="(step, i) in ex.steps" :key="i" class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 border-2 border-white shadow-sm" :style="{ background: color }">{{ i + 1 }}</div>
          <p class="font-body-md text-body-md text-on-surface-variant pt-1">{{ step }}</p>
        </li>
      </ol>
      <div class="bg-success-soft rounded-2xl p-4 border border-[#B7D9BC]/50">
        <p class="font-label-lg text-label-lg text-primary mb-1"><span class="w-6 h-6 rounded-full bg-white border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">✨</span> Manfaat</p>
        <p class="text-sm text-on-surface-variant">{{ ex.benefit }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  exercises: { type: Array, required: true },
  color: { type: String, default: '#176c33' }
})
</script>
