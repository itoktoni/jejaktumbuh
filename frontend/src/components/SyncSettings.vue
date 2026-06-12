<template>
  <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-[#B7D9BC] shadow-lg">
    <!-- Header with toggle -->
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0"
        :class="autoSync ? 'bg-success-soft' : 'bg-warm-bonding/20'">
        <span class="material-symbols-outlined text-lg"
          :class="autoSync ? 'text-primary' : 'text-warm-bonding'"
          :style="fillIcon">{{ autoSync ? 'sync' : 'sync_disabled' }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-label-lg text-text-main">Sinkronisasi Otomatis</p>
        <p class="text-xs text-on-surface-variant mt-0.5">
          {{ autoSync ? 'Data langsung tersimpan ke server' : 'Tekan tombol untuk sync manual' }}
        </p>
      </div>
      <button @click="toggleSync" :disabled="syncing"
        class="relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 mt-0.5"
        :class="autoSync ? 'bg-primary' : 'bg-gray-300'">
        <span class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200"
          :class="autoSync ? 'translate-x-5' : 'translate-x-0'"></span>
      </button>
    </div>

    <!-- Manual sync button -->
    <div v-if="!autoSync" class="mt-4">
      <button @click="doManualSync" :disabled="syncing"
        class="w-full py-3 rounded-2xl text-sm font-bold btn-pop-green flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-lg" :class="syncing ? 'animate-spin' : ''">sync</span>
        {{ syncing ? 'Menyinkronkan...' : 'Sinkronisasi Sekarang' }}
      </button>
      <p v-if="lastSync" class="text-[10px] text-on-surface-variant text-center mt-2">
        Terakhir sync: {{ lastSync }}
      </p>
    </div>

    <!-- Status -->
    <p v-if="syncMessage" class="text-xs mt-3 px-3 py-2 rounded-xl"
      :class="syncError ? 'text-error bg-error-container' : 'text-primary bg-success-soft'">
      {{ syncMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getSetting, saveSetting, getAnakList } from '../db.js'
import { useAuthStore } from '../stores/authStore.js'
import * as api from '../services/api.js'

const auth = useAuthStore()

const autoSync = ref(true)
const syncing = ref(false)
const lastSync = ref('')
const syncMessage = ref('')
const syncError = ref(false)
const fillIcon = { fontVariationSettings: "'FILL' 1" }

onMounted(async () => {
  const saved = await getSetting('autoSync')
  if (saved !== undefined && saved !== null) autoSync.value = saved
  const ts = await getSetting('lastSyncAt')
  if (ts) lastSync.value = ts
})

async function toggleSync() {
  autoSync.value = !autoSync.value
  await saveSetting('autoSync', autoSync.value)
  syncMessage.value = autoSync.value ? 'Auto sync diaktifkan' : 'Auto sync dinonaktifkan — gunakan tombol manual'
  syncError.value = false
  setTimeout(() => { syncMessage.value = '' }, 3000)
}

async function doManualSync() {
  if (!auth.isAuthenticated) {
    syncMessage.value = 'Login terlebih dahulu untuk sync'
    syncError.value = true
    return
  }

  syncing.value = true
  syncMessage.value = ''

  try {
    const localList = await getAnakList()
    if (localList.length) {
      await api.syncToServer(localList)
    }

    const serverList = await api.getAnakList()
    if (serverList.length) {
      const { syncServerData } = await import('../db.js')
      await syncServerData(serverList)
    }

    const now = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    lastSync.value = now
    await saveSetting('lastSyncAt', now)

    syncMessage.value = 'Sinkronisasi berhasil!'
    syncError.value = false
  } catch (e) {
    syncMessage.value = 'Sync gagal: ' + (e.message || 'Unknown error')
    syncError.value = true
  }

  syncing.value = false
  setTimeout(() => { syncMessage.value = '' }, 5000)
}

defineExpose({ autoSync, doManualSync })
</script>
