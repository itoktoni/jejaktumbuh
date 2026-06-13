import { ref, computed } from 'vue'
import * as api from '../services/api.js'

const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const loading = ref(false)

export function useNotifications() {
  async function fetchNotifications() {
    if (!api.isAuthenticated()) return
    loading.value = true
    try {
      const data = await api.getNotifications()
      notifications.value = data.notifications || []
    } catch (e) {
      console.warn('Failed to fetch notifications:', e)
    }
    loading.value = false
  }

  async function markRead(n) {
    n.read = true
    try {
      await api.markNotificationRead(n.id)
    } catch (e) {
      console.warn('Failed to mark read:', e)
    }
  }

  async function markAllRead() {
    notifications.value.forEach(n => { n.read = true })
    try {
      await api.markAllNotificationsRead()
    } catch (e) {
      console.warn('Failed to mark all read:', e)
    }
  }

  async function clearAll() {
    notifications.value = []
    try {
      await api.clearAllNotifications()
    } catch (e) {
      console.warn('Failed to clear:', e)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markAllRead,
    clearAll,
  }
}
