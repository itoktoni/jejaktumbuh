<template>
  <div v-if="inline" class="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm" @click.stop>
      <div class="text-center mb-6">
        <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-3">
          <span class="text-3xl">🔐</span>
        </div>
        <h2 class="text-lg font-bold text-text-main">Verifikasi Akun</h2>
        <p class="text-sm text-on-surface-variant mt-1">
          Verifikasi melalui {{ gatewayLabel }}
        </p>
        <p v-if="maskedContact" class="text-xs text-on-surface-variant mt-1 font-medium">
          {{ maskedContact }}
        </p>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3 text-sm text-red-600">
        {{ error }}
      </div>

      <div v-if="sendMessage" class="bg-primary-container text-black rounded-xl px-4 py-3 mb-3 text-sm">
        {{ sendMessage }}
      </div>

      <div v-if="!codeSent">
        <button
          type="button"
          class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
          @click="handleSendCode"
          :disabled="sending"
        >
          <span v-if="sending" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Mengirim kode...
          </span>
          <span v-else>Kirim Kode Verifikasi</span>
        </button>
      </div>

      <form v-else @submit.prevent="handleVerify" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Masukkan Kode</label>
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="000000"
            :value="code"
            @input="handleCodeInput"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white text-center text-xl tracking-[0.5em] font-mono font-bold"
          />
          <p class="text-xs text-on-surface-variant mt-1 text-center">
            <template v-if="timerSeconds > 0">Kode berlaku <span class="font-bold text-primary">{{ timerDisplay }}</span></template>
            <template v-else>Kode telah kedaluwarsa</template>
          </p>
        </div>

        <button
          type="submit"
          class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
          :disabled="loading || code.length !== 6 || timerSeconds <= 0"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Memverifikasi...
          </span>
          <span v-else>Verifikasi</span>
        </button>

        <button
          type="button"
          class="w-full py-2 text-sm text-primary font-semibold hover:underline disabled:opacity-50"
          @click="handleSendCode"
          :disabled="sending || timerSeconds > 0"
        >
          <span v-if="sending">Mengirim ulang...</span>
          <span v-else>Kirim ulang kode</span>
        </button>
      </form>

      <div class="mt-4 text-center">
        <button
          type="button"
          class="text-xs text-on-surface-variant hover:underline"
          @click="handleLogout"
        >
          Kembali ke login
        </button>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-canvas-cream flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">🔐</span>
        </div>
        <h1 class="text-2xl font-bold text-text-main">Verifikasi Akun</h1>
        <p class="text-sm text-on-surface-variant mt-1">
          Verifikasi akun Anda melalui {{ gatewayLabel }}
        </p>
        <p v-if="maskedContact" class="text-xs text-on-surface-variant mt-1 font-medium">
          {{ maskedContact }}
        </p>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
        {{ error }}
      </div>

      <div v-if="sendMessage" class="bg-primary-container text-black rounded-xl px-4 py-3 mb-4 text-sm">
        {{ sendMessage }}
      </div>

      <div v-if="!codeSent">
        <button
          type="button"
          class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
          @click="handleSendCode"
          :disabled="sending"
        >
          <span v-if="sending" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Mengirim kode...
          </span>
          <span v-else>Kirim Kode Verifikasi</span>
        </button>
      </div>

      <form v-else @submit.prevent="handleVerify" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Masukkan Kode</label>
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="000000"
            :value="code"
            @input="handleCodeInput"
            class="w-full px-4 py-4 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white text-center text-2xl tracking-[0.5em] font-mono font-bold"
          />
          <p class="text-xs text-on-surface-variant mt-2 text-center">
            <template v-if="timerSeconds > 0">Kode berlaku <span class="font-bold text-primary">{{ timerDisplay }}</span></template>
            <template v-else>Kode telah kedaluwarsa</template>
          </p>
        </div>

        <button
          type="submit"
          class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
          :disabled="loading || code.length !== 6 || timerSeconds <= 0"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Memverifikasi...
          </span>
          <span v-else>Verifikasi</span>
        </button>

        <button
          type="button"
          class="w-full py-2 text-sm text-primary font-semibold hover:underline disabled:opacity-50"
          @click="handleSendCode"
          :disabled="sending || timerSeconds > 0"
        >
          <span v-if="sending">Mengirim ulang...</span>
          <span v-else>Kirim ulang kode</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          type="button"
          class="text-sm text-on-surface-variant hover:underline"
          @click="handleLogout"
        >
          Kembali ke login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import * as api from '../services/api.js'

const props = defineProps({
  inline: { type: Boolean, default: false }
})

const emit = defineEmits(['success'])

const auth = useAuthStore()

const code = ref('')
const loading = ref(false)
const error = ref('')
const sending = ref(false)
const sendMessage = ref('')
const codeSent = ref(false)
const timerSeconds = ref(0)
let timerInterval = null

const timerDisplay = computed(() => {
  const m = Math.floor(timerSeconds.value / 60)
  const s = timerSeconds.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

function startTimer() {
  timerSeconds.value = 600
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    timerSeconds.value--
    if (timerSeconds.value <= 0) {
      clearInterval(timerInterval)
      timerInterval = null
      timerSeconds.value = 0
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = null
  timerSeconds.value = 0
}

onUnmounted(() => {
  stopTimer()
})

const gatewayLabel = computed(() => {
  if (auth.verificationGateway === 'whatsapp') return 'WhatsApp'
  if (auth.verificationGateway === 'telegram') return 'Telegram'
  return 'Email'
})

const maskedContact = computed(() => {
  const user = auth.user
  if (!user) return ''
  if (auth.verificationGateway === 'email') {
    const parts = (user.email || '').split('@')
    if (parts.length !== 2) return user.email
    return parts[0].slice(0, 2) + '***@' + parts[1]
  }
  const phone = user.phone || ''
  if (phone.length > 4) {
    return phone.slice(0, 3) + '***' + phone.slice(-3)
  }
  return phone
})

async function handleSendCode() {
  sending.value = true
  sendMessage.value = ''
  error.value = ''
  try {
    await api.sendVerification(auth.verificationGateway)
    codeSent.value = true
    sendMessage.value = 'Kode verifikasi telah dikirim!'
    startTimer()
  } catch (err) {
    if (err.message?.includes('Tunggu')) {
      codeSent.value = true
      error.value = err.message
      const match = err.message.match(/(\d+)/)
      if (match) {
        timerSeconds.value = parseInt(match[1])
        if (timerInterval) clearInterval(timerInterval)
        timerInterval = setInterval(() => {
          timerSeconds.value--
          if (timerSeconds.value <= 0) {
            clearInterval(timerInterval)
            timerInterval = null
            timerSeconds.value = 0
          }
        }, 1000)
      }
    } else {
      error.value = err.message || 'Gagal mengirim kode'
    }
  } finally {
    sending.value = false
  }
}

async function handleVerify() {
  if (code.value.length !== 6) return
  loading.value = true
  error.value = ''
  try {
    const data = await api.verifyCode(code.value)
    auth.needsVerification = false
    auth.applyServerData(data)
    emit('success', data)
  } catch (err) {
    error.value = err.message || 'Kode tidak valid'
  } finally {
    loading.value = false
  }
}

function handleCodeInput(e) {
  code.value = e.target.value.replace(/\D/g, '').slice(0, 6)
}

function handleLogout() {
  auth.logout()
}
</script>
