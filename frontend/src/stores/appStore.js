import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { appConfig } from '../config/appConfig.js'

export const useAppStore = defineStore('app', () => {
  const savedTab = localStorage.getItem('lk_active_tab')
  const activeTab = ref(savedTab && savedTab !== 'null' ? savedTab : appConfig.defaultTab)
  const selectedPilar = ref(null)
  const selectedAnakId = ref(null)
  const userName = ref('Parent')
  const userGender = ref('')
  const toolsAnakId = ref(null)
  const appReady = ref(false)

  const pageTitle = computed(() => {
    const titles = {
      pilar: `Selamat Datang`,
      progress: 'Statistik',
      activity: 'Aktivitas',
      profile: 'Profile',
      settings: 'Pengaturan',
      billing: 'Billing',
      referral: 'Affiliate',
      challenge: 'Challenge',
      jadwal: 'Jadwal Harian',
      checklist: 'Checklist Harian'
    }
    return titles[activeTab.value] || `Welcome to ${appConfig.name}`
  })

  const switchCounter = ref(0)

  watch(activeTab, (val) => {
    localStorage.setItem('lk_active_tab', val)
  })

  function switchTab(tabId) {
    if (activeTab.value !== tabId) history.pushState({ action: 'tab', from: activeTab.value }, '')
    activeTab.value = tabId
    selectedPilar.value = null
    switchCounter.value++
    window.scrollTo(0, 0)
  }

  function openPilarSub(key) {
    selectedPilar.value = key
    history.pushState({ action: 'pilar' }, '')
    window.scrollTo(0, 0)
  }

  function closePilarSub() {
    selectedPilar.value = null
  }

  return {
    activeTab, selectedPilar, selectedAnakId, userName, userGender, toolsAnakId,
    appReady, pageTitle, switchCounter,
    switchTab, openPilarSub, closePilarSub
  }
})
