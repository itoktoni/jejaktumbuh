<template>
  <div class="space-y-4">
    <div v-for="game in games" :key="game.title" class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
      <h3 class="font-headline-md text-headline-md mb-3">🎲 {{ game.title }}</h3>
      <p class="font-body-md text-body-md text-on-surface-variant mb-4">{{ game.how }}</p>
      <div class="bg-white rounded-2xl p-4 mb-3 border-2 border-[#B7D9BC]/50">
        <p class="font-label-lg text-label-lg text-primary mb-2"><span class="w-6 h-6 rounded-full bg-success-soft border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">📋</span> Aturan</p>
        <ul class="space-y-2">
          <li v-for="(rule, i) in game.rules" :key="i" class="flex items-start gap-2 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
            {{ rule }}
          </li>
        </ul>
      </div>
      <div class="bg-success-soft rounded-2xl p-4 border border-[#B7D9BC]/50">
        <p class="font-label-lg text-label-lg text-primary mb-1"><span class="w-6 h-6 rounded-full bg-white border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">💬</span> Pelajaran</p>
        <p class="text-sm text-on-surface-variant">{{ game.moral }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  games: { type: Array, required: true },
  color: { type: String, default: '#176c33' }
})
</script>
