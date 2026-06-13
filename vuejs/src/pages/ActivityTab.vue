<template>
  <div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">

    <!-- Sync Banner -->
    <div v-if="auth.isAuthenticated && !selectedType"
      class="mb-4 bg-canvas-cream rounded-2xl p-4 border-4 border-[#B7D9BC] shadow-md flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#B7D9BC] shadow-sm shrink-0">
        <span class="material-symbols-outlined text-lg text-primary">cloud_download</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-text-main">
          {{ act.localCount > 0 ? `${act.localCount} aktivitas di perangkat` : 'Belum ada aktivitas' }}
        </p>
        <p class="text-[10px] text-on-surface-variant">Download dari server untuk mendapatkan konten terbaru</p>
      </div>
      <button @click="doDownload" :disabled="act.downloading"
        class="px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 transition-all active:scale-95"
        :style="{ background: (act.serverCount - act.localCount) > 0 ? '#176c33' : '#999' }">
        <span class="material-symbols-outlined text-sm align-middle" :class="act.downloading ? 'animate-spin' : ''">cloud_download</span>
        {{ act.downloading ? '...' : ((act.serverCount - act.localCount) > 0 ? `+${act.serverCount - act.localCount} Baru` : 'Sync') }}
      </button>
    </div>

    <div v-if="!selectedType">
      <section class="mb-stack-lg">
        <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight mb-2 flex items-center gap-2">
          <span class="w-10 h-10 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-xl">🎨</span> Semua Aktivitas
        </h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Pilih jenis aktivitas untuk melihat seluruh konten.</p>
      </section>

      <div class="grid grid-cols-2 gap-3">
        <div v-for="item in aktivitasData" :key="item.key"
          class="bento-card group bg-canvas-cream rounded-[24px] overflow-hidden cursor-pointer transition-all hover:shadow-lg flex flex-col border-4 border-[#B7D9BC] shadow-md"
          @click="openType(item)">
          <div class="p-4 flex flex-col flex-1">
            <div class="flex items-start justify-between mb-3">
              <div class="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl border-2 border-white shadow-sm"
                :style="{ background: item.bg }">
                {{ item.emoji }}
              </div>
              <span class="text-xs font-bold px-2 py-1 rounded-full"
                :style="{ background: item.bg, color: item.color }">
                {{ getItemCount(item) }}
              </span>
            </div>
            <h3 class="font-label-lg text-label-lg text-text-main mb-1">{{ item.title }}</h3>
            <p class="text-xs leading-snug text-on-surface-variant line-clamp-2 mt-auto">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <button @click="selectedType = null"
        class="flex items-center gap-2 text-primary font-label-lg mb-stack-md hover:opacity-80 transition-opacity bg-success-soft px-4 py-2 rounded-full border-2 border-[#B7D9BC]">
        <span class="material-symbols-outlined text-xl">arrow_back</span>
        Kembali
      </button>

      <section class="mb-stack-lg">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 border-white shadow-sm" :style="{ background: selectedType.bg }">{{ selectedType.emoji }}</div>
          <div>
            <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight">{{ selectedType.title }}</h2>
            <p class="font-body-md text-body-md text-on-surface-variant">{{ sortedItems.length }} aktivitas</p>
          </div>
        </div>

        <!-- Sync banner inside type -->
        <div v-if="auth.isAuthenticated"
          class="bg-white rounded-xl p-3 border-2 border-[#B7D9BC] flex items-center gap-2 mt-2">
          <span class="material-symbols-outlined text-primary text-sm">sync</span>
          <p class="text-xs text-on-surface-variant flex-1">
            {{ (act.serverCount - act.localCount) > 0 ? `${act.serverCount - act.localCount} aktivitas baru di server` : 'Semua sudah terunduh' }}
          </p>
          <button @click="doDownload" :disabled="act.downloading"
            class="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
            :style="{ background: (act.serverCount - act.localCount) > 0 ? '#176c33' : '#999' }">
            {{ act.downloading ? '...' : ((act.serverCount - act.localCount) > 0 ? `+${act.serverCount - act.localCount} Baru` : 'Sync') }}
          </button>
        </div>
      </section>

      <StorySection v-if="selectedType.feature === 'story'" :stories="sortedItems" :color="selectedType.color" @open-story="openStory" />
      <RoleplaySection v-else-if="selectedType.feature === 'roleplay'" :roles="sortedItems" :color="selectedType.color" @open-roleplay="openRoleplay" />
      <GameSection v-else-if="selectedType.feature === 'game'" :games="sortedItems" :color="selectedType.color" />
      <MonologSection v-else-if="selectedType.feature === 'monolog'" :scripts="sortedItems" :color="selectedType.color" />
      <ProjectSection v-else-if="selectedType.feature === 'project'" :projects="sortedItems" :color="selectedType.color" @open-project="openProject" />
      <MusicSection v-else-if="selectedType.feature === 'music'" :songs="sortedItems" :color="selectedType.color" />
      <PuzzleSection v-else-if="selectedType.feature === 'puzzle'" :puzzles="sortedItems" :color="selectedType.color" :bg="selectedType.bg" @open-puzzle="openPuzzle" />
      <MindfulnessSection v-else-if="selectedType.feature === 'mindfulness'" :exercises="sortedItems" :color="selectedType.color" />
      <OutdoorSection v-else-if="selectedType.feature === 'outdoor'" :activities="sortedItems" :color="selectedType.color" />
      <IlmuPengetahuanSection v-else-if="selectedType.feature === 'ilmu_pengetahuan'" :items="sortedItems" :color="selectedType.color" />
      <WorksheetPage v-else-if="selectedType.feature === 'worksheet'" />
    </div>

    <StoryReader v-if="activeStory" :story="activeStory" :color="selectedType.color" :bg="selectedType.bg" @close="activeStory = null" />
    <RoleplayReader v-if="activeRoleplay" :roleplay="activeRoleplay" :color="selectedType.color" :bg="selectedType.bg" @close="activeRoleplay = null" />
    <ProjectReader v-if="activeProject" :project="activeProject" :color="selectedType.color" :bg="selectedType.bg" @close="activeProject = null" />
    <PuzzleReader v-if="activePuzzle" :puzzle="activePuzzle" :color="selectedType.color" :bg="selectedType.bg" @close="activePuzzle = null" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { aktivitasData, setAktivitasData, buildAktivitasDataFromAPI } from '../data/activities.js'
import { useActivityStore } from '../stores/activityStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { useAppStore } from '../stores/appStore.js'
import StorySection from './aktivitas/StorySection.vue'
import RoleplaySection from './aktivitas/RoleplaySection.vue'
import GameSection from './aktivitas/GameSection.vue'
import MonologSection from './aktivitas/MonologSection.vue'
import ProjectSection from './aktivitas/ProjectSection.vue'
import MusicSection from './aktivitas/MusicSection.vue'
import PuzzleSection from './aktivitas/PuzzleSection.vue'
import MindfulnessSection from './aktivitas/MindfulnessSection.vue'
import OutdoorSection from './aktivitas/OutdoorSection.vue'
import IlmuPengetahuanSection from './aktivitas/IlmuPengetahuanSection.vue'
import WorksheetPage from './WorksheetPage.vue'
import StoryReader from './StoryReader.vue'
import RoleplayReader from './RoleplayReader.vue'
import ProjectReader from './ProjectReader.vue'
import PuzzleReader from './PuzzleReader.vue'

const app = useAppStore()
const auth = useAuthStore()
const act = useActivityStore()

onMounted(async () => {
  await act.loadFromCache()
})

watch(() => app.activeTab, (tab) => {
  if (tab === 'activity') {
    act.checkServer()
  }
}, { immediate: true })

async function doDownload() {
  await act.downloadActivities()
  if (act.activitiesCache) {
    const aktivitas = buildAktivitasDataFromAPI(act.activitiesCache)
    setAktivitasData(aktivitas)
  }
}

const selectedType = ref(null)
const activeStory = ref(null)
const activeRoleplay = ref(null)
const activeProject = ref(null)
const activePuzzle = ref(null)

watch(() => app.switchCounter, () => {
  if (app.activeTab === 'activity') {
    selectedType.value = null
    activeStory.value = null
    activeRoleplay.value = null
    activeProject.value = null
    activePuzzle.value = null
  }
})

const contentKeyMap = {
  story: 'stories', roleplay: 'roles', game: 'games',
  monolog: 'scripts', project: 'projects', music: 'songs',
  puzzle: 'puzzles', mindfulness: 'exercises', outdoor: 'activities',
  ilmu_pengetahuan: 'experiments', worksheet: 'worksheets'
}

function getItems(type) {
  return type[contentKeyMap[type.feature]] || []
}

function getItemCount(type) {
  return getItems(type).length
}

const sortedItems = computed(() => {
  if (!selectedType.value) return []
  const items = getItems(selectedType.value)
  return [...items].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
})

function openType(item) {
  selectedType.value = item
  history.pushState({ action: 'activity-type' }, '')
  window.scrollTo(0, 0)
}

function openStory(story) {
  activeStory.value = story
  history.pushState({ action: 'reader' }, '')
}

function openRoleplay(rp) {
  activeRoleplay.value = rp
  history.pushState({ action: 'reader' }, '')
}

function openProject(proj) {
  activeProject.value = proj
  history.pushState({ action: 'reader' }, '')
}

function openPuzzle(pz) {
  activePuzzle.value = pz
  history.pushState({ action: 'reader' }, '')
}

function goBack() {
  if (activeStory.value) { activeStory.value = null; return true }
  if (activeRoleplay.value) { activeRoleplay.value = null; return true }
  if (activeProject.value) { activeProject.value = null; return true }
  if (activePuzzle.value) { activePuzzle.value = null; return true }
  if (selectedType.value) { selectedType.value = null; return true }
  return false
}

defineExpose({ goBack })
</script>
