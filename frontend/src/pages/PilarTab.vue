<template>
  <div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">

    <div v-show="!selectedSub" class="mb-stack-lg">
      <section class="mb-4">
        <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight mb-2">
          Mau Belajar Apa Hari Ini?
        </h2>
        <p class="font-body-md text-body-md text-on-surface-variant mb-3">Pilih area yang ingin dikembangkan bersama si kecil.</p>
        <div v-if="anakList.length">
          <AnakSelector :anak-list="anakList" :model-value="selectedAnakId" @update:model-value="$emit('update:anak-id', $event)" />
        </div>
      </section>

      <div v-if="!anakList.length"
        class="bg-canvas-cream rounded-[32px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <div class="text-5xl mb-4">👶</div>
        <h3 class="font-headline-sm text-text-main mb-2">Belum Ada Data Anak</h3>
        <p class="text-sm text-on-surface-variant mb-5">Tambahkan data anak terlebih dahulu sebelum memilih aktivitas.</p>
        <button @click="$emit('go-profile')"
          class="px-6 py-3 rounded-2xl text-white text-sm font-bold btn-pop-green">
          + Tambah Anak
        </button>
      </div>

      <div v-else-if="!selectedAnakId"
        class="bg-canvas-cream rounded-[32px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <div class="text-5xl mb-4">👆</div>
        <h3 class="font-headline-sm text-text-main mb-2">Pilih Anak Terlebih Dahulu</h3>
        <p class="text-sm text-on-surface-variant">Gunakan dropdown di atas untuk memilih anak yang ingin dikembangkan.</p>
      </div>

      <div v-else-if="!selectedChild || !selectedChild.tahun"
        class="bg-canvas-cream rounded-[32px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <div class="text-5xl mb-4">📅</div>
        <h3 class="font-headline-sm text-text-main mb-2">Set Tanggal Lahir Anak</h3>
        <p class="text-sm text-on-surface-variant mb-5">Untuk menampilkan aktivitas yang sesuai usia, silakan set tanggal lahir anak di Profil.</p>
        <button @click="$emit('go-profile')"
          class="px-6 py-3 rounded-2xl text-white text-sm font-bold btn-pop-green">
          Ke Profil
        </button>
      </div>

      <template v-else v-for="pilar in filteredPilars" :key="pilar.key">
        <div
          class="bento-card group relative bg-canvas-cream rounded-[24px] overflow-hidden cursor-pointer transition-all hover:shadow-lg border-4 mb-3"
          :style="{ borderColor: selectedPilar === pilar.key ? pilar.color : '#B7D9BC', boxShadow: selectedPilar === pilar.key ? `0 6px 24px ${pilar.color}30` : `0 2px 12px ${pilar.color}10` }"
          @click="togglePilar(pilar.key)">
          <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]" :style="{ background: pilar.color }"></div>
          <div class="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.07]" :style="{ background: pilar.color }"></div>
          <div class="flex items-center gap-4 p-4 md:p-5 pl-5">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border-2 border-white shadow-sm"
              :style="{ background: pilar.bg, color: pilar.color }">
              {{ pilar.emoji }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-label-lg text-label-lg text-text-main">{{ pilar.title }}</h3>
              <p class="text-xs text-on-surface-variant mt-0.5">{{ pilar.subtitle }}</p>
            </div>
            <span class="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors text-lg shrink-0"
              :class="{ 'rotate-180': selectedPilar === pilar.key }">expand_more</span>
          </div>
        </div>

        <div v-if="selectedPilar === pilar.key && getSubData(pilar.key)" class="mb-3 fade-in-up">
          <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-headline-sm text-text-main">{{ getSubData(pilar.key).title }}</h3>
              <button @click.stop="closePilar"
                class="flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors bg-white px-3 py-1.5 rounded-full border-2 border-[#B7D9BC]">
                <span class="material-symbols-outlined text-lg">close</span>
                Tutup
              </button>
            </div>
            <p class="text-sm text-on-surface-variant mb-4">{{ getSubData(pilar.key).desc }}</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="item in getSubData(pilar.key).items" :key="item.title"
                class="group bg-white p-4 rounded-[20px] shadow-sm flex items-center gap-3 transition-all hover:shadow-md cursor-pointer border-2 border-[#B7D9BC]"
                @click.stop="openAktivitas(item, pilar.key)">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  :style="{ background: getSubData(pilar.key).bg }">{{ item.emoji }}</div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-label-lg text-label-lg text-primary leading-snug">{{ item.title }}</h3>
                  <p class="text-xs leading-snug text-on-surface-variant mt-0.5 line-clamp-2">{{ item.desc }}</p>
                </div>
                <span class="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors text-lg shrink-0">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-show="!selectedSub"
      class="mt-stack-lg bg-success-soft rounded-[32px] p-6 md:p-8 relative overflow-hidden border-4 border-[#B7D9BC] shadow-md">
      <div class="relative z-10 flex gap-4">
        <div class="shrink-0">
          <div class="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <span class="w-10 h-10 rounded-full bg-white border-2 border-[#B7D9BC] flex items-center justify-center text-lg">💡</span>
          </div>
        </div>
        <div>
          <h4 class="font-label-lg text-label-lg text-primary mb-1 uppercase tracking-wider">Tips Hari Ini</h4>
          <p class="font-body-md text-body-lg text-on-surface-variant italic leading-relaxed">"Fokus pada satu hal kecil hari ini memberikan dampak besar di masa depan."</p>
        </div>
      </div>
      <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
    </div>

    <AktivitasPage v-if="selectedSub && !selectedAktivitas" :title="selectedSub" :child-age="childAge" :skill-key="selectedSkillKey" @back="closeAktivitas"
      @select-aktivitas="openDetail" />

    <AktivitasDetailPage v-if="selectedAktivitas" ref="detailPageRef" :item="selectedAktivitas" @back="closeDetail" />

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AktivitasPage from './AktivitasPage.vue'
import AktivitasDetailPage from './AktivitasDetailPage.vue'
import AnakSelector from '../components/AnakSelector.vue'
import { useAnakStore } from '../stores/anakStore.js'
import { pilars, filterPilars } from '../data/pilars.js'
import { getSkillsByPilar } from '../data/skills.js'
import { calcAge } from '../utils/age.js'

const anak = useAnakStore()

const props = defineProps({
  anakList: { type: Array, default: () => [] },
  selectedPilar: { type: String, default: null },
  selectedAnakId: { type: Number, default: null }
})

const emit = defineEmits(['select-pilar', 'close-pilar', 'update:anak-id', 'go-profile'])

const selectedSub = ref(null)
const selectedAktivitas = ref(null)
const selectedPilarKey = ref(null)

const selectedChild = computed(() => props.anakList.find(a => a.id === props.selectedAnakId))
const childAge = computed(() => selectedChild.value ? calcAge(selectedChild.value.tahun, selectedChild.value.bulan, selectedChild.value.tanggal) : null)
const filteredPilars = computed(() => filterPilars(childAge.value))
const detailPageRef = ref(null)
const selectedSkillKey = ref(null)

watch(() => props.selectedPilar, (val) => {
  if (!val) {
    selectedSub.value = null
    selectedAktivitas.value = null
  }
})

function getSubData(key) {
  const pilar = pilars.find(p => p.key === key)
  if (!pilar) return null
  const items = getSkillsByPilar(key, childAge.value)
  return { title: pilar.title, desc: `Pilih fokus karakter untuk aktivitas bersama si kecil.`, color: pilar.color, bg: pilar.bg, items }
}

function togglePilar(key) {
  if (props.selectedPilar === key) {
    closePilar()
  } else {
    emit('select-pilar', key)
    selectedPilarKey.value = key
    selectedSub.value = null
    selectedAktivitas.value = null
  }
}

function closePilar() {
  emit('close-pilar')
  selectedSub.value = null
  selectedAktivitas.value = null
}

function openAktivitas(item, pilarKey) {
  if (props.selectedAnakId) {
    const skillKey = item.title.toLowerCase().replace(/\s+/g, '_')
    anak.addSkill(props.selectedAnakId, {
      key: skillKey,
      emoji: item.emoji,
      title: item.title,
      pilar: pilarKey,
      color: getSubData(pilarKey).color
    })
    selectedSkillKey.value = skillKey
  }
  selectedSub.value = item.title
  selectedAktivitas.value = null
  history.pushState({ action: 'sub' }, '')
  window.scrollTo(0, 0)
}

function closeAktivitas() {
  selectedSub.value = null
  selectedAktivitas.value = null
}

function openDetail(item) {
  if (props.selectedAnakId && selectedSkillKey.value) {
    anak.addActivity(props.selectedAnakId, selectedSkillKey.value, {
      title: item.title,
      emoji: item.emoji,
      feature: item.feature
    })
  }
  selectedAktivitas.value = item
  history.pushState({ action: 'detail' }, '')
  window.scrollTo(0, 0)
}

function closeDetail() {
  selectedAktivitas.value = null
}

function goBack() {
  if (selectedAktivitas.value && detailPageRef.value?.goBack()) return true
  if (selectedAktivitas.value) { selectedAktivitas.value = null; return true }
  if (selectedSub.value) { selectedSub.value = null; selectedAktivitas.value = null; return true }
  return false
}

defineExpose({ goBack })
</script>

<style scoped>
.btn-pop-green {
  background-color: #6DBE7B;
  box-shadow: 0 4px 0 #176c33;
  transition: all 0.1s ease;
}
.btn-pop-green:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 #176c33;
}
</style>
