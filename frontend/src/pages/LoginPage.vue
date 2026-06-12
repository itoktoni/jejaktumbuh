<template>
  <div class="min-h-screen bg-canvas-cream flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">👣</span>
        </div>
        <h1 class="text-2xl font-bold text-text-main">Langkah Kecil</h1>
        <p class="text-sm text-on-surface-variant mt-1">Pendamping Tumbuh Kembang Anak</p>
      </div>

      <!-- Login/Register Toggle -->
      <div class="flex bg-white rounded-xl p-1 mb-6 border-2 border-[#B7D9BC]">
        <button
          @click="mode = 'login'; auth.error = ''; auth.validationErrors = null"
          :class="mode === 'login' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
          class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
        >
          Masuk
        </button>
        <button
          @click="mode = 'register'; auth.error = ''; auth.validationErrors = null"
          :class="mode === 'register' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
          class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
        >
          Daftar
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="auth.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        <p>{{ auth.error }}</p>
        <ul v-if="auth.validationErrors" class="mt-1 ml-4 list-disc">
          <li v-for="(msgs, field) in auth.validationErrors" :key="field">
            {{ msgs[0] }}
          </li>
        </ul>
      </div>

      <!-- Login Form -->
      <div v-if="mode === 'login'" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="email@contoh.com"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
            @keyup.enter="handleLogin"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full px-4 py-3 pr-12 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
              @keyup.enter="handleLogin"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          @click="handleLogin"
          :disabled="auth.loading"
          class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 mt-2"
        >
          <span v-if="auth.loading" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Memproses...
          </span>
          <span v-else>Masuk</span>
        </button>
      </div>

      <!-- Register Form -->
      <div v-else class="space-y-3">
        <div v-if="refCode" class="p-2.5 bg-success-soft rounded-xl border-2 border-[#B7D9BC] text-center">
          <p class="text-xs text-on-surface-variant">Kode Referral</p>
          <p class="text-sm font-bold text-primary">{{ refCode }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            v-model="name"
            type="text"
            placeholder="Nama Orang Tua / Wali"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="email@contoh.com"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
          <input
            v-model="phone"
            type="tel"
            placeholder="08xxxxxxxxxx"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimal 6 karakter"
              class="w-full px-4 py-3 pr-12 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
          <div class="relative">
            <input
              v-model="passwordConfirmation"
              :type="showPasswordConfirmation ? 'text' : 'password'"
              placeholder="Ulangi password"
              class="w-full px-4 py-3 pr-12 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
              @keyup.enter="handleRegister"
            />
            <button
              type="button"
              @click="showPasswordConfirmation = !showPasswordConfirmation"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <Icon :icon="showPasswordConfirmation ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          @click="handleRegister"
          :disabled="auth.loading"
          class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 mt-2"
        >
          <span v-if="auth.loading" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Memproses...
          </span>
          <span v-else>Daftar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '../stores/authStore.js'

const emit = defineEmits(['success'])

const auth = useAuthStore()

const mode = ref('login')
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const refCode = ref('')

onMounted(() => {
  refCode.value = localStorage.getItem('lk_ref_code') || ''
  const authMode = localStorage.getItem('lk_auth_mode')
  if (authMode === 'register') {
    mode.value = 'register'
    localStorage.removeItem('lk_auth_mode')
  }
})

async function handleLogin() {
  if (!email.value || !password.value) {
    auth.error = 'Email dan password wajib diisi'
    return
  }

  try {
    await auth.login(email.value, password.value)
    localStorage.removeItem('lk_ref_code')
    localStorage.removeItem('lk_auth_mode')
    emit('success')
  } catch (err) {
    // Error already set in store
  }
}

async function handleRegister() {
  if (!name.value || !email.value || !phone.value || !password.value) {
    auth.error = 'Semua field wajib diisi'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    auth.error = 'Password tidak cocok'
    return
  }

  if (password.value.length < 6) {
    auth.error = 'Password minimal 6 karakter'
    return
  }

  try {
    await auth.register(name.value, email.value, phone.value, password.value, passwordConfirmation.value, refCode.value || null)
    localStorage.removeItem('lk_ref_code')
    emit('success')
  } catch (err) {
    // Error already set in store
  }
}
</script>
