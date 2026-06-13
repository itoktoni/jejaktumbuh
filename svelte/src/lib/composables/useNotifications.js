import { writable, derived } from 'svelte/store'
import * as api from '../services/api.js'

export const notifications = writable([])
export const loading = writable(false)

export const unreadCount = derived(notifications, ($n) => $n.filter(n => !n.read).length)

export async function fetchNotifications() {
  if (!api.isAuthenticated()) return
  loading.set(true)
  try {
    const data = await api.getNotifications()
    notifications.set(data.notifications || [])
  } catch (e) {
    console.warn('Failed to fetch notifications:', e)
  }
  loading.set(false)
}

export async function markRead(n) {
  n.read = true
  notifications.update(list => list)
  try { await api.markNotificationRead(n.id) } catch (e) { console.warn('Failed to mark read:', e) }
}

export async function markAllRead() {
  notifications.update(list => list.map(n => ({ ...n, read: true })))
  try { await api.markAllNotificationsRead() } catch (e) { console.warn('Failed to mark all read:', e) }
}

export async function clearAll() {
  notifications.set([])
  try { await api.clearAllNotifications() } catch (e) { console.warn('Failed to clear:', e) }
}
