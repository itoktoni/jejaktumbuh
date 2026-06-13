import { ref, computed } from 'vue'
import * as api from '../services/api.js'
import { getSetting, saveSetting } from '../db.js'

const activitiesCache = ref(null)
const typesCache = ref(null)
const lastFetch = ref(0)
const downloading = ref(false)
const downloadMessage = ref('')
const serverCount = ref(0)

export function useActivities() {
  const localCount = computed(() => {
    if (!activitiesCache.value) return 0
    return Object.values(activitiesCache.value).reduce((sum, arr) => sum + arr.length, 0)
  })

  const newCount = computed(() => Math.max(0, serverCount.value - localCount.value))

  async function loadFromCache() {
    const cached = await getSetting('activities_cache')
    const cachedTime = await getSetting('activities_cache_time') || 0
    if (cached) {
      activitiesCache.value = cached
      lastFetch.value = cachedTime
    }
    const types = await getSetting('activity_types')
    if (types) typesCache.value = types
  }

  async function checkServer() {
    console.log('[Activities] checkServer called, current serverCount:', serverCount.value)
    if (serverCount.value > 0) return
    try {
      const data = await api.getActivitiesGrouped()
      console.log('[Activities] API response type:', typeof data, 'keys:', data ? Object.keys(data) : 'null')
      if (data && typeof data === 'object') {
        const counts = {}
        for (const [key, arr] of Object.entries(data)) {
          counts[key] = Array.isArray(arr) ? arr.length : 0
        }
        serverCount.value = Object.values(counts).reduce((a, b) => a + b, 0)
        console.log('[Activities] Per type:', counts, 'Total server:', serverCount.value, 'Local:', localCount.value)
      } else {
        console.warn('[Activities] API returned non-object:', data)
      }
    } catch (e) {
      console.error('[Activities] checkServer ERROR:', e.message, e)
    }
  }

  async function fetchActivities() {
    try {
      const data = await api.getActivitiesGrouped()
      return data
    } catch (e) {
      console.warn('Failed to fetch activities:', e)
      return null
    }
  }

  async function downloadActivities() {
    downloading.value = true
    downloadMessage.value = ''

    try {
      const serverData = await fetchActivities()
      if (!serverData) {
        downloadMessage.value = 'Gagal terhubung ke server'
        downloading.value = false
        return { newCount: 0, total: localCount.value }
      }

      const total = Object.values(serverData).reduce((sum, arr) => sum + arr.length, 0)
      serverCount.value = total

      await saveSetting('activities_cache', serverData)
      await saveSetting('activities_cache_time', Date.now())
      activitiesCache.value = serverData
      lastFetch.value = Date.now()

      try {
        const types = await api.getActivityTypes()
        typesCache.value = types
        await saveSetting('activity_types', types)
      } catch (e) { /* ignore */ }

      downloadMessage.value = `${total} aktivitas berhasil diunduh`
      downloading.value = false
      return { newCount: newCount.value, total }
    } catch (e) {
      downloadMessage.value = 'Error: ' + e.message
      downloading.value = false
      return { newCount: 0, total: localCount.value }
    }
  }

  async function fetchTypes() {
    if (typesCache.value) return typesCache.value
    try {
      const data = await api.getActivityTypes()
      typesCache.value = data
      await saveSetting('activity_types', data)
      return data
    } catch (e) {
      const cached = await getSetting('activity_types')
      if (cached) {
        typesCache.value = cached
        return cached
      }
      return {}
    }
  }

  return {
    activitiesCache,
    typesCache,
    localCount,
    serverCount,
    newCount,
    downloading,
    downloadMessage,
    fetchActivities,
    fetchTypes,
    downloadActivities,
    loadFromCache,
    checkServer,
  }
}
