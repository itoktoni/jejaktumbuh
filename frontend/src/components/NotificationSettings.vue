<template>
  <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-[#B7D9BC] shadow-lg">
    <!-- Header with toggle -->
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0"
        :class="isSubscribed ? 'bg-success-soft' : 'bg-warm-bonding/20'">
        <span class="material-symbols-outlined text-lg"
          :class="isSubscribed ? 'text-primary' : 'text-warm-bonding'"
          :style="fillIcon">{{ isSubscribed ? 'notifications_active' : 'notifications_off' }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-label-lg text-text-main">Notifikasi Push</p>
        <p class="text-xs text-on-surface-variant mt-0.5">
          {{ statusText }}
        </p>
      </div>
      <button @click="handleToggle" :disabled="loading"
        class="relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 mt-0.5"
        :class="isSubscribed ? 'bg-primary' : 'bg-gray-300'">
        <span class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200"
          :class="isSubscribed ? 'translate-x-5' : 'translate-x-0'"></span>
      </button>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-xs text-error font-medium mt-3 px-3 py-2 bg-error-container rounded-xl">{{ error }}</p>

    <!-- Status info -->
    <div v-if="!isSupported" class="mt-3 bg-warm-bonding/10 rounded-xl p-3 border-2 border-warm-bonding/20">
      <p class="text-xs text-warm-bonding font-medium">Browser tidak mendukung push notification.</p>
    </div>

    <div v-else-if="permission === 'denied'" class="mt-3 bg-error-container rounded-xl p-3 border-2 border-error/20">
      <p class="text-xs text-error font-medium">Izin notifikasi diblokir. Aktifkan di pengaturan browser.</p>
    </div>

    <div v-else-if="isSubscribed" class="mt-3 bg-success-soft rounded-xl p-3 border-2 border-primary/20">
      <p class="text-xs text-primary font-medium">Anda akan menerima pengingat jadwal, challenge, dan update penting.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePushNotification } from '../composables/usePushNotification.js'
import { useAuthStore } from '../stores/authStore.js'

const auth = useAuthStore()
const { isSubscribed, isSupported, permission, loading, toggle } = usePushNotification()

const error = ref('')
const fillIcon = { fontVariationSettings: "'FILL' 1" }

const statusText = computed(() => {
  if (!isSupported.value) return 'Tidak didukung browser ini'
  if (permission.value === 'denied') return 'Izin diblokir'
  if (isSubscribed.value) return 'Aktif — menerima notifikasi'
  return 'Nonaktif — klik toggle untuk mengaktifkan'
})

async function handleToggle() {
  error.value = ''
  try {
    await toggle()
  } catch (e) {
    error.value = e.message || 'Gagal mengubah pengaturan notifikasi'
  }
}
</script>
