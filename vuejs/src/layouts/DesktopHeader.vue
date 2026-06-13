<template>
  <header
    class="hidden lg:flex fixed top-0 right-0 z-40 h-[72px] bg-canvas-cream items-center justify-between px-6 border-b-4 border-[#B7D9BC] shadow-md"
    style="left: 280px;">
    <h1 class="text-headline-md text-text-main">{{ title }}</h1>

    <div class="flex items-center gap-2">
      <button v-if="canInstall" @click="$emit('install')"
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200">
        <span class="material-symbols-outlined text-xl">download</span>
      </button>
      <button @click="$emit('sync')"
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200">
        <span class="material-symbols-outlined text-xl">cloud_sync</span>
      </button>
      <button @click="showNotifPanel = !showNotifPanel"
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200 relative">
        <span class="material-symbols-outlined text-xl">notifications</span>
        <span v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-on-error text-[9px] font-bold flex items-center justify-center">
          {{ unreadCount }}
        </span>
      </button>

      <!-- User Avatar with Dropdown -->
      <div class="relative">
        <button @click="showProfileMenu = !showProfileMenu"
          class="w-9 h-9 flex items-center justify-center rounded-full bg-success-soft border-2 border-[#B7D9BC] shadow-sm text-base hover:opacity-80 transition-opacity duration-200">
          {{ userEmoji }}
        </button>

        <Teleport to="body">
          <div v-if="showProfileMenu" class="fixed inset-0 z-[180]" @click="showProfileMenu = false">
            <div class="absolute inset-0"></div>
            <div class="absolute top-[76px] right-6 w-56 bg-white rounded-2xl shadow-2xl border-2 border-[#B7D9BC] overflow-hidden py-1">
              <div class="px-4 py-3 border-b border-[#B7D9BC]/50">
                <p class="text-sm font-bold text-text-main truncate">{{ userName }}</p>
                <p class="text-[11px] text-on-surface-variant truncate">{{ userEmail }}</p>
              </div>
              <button @click.stop="$emit('profile'); showProfileMenu = false"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-success-soft/30 transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">person</span>
                <span class="text-sm text-text-main">Profile</span>
              </button>
              <button @click.stop="$emit('settings'); showProfileMenu = false"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-success-visual/30 transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">settings</span>
                <span class="text-sm text-text-main">Pengaturan</span>
              </button>
              <button @click.stop="$emit('billing'); showProfileMenu = false"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-success-soft/30 transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">workspace_premium</span>
                <span class="text-sm text-text-main">Billing</span>
              </button>
              <button @click.stop="$emit('referral'); showProfileMenu = false"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-success-soft/30 transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">group_add</span>
                <span class="text-sm text-text-main">Affiliate</span>
              </button>
              <div class="border-t border-[#B7D9BC]/50 my-1"></div>
              <button @click.stop="$emit('logout'); showProfileMenu = false"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-error/5 transition-colors text-error">
                <span class="material-symbols-outlined text-lg">logout</span>
                <span class="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </Teleport>
      </div>
    </div>

    <!-- Notification Panel -->
    <Teleport to="body">
      <div v-if="showNotifPanel" class="fixed inset-0 z-[180]" @click.self="showNotifPanel = false">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="absolute top-[76px] right-6 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border-2 border-[#B7D9BC] overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b-2 border-[#B7D9BC]">
            <h3 class="font-label-lg text-text-main">Notifikasi</h3>
            <button @click="showNotifPanel = false"
              class="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-gray-100">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div v-if="notifications.length === 0" class="p-6 text-center">
              <span class="material-symbols-outlined text-3xl text-on-surface-variant/40">notifications_off</span>
              <p class="text-sm text-on-surface-variant mt-2">Tidak ada notifikasi</p>
            </div>
            <button v-for="n in notifications" :key="n.id"
              class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-success-soft/30 transition-colors border-b border-[#B7D9BC]/30"
              :class="{ 'bg-primary-container/20': !n.read }" @click="markRead(n)">
              <span class="material-symbols-outlined text-xl mt-0.5" :class="n.iconColor || 'text-primary'">{{ n.icon || 'info' }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-text-main">{{ n.title }}</p>
                <p class="text-xs text-on-surface-variant mt-0.5">{{ n.body }}</p>
                <p class="text-[10px] text-on-surface-variant/50 mt-1">{{ n.time }}</p>
              </div>
              <span v-if="!n.read" class="w-2 h-2 mt-2 rounded-full bg-primary shrink-0"></span>
            </button>
          </div>
          <div v-if="notifications.length > 0" class="flex border-t-2 border-[#B7D9BC]">
            <button @click="markAllRead"
              class="flex-1 py-2.5 text-xs font-bold text-primary hover:bg-gray-50 border-r border-[#B7D9BC]">
              Tandai Dibaca
            </button>
            <button @click="clearAll"
              class="flex-1 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-gray-50">
              Hapus Semua
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '../composables/useNotifications.js'

const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, clearAll } = useNotifications()

const props = defineProps({
  title: { type: String, default: '' },
  canInstall: { type: Boolean, default: false },
  userName: { type: String, default: 'User' },
  userEmail: { type: String, default: '' },
  userGender: { type: String, default: '' }
})

defineEmits(['sync', 'install', 'profile', 'settings', 'billing', 'referral', 'logout'])

const showNotifPanel = ref(false)
const showProfileMenu = ref(false)

onMounted(() => { fetchNotifications() })

const userEmoji = computed(() => props.userGender === 'Perempuan' ? '👩' : '👨')
</script>
