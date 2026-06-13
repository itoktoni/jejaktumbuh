<template>
  <div class="fade-in-up">
    <section class="mb-4">
      <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight mb-2">
        Mau Belajar Apa Hari Ini?
      </h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-3">Pilih area yang ingin dikembangkan bersama si kecil.</p>
      <div v-if="anakList.length">
        <AnakSelector :anak-list="anakList" :model-value="selectedAnakId" @update:model-value="$emit('update:anak-id', $event)" />
      </div>
    </section>

    <button @click="$emit('back')"
      class="flex items-center gap-2 text-primary font-label-lg mb-4 hover:opacity-80 transition-opacity border border-primary-container px-3 py-1.5 rounded-full">
      <span class="material-symbols-outlined text-xl">arrow_back</span>
      Kembali
    </button>
    <h3 class="font-headline-md text-headline-md mb-2">{{ data.title }}</h3>
    <p class="font-body-md text-body-md text-on-surface-variant mb-stack-lg">{{ data.desc }}</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-for="item in data.items" :key="item.title"
        class="bento-card group bg-white p-4 rounded-[24px] soft-shadow flex items-center gap-3 transition-all hover:shadow-xl cursor-pointer border"
        :style="{ borderColor: data.color }"
        @click="$emit('selectSub', item.title)">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
          :style="{ background: data.bg }">{{ item.emoji }}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-label-lg text-label-lg text-primary leading-snug">{{ item.title }}</h3>
          <p class="text-xs leading-snug text-on-surface-variant mt-0.5 line-clamp-2">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AnakSelector from '../components/AnakSelector.vue'
import { pilars } from '../data/pilars.js'
import { getSkillsByPilar } from '../data/skills.js'

const props = defineProps({
  anakList: { type: Array, default: () => [] },
  selectedAnakId: { type: Number, default: null },
  pilarKey: { type: String, required: true },
  childAge: { type: Number, default: null }
})

defineEmits(['back', 'selectSub', 'update:anak-id'])

const data = computed(() => {
  const pilar = pilars.find(p => p.key === props.pilarKey)
  if (!pilar) return {}
  return { title: pilar.title, desc: `Pilih fokus karakter untuk aktivitas bersama si kecil.`, color: pilar.color, bg: pilar.bg, items: getSkillsByPilar(props.pilarKey, props.childAge) }
})
</script>
