import { ref, onMounted } from 'vue'

const deferredPrompt = ref(null)
const canInstall = ref(false)

export function useInstall() {
  onMounted(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      canInstall.value = true
    })

    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null
      canInstall.value = false
    })
  })

  async function install() {
    if (!deferredPrompt.value) return
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      canInstall.value = false
    }
    deferredPrompt.value = null
  }

  return { canInstall, install }
}
