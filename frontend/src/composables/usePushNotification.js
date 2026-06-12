import { ref, computed, onMounted } from 'vue'
import * as api from '../services/api.js'

const isSubscribed = ref(false)
const isSupported = ref(false)
const permission = ref('default')
const loading = ref(false)
const debugLog = ref([])

function log(msg) {
  console.log('[Push]', msg)
  debugLog.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
}

export function usePushNotification() {
  onMounted(async () => {
    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
    log(`Supported: ${isSupported.value}`)
    if (isSupported.value) {
      permission.value = Notification.permission
      log(`Permission: ${permission.value}`)
      await checkSubscription()
    }
  })

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      isSubscribed.value = sub !== null
      log(`SW ready, local subscription: ${sub ? 'exists' : 'none'}`)

      if (sub && api.isAuthenticated()) {
        try {
          const status = await api.getPushStatus()
          log(`Server status: ${JSON.stringify(status)}`)
        } catch (e) {
          log(`Server status check failed: ${e.message}`)
        }
      }
    } catch (e) {
      log(`Check failed: ${e.message}`)
      isSubscribed.value = false
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function subscribe() {
    if (!isSupported.value) throw new Error('Push notifications not supported')

    loading.value = true
    try {
      const perm = await Notification.requestPermission()
      permission.value = perm
      log(`Permission result: ${perm}`)
      if (perm !== 'granted') throw new Error('Izin notifikasi ditolak')

      const reg = await navigator.serviceWorker.ready
      log('Getting VAPID key...')

      const vapidKey = await api.getVapidKey()
      log(`VAPID key: ${vapidKey ? 'received' : 'MISSING'}`)
      if (!vapidKey) throw new Error('VAPID key tidak tersedia dari server')

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      log('Browser push subscribed')

      const subJson = subscription.toJSON()
      log(`Endpoint: ${subJson.endpoint.substring(0, 60)}...`)

      if (api.isAuthenticated()) {
        await api.subscribePush(subJson)
        log('Saved to server')
      } else {
        log('Not logged in — subscription is local only')
      }

      isSubscribed.value = true
      return true
    } catch (err) {
      log(`ERROR: ${err.message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe() {
    loading.value = true
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()

      if (subscription) {
        if (api.isAuthenticated()) {
          try {
            await api.unsubscribePush(subscription.endpoint)
            log('Removed from server')
          } catch (e) {
            log(`Server remove failed: ${e.message}`)
          }
        }
        await subscription.unsubscribe()
        log('Browser unsubscribed')
      }

      isSubscribed.value = false
      return true
    } catch (err) {
      log(`Unsubscribe error: ${err.message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggle() {
    if (isSubscribed.value) {
      return unsubscribe()
    }
    return subscribe()
  }

  return {
    isSubscribed: computed(() => isSubscribed.value),
    isSupported: computed(() => isSupported.value),
    permission: computed(() => permission.value),
    loading: computed(() => loading.value),
    debugLog: computed(() => debugLog.value),
    subscribe,
    unsubscribe,
    toggle,
    checkSubscription,
  }
}
