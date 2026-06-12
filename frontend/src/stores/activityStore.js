import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.js'
import { getSetting, saveSetting } from '../db.js'

export const useActivityStore = defineStore('activity', () => {
  const activitiesCache = ref(null)
  const serverCount = ref(0)
  const downloading = ref(false)
  const downloadMessage = ref('')

  const localCount = computed(() => {
    if (!activitiesCache.value) return 0
    return Object.values(activitiesCache.value).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
  })

  const newCount = computed(() => Math.max(0, serverCount.value - localCount.value))

  async function loadFromCache() {
    const cached = await getSetting('activities_cache')
    if (cached) {
      activitiesCache.value = cached
    }
  }

  async function checkServer() {
    try {
      const data = await api.getActivitiesGrouped()
      if (data && typeof data === 'object') {
        serverCount.value = Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
      }
    } catch (e) {
      console.warn('[ActivityStore] checkServer failed:', e.message)
    }
  }

  async function downloadActivities() {
    downloading.value = true
    downloadMessage.value = ''
    try {
      const data = await api.getActivitiesGrouped()
      if (!data) {
        downloadMessage.value = 'Gagal terhubung ke server'
        downloading.value = false
        return
      }
      serverCount.value = Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
      await saveSetting('activities_cache', data)
      activitiesCache.value = data
      downloadMessage.value = `${serverCount.value} aktivitas berhasil diunduh`
    } catch (e) {
      downloadMessage.value = 'Error: ' + e.message
    }
    downloading.value = false
  }

  return {
    activitiesCache, serverCount, downloading, downloadMessage,
    localCount, newCount,
    loadFromCache, checkServer, downloadActivities,
  }
})
