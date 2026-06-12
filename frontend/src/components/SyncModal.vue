<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
      <div class="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <button @click="$emit('close')" class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
          <span class="material-symbols-outlined">close</span>
        </button>

        <div class="text-center mb-6">
          <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-3">
            <span class="material-symbols-outlined text-3xl text-primary">{{ isAuthenticated ? 'cloud_sync' : 'login' }}</span>
          </div>
          <h3 class="text-lg font-bold text-gray-900">{{ isAuthenticated ? appConfig.syncTitle : appConfig.loginText }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ isAuthenticated ? appConfig.syncDescription : appConfig.loginDescription }}</p>
        </div>

        <!-- Login Form -->
        <div v-if="!isAuthenticated">
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {{ error }}
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="email"
                type="email"
                placeholder="email@contoh.com"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                @keyup.enter="handleLogin"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>

          <button
            @click="handleLogin"
            :disabled="loading"
            class="w-full mt-4 py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Memproses...
            </span>
            <span v-else>Masuk</span>
          </button>
        </div>

        <!-- Sync Controls -->
        <div v-else>
          <div v-if="syncStatus" class="mb-4 p-3 rounded-xl text-sm" :class="syncStatusType === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : syncStatusType === 'error' ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-blue-50 border border-blue-200 text-blue-600'">
            {{ syncStatus }}
          </div>

          <div class="space-y-3">
            <button
              @click="handleSyncUp"
              :disabled="loading"
              class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined">cloud_upload</span>
              <span v-if="syncing === 'up'">Menyinkronkan...</span>
              <span v-else>Backup ke Cloud</span>
            </button>

            <button
              @click="handleSyncDown"
              :disabled="loading"
              class="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined">cloud_download</span>
              <span v-if="syncing === 'down'">Menyinkronkan...</span>
              <span v-else>Restore dari Cloud</span>
            </button>

            <button
              @click="handleLogout"
              class="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as api from '../services/api.js'
import { syncServerData } from '../db.js'
import { useAnakStore } from '../stores/anakStore.js'
import { useToolsStore } from '../stores/toolsStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { appConfig } from '../config/appConfig.js'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'synced'])

const anak = useAnakStore()
const tools = useToolsStore()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const syncStatus = ref('')
const syncStatusType = ref('info')
const syncing = ref(null)

const isAuthenticated = computed(() => api.isAuthenticated())

onMounted(() => {
  api.getAuthToken()
})

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await auth.login(email.value, password.value)
    email.value = ''
    password.value = ''
    syncStatus.value = ''
  } catch (err) {
    error.value = err.message || 'Login gagal'
  } finally {
    loading.value = false
  }
}

async function handleSyncUp() {
  loading.value = true
  syncing.value = 'up'
  syncStatus.value = 'Mengirim data ke server...'
  syncStatusType.value = 'info'

  try {
    const anakList = anak.anakList.map(a => {
      const toolsData = tools.anakToolsData[a.id] || {}

      return {
        nama: a.nama,
        gender: a.gender,
        umur: a.umur,
        tanggal_lahir: a.tanggal || a.tanggal_lahir,
        bulan_lahir: a.bulan || a.bulan_lahir,
        tahun_lahir: a.tahun || a.tahun_lahir,
        emoji: a.emoji,
        skills: a.skills || [],
        history: a.history || [],
        completed_skills: a.completed_skills || a.completedSkills || [],
        settings: a.settings || [],
        challenges: (toolsData.challenges || []).map(c => ({
          category: c.category || '',
          title: c.title || '',
          emoji: c.emoji || null,
          points: c.points || 0,
          status: c.status || 'pending',
          date: c.date || null,
          meta: c.meta || null,
        })),
        challengeHistory: (toolsData.challengeHistory || []).map(h => ({
          category: h.category || '',
          title: h.title || '',
          date: h.date || null,
          meta: h.meta || null,
        })),
        checklists: (toolsData.checklists || []).map(cl => ({
          title: cl.title || '',
          items: cl.items || [],
          date: cl.date || null,
        })),
        schedules: (toolsData.schedules || []).map(s => ({
          label: s.label || '',
          time: s.time || null,
          done: s.done || false,
          date: s.date || null,
        })),
        worksheets: (toolsData.worksheets || []).map(w => ({
          type: w.type || '',
          data: w.data || [],
          date: w.date || null,
        })),
      }
    })

    const result = await api.syncToServer(anakList)

    syncStatus.value = 'Data berhasil di-backup ke cloud!'
    syncStatusType.value = 'success'
  } catch (err) {
    syncStatus.value = 'Gagal backup: ' + err.message
    syncStatusType.value = 'error'
  } finally {
    loading.value = false
    syncing.value = null
  }
}

async function handleSyncDown() {
  loading.value = true
  syncing.value = 'down'
  syncStatus.value = 'Mengambil data dari server...'
  syncStatusType.value = 'info'

  try {
    const serverData = await api.fetchFromServer()

    if (!serverData || serverData.length === 0) {
      syncStatus.value = 'Tidak ada data di server.'
      syncStatusType.value = 'info'
      loading.value = false
      syncing.value = null
      return
    }

    await syncServerData(serverData)

    await anak.loadAnakList()
    await tools.loadToolsData(anak.anakList)

    syncStatus.value = 'Data berhasil di-restore dari cloud!'
    syncStatusType.value = 'success'
    emit('synced')
  } catch (err) {
    syncStatus.value = 'Gagal restore: ' + err.message
    syncStatusType.value = 'error'
  } finally {
    loading.value = false
    syncing.value = null
  }
}

function handleLogout() {
  api.logout()
  syncStatus.value = ''
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
