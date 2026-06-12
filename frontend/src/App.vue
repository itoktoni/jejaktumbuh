<template>
  <ReferralPage v-if="isReferral" />
  <LoginPage v-else-if="!auth.isAuthenticated" @success="onLoginSuccess" />
  <div v-else class="bg-canvas-cream text-text-main min-h-screen">
    <AppSidebar :active-tab="app.activeTab" :user-name="app.userName" :user-gender="app.userGender" :can-install="canInstall" @switch="app.switchTab" @install="installApp" />
    <DesktopHeader :title="app.pageTitle" :can-install="canInstall" :user-name="app.userName" :user-email="userEmail" :user-gender="app.userGender" @sync="showSyncModal = true" @install="installApp" @profile="app.switchTab('profile')" @settings="app.switchTab('settings')" @billing="app.switchTab('billing')" @referral="app.switchTab('referral')" @logout="handleLogout" />
    <AppHeader :title="app.pageTitle" :active-tab="app.activeTab" :user-name="app.userName" :user-gender="app.userGender" :user-email="userEmail" :can-install="canInstall" @switch="app.switchTab" @sync="showSyncModal = true" @install="installApp" @profile="app.switchTab('profile')" @settings="app.switchTab('settings')" @billing="app.switchTab('billing')" @referral="app.switchTab('referral')" @logout="handleLogout" />

    <main class="content-wrapper pb-24 lg:pb-8">
      <PilarTab ref="pilarTabRef" v-show="app.activeTab === 'pilar'" :anak-list="anak.anakList" :selected-pilar="app.selectedPilar" :selected-anak-id="app.selectedAnakId" @select-pilar="app.openPilarSub" @close-pilar="app.closePilarSub" @update:anak-id="app.selectedAnakId = $event" @go-profile="app.switchTab('profile')" />
      <ProgressTab v-show="app.activeTab === 'progress'" :anak-list="anak.anakList" :selected-anak-id="app.selectedAnakId" @reset-skill="anak.resetSkill" @delete-skill="anak.deleteSkill" @open-skill="openSkillFromProgress" />
      <ActivityTab ref="activityTabRef" v-show="app.activeTab === 'activity'" />
      <ProfileTab v-show="app.activeTab === 'profile'" :anak-list="anak.anakList" @select="handleProfileMenu" @logout="handleLogout" @sync="showSyncModal = true" />
      <SettingsTab v-show="app.activeTab === 'settings'" @go-profile="app.switchTab('profile')" />
      <BillingTab v-show="app.activeTab === 'billing'" :anak-list="anak.anakList" />
      <ReferralTab v-show="app.activeTab === 'referral'" />

      <div v-show="app.activeTab === 'challenge'" class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
        <AnakSelector v-if="anak.anakList.length" :anak-list="anak.anakList" v-model="tools.toolsAnakId" class="mb-stack-lg" />
        <ChallengePage :challenges="tools.toolsData.challenges" :challenge-history="tools.toolsData.challengeHistory" @add-challenge="tools.addChallenge" @add-point="tools.addPoint" @remove-point="tools.removePoint" @edit-challenge="tools.editChallenge" @delete-challenge="tools.deleteChallenge" />
      </div>

      <div v-show="app.activeTab === 'jadwal'" class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
        <AnakSelector v-if="anak.anakList.length" :anak-list="anak.anakList" v-model="tools.toolsAnakId" class="mb-stack-lg" />
        <JadwalPage :schedules="tools.toolsData.schedules" @add-schedule="tools.addSchedule" @remove-schedule="tools.removeSchedule" />
      </div>

      <div v-show="app.activeTab === 'checklist'" class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
        <AnakSelector v-if="anak.anakList.length" :anak-list="anak.anakList" v-model="tools.toolsAnakId" class="mb-stack-lg" />
        <ChecklistPage :checklists="tools.toolsData.checklists" @add-checklist="tools.addChecklist" @remove-checklist="tools.removeChecklist" @add-item="tools.addChecklistItem" @remove-item="tools.removeChecklistItem" />
      </div>
    </main>

    <BottomNav :active-tab="app.activeTab" @switch="app.switchTab" />

    <!-- Sync Modal -->
    <SyncModal :show="showSyncModal" @close="showSyncModal = false" @synced="onSynced" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useInstall } from './composables/useInstall.js'
import { getSetting, saveSetting, syncServerData } from './db.js'
import { useAppStore } from './stores/appStore.js'
import { useAnakStore } from './stores/anakStore.js'
import { useToolsStore } from './stores/toolsStore.js'
import { useAuthStore } from './stores/authStore.js'
import AppHeader from './layouts/AppHeader.vue'
import DesktopHeader from './layouts/DesktopHeader.vue'
import AppSidebar from './layouts/AppSidebar.vue'
import BottomNav from './layouts/BottomNav.vue'
import PilarTab from './pages/PilarTab.vue'
import ProgressTab from './pages/ProgressTab.vue'
import ActivityTab from './pages/ActivityTab.vue'
import ProfileTab from './pages/ProfileTab.vue'
import SettingsTab from './pages/SettingsTab.vue'
import BillingTab from './pages/BillingTab.vue'
import ReferralTab from './pages/ReferralTab.vue'
import ChallengePage from './pages/ChallengePage.vue'
import JadwalPage from './pages/JadwalPage.vue'
import ChecklistPage from './pages/ChecklistPage.vue'
import ReferralPage from './pages/ReferralPage.vue'
import LoginPage from './pages/LoginPage.vue'
import AnakSelector from './components/AnakSelector.vue'
import SyncModal from './components/SyncModal.vue'

import * as api from './services/api.js'
import { useActivityStore } from './stores/activityStore.js'
import { buildAktivitasDataFromAPI, setAktivitasData } from './data/activities.js'

const isReferral = computed(() => new URLSearchParams(window.location.search).has('ref'))

const urlParams = new URLSearchParams(window.location.search)
if (urlParams.has('ref')) {
  localStorage.setItem('lk_ref_code', urlParams.get('ref'))
}

const app = useAppStore()
const anak = useAnakStore()
const tools = useToolsStore()
const auth = useAuthStore()
const activityStore = useActivityStore()

const pilarTabRef = ref(null)
const activityTabRef = ref(null)
const { canInstall, install: installApp } = useInstall()

const showSyncModal = ref(false)
const userEmail = computed(() => auth.user?.email || '')

async function onLoginSuccess() {
  app.switchTab('pilar')

  if (auth.serverAnakList.length) {
    await syncServerData(auth.serverAnakList)
  }

  await seedAndLoad()
}

function handleLogout() {
  clearLocalData()
  auth.logout()
}

function clearLocalData() {
  anak.anakList = []
  tools.anakToolsData = {}
  tools.toolsAnakId = null
  app.selectedAnakId = null
  app.appReady = false
}

async function onSynced() {
  await seedAndLoad()
}

async function seedAndLoad() {
  if (!auth.user) return

  await anak.validateAndClearIfDifferentUser(auth.user.id)

  if (auth.user.name) {
    app.userName = auth.user.name
  }

  await anak.loadAnakList()
  await tools.loadToolsData(anak.anakList)

  await activityStore.loadFromCache()
  if (activityStore.activitiesCache) {
    const aktivitas = buildAktivitasDataFromAPI(activityStore.activitiesCache)
    setAktivitasData(aktivitas)
  }

  if (!app.selectedAnakId && anak.anakList.length) {
    app.selectedAnakId = anak.anakList[0].id
  }
  app.appReady = true
}

function handleProfileMenu(menuId) {
  console.log('Profile menu clicked:', menuId)
}

function goToAnakProgress(anakItem) {
  if (app.activeTab !== 'progress') history.pushState({ action: 'tab', from: app.activeTab }, '')
  app.selectedAnakId = anakItem.id
  app.activeTab = 'progress'
  window.scrollTo(0, 0)
}

function openSkillFromProgress({ anakId, skillKey, pilarKey }) {
  app.selectedAnakId = anakId
  app.selectedPilar = pilarKey
  if (app.activeTab !== 'pilar') history.pushState({ action: 'tab', from: app.activeTab }, '')
  app.activeTab = 'pilar'
  window.scrollTo(0, 0)
}

function handleBack() {
  if (pilarTabRef.value?.goBack()) return
  if (activityTabRef.value?.goBack()) return
  if (app.selectedPilar) { app.selectedPilar = null; return }
  if (app.activeTab !== 'pilar') { app.activeTab = 'pilar'; window.scrollTo(0, 0); return }
}

onMounted(async () => {
  history.replaceState({ action: 'root' }, '')
  window.addEventListener('popstate', handleBack)

  if (auth.isAuthenticated) {
    try {
      const me = await api.getMe()
      auth.applyServerData(me)
      await seedAndLoad()
    } catch (e) {
      auth.logout()
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('popstate', handleBack)
})
</script>
