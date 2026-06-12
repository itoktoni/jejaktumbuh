<template>
  <div class="fade-in-up">
    <button @click="$emit('back')"
      class="flex items-center gap-2 text-primary font-label-lg mb-stack-md hover:opacity-80 transition-opacity bg-success-soft px-4 py-2 rounded-full border-2 border-[#B7D9BC]">
      <span class="material-symbols-outlined text-xl">arrow_back</span>
      Kembali
    </button>

    <section class="mb-stack-lg">
      <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight mb-2">
        Pilih Aktivitas
      </h2>
      <p class="font-body-md text-body-md text-on-surface-variant">Aktivitas seru untuk {{ title }}.</p>
    </section>

    <div v-if="!filtered.length"
      class="bg-canvas-cream rounded-[24px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
      <p class="text-3xl mb-2">🎈</p>
      <p class="text-sm text-on-surface-variant font-medium">Belum ada aktivitas yang cocok untuk usia anak ini.</p>
    </div>

    <!-- Featured Card -->
    <div v-if="filtered.length" class="mb-4">
      <div
        class="bento-card group relative overflow-hidden rounded-[32px] cursor-pointer transition-all hover:shadow-xl border-4"
        :style="{ background: `linear-gradient(135deg, ${filtered[0].color}15, ${filtered[0].color}05)`, borderColor: filtered[0].color, boxShadow: `0 8px 32px ${filtered[0].color}20` }"
        @click="$emit('selectAktivitas', filtered[0])">
        <div class="flex items-center gap-5 p-6 md:p-8">
          <div class="w-20 h-20 rounded-[24px] flex items-center justify-center text-5xl shrink-0 shadow-lg border-4 border-white"
            :style="{ background: `linear-gradient(135deg, ${filtered[0].color}, ${filtered[0].color}CC)` }">
            {{ filtered[0].emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-xs font-bold uppercase tracking-widest" :style="{ color: filtered[0].color }">Populer</span>
            <h3 class="font-headline-md text-headline-md text-text-main mt-1">{{ filtered[0].title }}</h3>
            <p class="text-sm text-on-surface-variant mt-1 line-clamp-2">{{ filtered[0].desc }}</p>
          </div>
          <span class="material-symbols-outlined text-3xl text-primary/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">arrow_forward</span>
        </div>
        <div class="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10" :style="{ background: filtered[0].color }"></div>
      </div>
    </div>

    <!-- Grid Cards -->
    <div class="grid grid-cols-2 gap-3">
      <div v-for="item in filtered.slice(1)" :key="item.key"
        class="bento-card group bg-canvas-cream rounded-[24px] overflow-hidden cursor-pointer transition-all hover:shadow-lg flex flex-col border-4 border-[#B7D9BC] shadow-md"
        @click="$emit('selectAktivitas', item)">
        <div class="p-4 flex flex-col flex-1">
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl border-2 border-white shadow-sm"
              :style="{ background: item.bg }">
              {{ item.emoji }}
            </div>
            <span class="material-symbols-outlined text-primary/30 group-hover:text-primary transition-colors text-lg">chevron_right</span>
          </div>
          <h3 class="font-label-lg text-label-lg text-text-main mb-1">{{ item.title }}</h3>
          <p class="text-xs leading-snug text-on-surface-variant line-clamp-2 mt-auto">{{ item.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="mt-stack-lg bg-success-soft rounded-[32px] p-6 relative overflow-hidden border-4 border-[#B7D9BC] shadow-md mb-8">
      <div class="relative z-10 flex gap-4">
        <div class="shrink-0">
          <div class="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <span class="w-10 h-10 rounded-full bg-white border-2 border-[#B7D9BC] flex items-center justify-center text-lg">💡</span>
          </div>
        </div>
        <div>
          <h4 class="font-label-lg text-label-lg text-primary mb-1 uppercase tracking-wider">Tips Hari Ini</h4>
          <p class="font-body-md text-body-lg text-on-surface-variant italic leading-relaxed">"Karakter tidak dibangun dalam sehari, tapi melalui pilihan kecil yang dilakukan setiap pagi."</p>
        </div>
      </div>
      <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { filterActivities } from '../data/activities.js'

const props = defineProps({
  title: { type: String, default: '' },
  childAge: { type: Number, default: null },
  skillKey: { type: String, default: null }
})

defineEmits(['back', 'selectAktivitas'])

const filtered = computed(() => filterActivities(props.childAge, props.skillKey))
</script>
