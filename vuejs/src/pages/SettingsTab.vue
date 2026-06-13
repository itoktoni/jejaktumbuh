<template>
  <div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
    <div class="space-y-6">

      <!-- Sync Settings -->
      <SyncSettings />

      <!-- Download Activities -->
      <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-[#B7D9BC] shadow-lg">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#B7D9BC] shadow-sm shrink-0">
            <span class="material-symbols-outlined text-lg text-primary">download</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-label-lg text-text-main">Download Aktivitas</p>
            <p class="text-xs text-on-surface-variant mt-0.5">
              {{ act.localCount > 0 ? `${act.localCount} aktivitas tersimpan di perangkat` : 'Belum ada aktivitas diunduh' }}
            </p>
          </div>
        </div>

        <button @click="doDownload" :disabled="act.downloading || !auth.isAuthenticated"
          class="w-full mt-4 py-3 rounded-2xl text-sm font-bold btn-pop-green flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-lg" :class="act.downloading ? 'animate-spin' : ''">cloud_download</span>
          {{ act.downloading ? 'Mengunduh...' : 'Download dari Server' }}
        </button>

        <p v-if="!auth.isAuthenticated" class="text-xs text-warm-bonding mt-2 text-center">Login untuk mengunduh aktivitas dari server</p>
        <p v-if="act.downloadMessage" class="text-xs text-primary mt-2 text-center font-medium">{{ act.downloadMessage }}</p>
      </div>

      <!-- App Info -->
      <div class="text-center py-4">
        <p class="text-sm font-bold text-primary">{{ appConfig.name }}</p>
        <p class="text-xs text-on-surface-variant">{{ appConfig.tagline }}</p>
        <p class="text-xs text-on-surface-variant/60 mt-1">v1.0.0</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { appConfig } from '../config/appConfig.js'
import { useActivityStore } from '../stores/activityStore.js'
import { buildAktivitasDataFromAPI, setAktivitasData } from '../data/activities.js'
import SyncSettings from '../components/SyncSettings.vue'

const app = useAppStore()
const auth = useAuthStore()
const act = useActivityStore()

onMounted(() => { act.loadFromCache() })

async function doDownload() {
  await act.downloadActivities()
  if (act.activitiesCache) {
    const aktivitas = buildAktivitasDataFromAPI(act.activitiesCache)
    setAktivitasData(aktivitas)
  }
}

defineEmits(['go-profile'])
</script>
