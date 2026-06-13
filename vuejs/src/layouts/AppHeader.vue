<template>
  <header
    class="w-full top-0 sticky z-40 bg-canvas-cream flex justify-between items-center px-margin-mobile md:px-margin-desktop py-stack-md lg:hidden rounded-b-[32px] border-b-4 border-[#B7D9BC] shadow-md">
    <div class="flex items-center gap-3">
      <button @click="menuOpen = true"
        class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors duration-200">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <h1 class="font-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-text-main">{{ title }}</h1>
    </div>
    <div class="flex items-center gap-2">
      <button v-if="canInstall" @click="$emit('install')"
        class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200">
        <span class="material-symbols-outlined">download</span>
      </button>
      <button @click="$emit('sync')"
        class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200">
        <span class="material-symbols-outlined">cloud_sync</span>
      </button>
      <button @click="showNotifPanel = !showNotifPanel"
        class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200 relative">
        <span class="material-symbols-outlined">notifications</span>
        <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">{{ unreadCount }}</span>
      </button>

      <!-- User Avatar with Dropdown -->
      <div class="relative">
        <button @click="showUserMenu = !showUserMenu"
          class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-success-soft border-2 border-[#B7D9BC] shadow-sm text-lg hover:opacity-80 transition-opacity duration-200">
          {{ userEmoji }}
        </button>

        <Teleport to="body">
          <div v-if="showUserMenu" class="fixed inset-0 z-[180]" @click="showUserMenu = false">
            <div class="absolute inset-0"></div>
            <div class="absolute top-16 right-4 w-56 bg-white rounded-2xl shadow-2xl border-2 border-[#B7D9BC] overflow-hidden py-1">
              <!-- User info -->
              <div class="px-4 py-3 border-b border-[#B7D9BC]/50">
                <p class="text-sm font-bold text-text-main truncate">{{ userName }}</p>
                <p class="text-[11px] text-on-surface-variant truncate">{{ userEmail }}</p>
              </div>

              <button v-for="item in profileMenuItems" :key="item.id"
                @click.stop="$emit(item.emit); showUserMenu = false"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-success-soft/30 transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">{{ item.icon }}</span>
                <span class="text-sm text-text-main">{{ item.label }}</span>
              </button>

              <div class="border-t border-[#B7D9BC]/50 my-1"></div>

              <button @click.stop="$emit('logout'); showUserMenu = false"
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
        <div class="absolute inset-0 bg-black/30"></div>
        <div class="absolute top-16 right-4 w-[320px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border-2 border-[#B7D9BC] overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b-2 border-[#B7D9BC]">
            <h3 class="font-label-lg text-text-main">Notifikasi</h3>
            <button @click="showNotifPanel = false"
              class="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-gray-100">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="max-h-80 overflow-y-auto">
            <div v-if="notifications.length === 0" class="p-6 text-center">
              <span class="material-symbols-outlined text-3xl text-on-surface-variant/40">notifications_off</span>
              <p class="text-sm text-on-surface-variant mt-2">Tidak ada notifikasi</p>
            </div>
            <button v-for="n in notifications" :key="n.id"
              class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-success-soft/30 transition-colors border-b border-[#B7D9BC]/30"
              :class="{ 'bg-primary-container/20': !n.read }"
              @click="markRead(n)">
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

    <!-- Mobile Sidebar Menu -->
    <Teleport to="body">
      <div v-if="menuOpen" class="fixed inset-0 z-[200]">
        <div class="absolute inset-0 bg-black/40" @click="menuOpen = false"></div>
        <div class="absolute top-0 left-0 h-full w-[75%] max-w-[320px] bg-canvas-cream shadow-2xl flex flex-col border-r-4 border-[#B7D9BC]"
          :style="{ transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }">
          <div class="flex items-center justify-between p-5 border-b-4 border-[#B7D9BC]">
            <h2 class="font-headline-md text-text-main">Menu</h2>
            <button @click="menuOpen = false"
              class="w-8 h-8 rounded-full bg-white border-2 border-[#B7D9BC] flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <button v-for="item in drawerMenus" :key="item.id"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200"
              :class="activeTab === item.id
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-white text-on-surface-variant border-2 border-[#B7D9BC] hover:shadow-md hover:border-primary/30'"
              @click="$emit('switch', item.id); menuOpen = false">
              <span class="material-symbols-outlined text-xl" :style="iconStyle(item.id)">{{ item.icon }}</span>
              <span class="font-label-lg">{{ item.label }}</span>
            </button>
            <button v-if="canInstall"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 bg-white text-on-surface-variant border-2 border-[#B7D9BC] hover:shadow-md hover:border-primary/30"
              @click="$emit('install'); menuOpen = false">
              <span class="material-symbols-outlined text-xl">download</span>
              <span class="font-label-lg">Install App</span>
            </button>
          </nav>
          <div class="p-4 mx-3 mb-4 bg-success-soft rounded-[20px] border-4 border-[#B7D9BC]">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-white border-2 border-[#B7D9BC] flex items-center justify-center text-base">💡</span>
              <div>
                <p class="text-xs font-bold text-primary">Tips Hari Ini</p>
                <p class="text-xs text-on-surface-variant leading-snug mt-0.5">Fokus pada satu hal kecil untuk dampak besar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { appConfig } from '../config/appConfig.js'
import { mobileDrawerNav } from '../data/mobileDrawerNav.js'
import { profileMenu } from '../data/profileMenu.js'
import { useNotifications } from '../composables/useNotifications.js'

const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, clearAll } = useNotifications()

const props = defineProps({
  title: { type: String, default: `${appConfig.name} 👋` },
  activeTab: { type: String, default: '' },
  userName: { type: String, default: 'Bunda' },
  userGender: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  canInstall: { type: Boolean, default: false }
})

defineEmits(['switch', 'sync', 'install', 'profile', 'settings', 'billing', 'referral', 'logout'])

const menuOpen = ref(false)
const showUserMenu = ref(false)
const showNotifPanel = ref(false)

onMounted(() => { fetchNotifications() })

const userEmoji = computed(() => props.userGender === 'Perempuan' ? '👩' : '👨')

const drawerMenus = computed(() => mobileDrawerNav)
const profileMenuItems = computed(() => profileMenu)

function iconStyle(tabId) {
  return { fontVariationSettings: props.activeTab === tabId ? "'FILL' 1" : "'FILL' 0" }
}
</script>
