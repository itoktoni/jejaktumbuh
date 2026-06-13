<template>
  <div class="space-y-4">
    <div v-for="sc in scripts" :key="sc.title" class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
      <h3 class="font-headline-md text-headline-md mb-3"><span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] inline-flex items-center justify-center text-base align-middle mr-1">🎤</span> {{ sc.title }}</h3>
      <div class="bg-white rounded-2xl p-5 mb-4 border-2 border-[#B7D9BC]/50">
        <p class="font-body-md text-body-md text-on-surface-variant italic leading-relaxed">"{{ sc.script }}"</p>
      </div>
      <div class="bg-success-soft rounded-2xl p-4 border border-[#B7D9BC]/50">
        <p class="font-label-lg text-label-lg text-primary mb-2"><span class="w-6 h-6 rounded-full bg-white border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">💡</span> Tips</p>
        <ul class="space-y-1.5">
          <li v-for="(tip, i) in sc.tips" :key="i" class="flex items-start gap-2 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-lg mt-0.5">lightbulb</span>
            {{ tip }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  scripts: { type: Array, required: true },
  color: { type: String, default: '#176c33' }
})
</script>
