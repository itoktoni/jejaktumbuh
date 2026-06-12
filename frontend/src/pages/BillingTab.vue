<template>
  <div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">

    <!-- Status Card (Trial + Current Plan) -->
    <div v-if="auth.userPlan" class="mb-4 bg-canvas-cream rounded-[24px] p-4 border-4 border-[#B7D9BC] shadow-md">
      <div v-if="isTrial">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0"
            :class="trialExpired ? 'bg-error/10' : 'bg-success-soft'">
            <span class="material-symbols-outlined" :class="trialExpired ? 'text-error' : 'text-primary'">
              {{ trialExpired ? 'timer_off' : 'timer' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-label-lg text-text-main">{{ trialExpired ? 'Trial Berakhir' : 'Masa Trial' }}</p>
            <p class="text-sm text-on-surface-variant">
              <template v-if="trialExpired">Masa trial {{ auth.trialDays }} hari telah berakhir.</template>
              <template v-else>Sisa <span class="font-bold text-primary">{{ trialRemaining }} hari</span> dari {{ auth.trialDays }} hari</template>
            </p>
          </div>
        </div>
        <div v-if="!trialExpired" class="mt-3">
          <div class="w-full h-1.5 bg-[#B7D9BC]/50 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all" :style="{ width: trialProgress + '%' }"></div>
          </div>
        </div>
        <div class="border-t-2 border-[#B7D9BC]/40 my-3"></div>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-success-soft flex items-center justify-center border-2 border-white shadow-sm shrink-0">
          <span class="material-symbols-outlined text-primary">workspace_premium</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-label-lg text-text-main truncate">{{ auth.userPlan.plan_nama }}</p>
          <p class="text-sm text-on-surface-variant">Aktif hingga {{ formatDate(auth.userPlan.subscribe_end_at) }}</p>
        </div>
        <span class="text-xs text-primary font-bold bg-success-soft px-2 py-1 rounded-lg shrink-0">Aktif</span>
      </div>
    </div>

    <!-- Pending Payment Banner -->
    <div v-if="activePayment" class="mb-4 bg-canvas-cream rounded-[24px] p-4 border-4 border-blue-300 shadow-md">
      <div class="flex items-center gap-3">
        <button @click.stop="cancelActivePayment"
          class="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center text-error hover:bg-error/20 transition-colors shrink-0">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
        <div class="flex-1 min-w-0 cursor-pointer" @click="showQrModal = true">
          <p class="font-label-lg text-text-main">Menunggu Pembayaran</p>
          <p class="text-sm text-on-surface-variant truncate">{{ activePayment.order_code }} &middot; Rp{{ activePayment.total.toLocaleString('id-ID') }}</p>
        </div>
        <span class="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 shrink-0">Nanti Saja</span>
      </div>
    </div>

    <!-- Plans -->
    <div class="space-y-3">
      <div v-for="(plan, idx) in auth.plans" :key="plan.id"
        class="bento-card group relative rounded-[24px] overflow-hidden transition-all border-4"
        :style="{
          background: selectedPlan?.id === plan.id ? planTheme(plan).bg : '#FFFBF5',
          borderColor: selectedPlan?.id === plan.id ? planTheme(plan).color : '#B7D9BC',
          boxShadow: selectedPlan?.id === plan.id ? `0 6px 24px ${planTheme(plan).color}30` : `0 2px 12px ${planTheme(plan).color}10`,
          opacity: isDowngrade(plan) ? 0.5 : 1,
          cursor: isDowngrade(plan) ? 'not-allowed' : 'pointer'
        }"
        @click="selectPlan(plan)">
        <div class="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.07]" :style="{ background: planTheme(plan).color }"></div>

        <!-- Plan Header -->
        <div class="p-4 sm:p-5">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border-2 border-white shadow-sm"
              :style="{ background: selectedPlan?.id === plan.id ? 'white' : planTheme(plan).bg, color: planTheme(plan).color }">
              <span class="material-symbols-outlined text-xl sm:text-2xl">{{ planIcon(plan) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-bold text-sm sm:text-base text-text-main">{{ plan.name }}</h3>
                <span v-if="isRecommended(plan)" class="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded text-white" :style="{ background: planTheme(plan).color }">Rekomendasi</span>
                <span v-if="isCurrentPlan(plan)" class="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded" :style="{ background: 'white', color: planTheme(plan).color }">Saat Ini</span>
              </div>
              <p class="text-xs sm:text-sm text-on-surface-variant mt-0.5 line-clamp-2">{{ plan.description }}</p>
              <div class="flex items-center gap-2 sm:gap-3 mt-2">
                <p class="font-bold text-sm sm:text-base text-text-main">
                  {{ plan.price === 0 ? 'Gratis' : `Rp${plan.price.toLocaleString('id-ID')}` }}
                </p>
                <span class="text-[10px] sm:text-xs text-on-surface-variant">{{ plan.value }} Anak &middot; {{ plan.period_label }}</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-lg sm:text-xl shrink-0 transition-transform mt-1"
              :style="{ color: planTheme(plan).color, opacity: 0.5 }"
              :class="{ 'rotate-180': selectedPlan?.id === plan.id }">expand_more</span>
          </div>
        </div>

        <!-- Expanded Section -->
        <div v-if="selectedPlan?.id === plan.id" class="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 fade-in-up">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl border-2 border-dashed mb-3"
            :style="{ borderColor: planTheme(plan).color + '40', background: 'white' }">
            <span class="text-xs sm:text-sm text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-sm sm:text-base" :style="{ color: planTheme(plan).color }">check_circle</span>
              {{ plan.description }}
            </span>
            <span class="text-xs sm:text-sm text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-sm sm:text-base" :style="{ color: planTheme(plan).color }">check_circle</span>
              {{ plan.period_label }}
            </span>
          </div>

          <button v-if="!isDowngrade(plan) && !(plan.price === 0 && isCurrentPlan(plan))"
            @click.stop="startPayment(plan)"
            class="w-full py-2.5 sm:py-3 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all"
            :style="{ background: planTheme(plan).color }">
            {{ isCurrentPlan(plan) ? 'Perpanjang' : 'Pilih Paket Ini' }}
          </button>
          <div v-else-if="plan.price === 0 && isCurrentPlan(plan)"
            class="py-2.5 text-center text-xs sm:text-sm font-bold text-on-surface-variant/40 bg-surface-container rounded-xl">Paket aktif saat ini</div>
          <div v-else
            class="py-2.5 text-center text-xs sm:text-sm font-bold text-on-surface-variant/40 bg-surface-container rounded-xl">Tidak tersedia</div>
        </div>
      </div>
    </div>

    <!-- Payment History -->
    <div v-if="payments.length" class="mt-6">
      <h3 class="font-bold text-sm sm:text-base text-text-main mb-3">Riwayat Pembayaran</h3>
      <div class="space-y-2">
        <div v-for="p in payments" :key="p.id"
          class="bg-canvas-cream rounded-xl p-3 border-2 border-[#B7D9BC] flex items-center gap-3">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0"
            :class="p.status === 'paid' ? 'bg-success-soft' : p.status === 'pending' ? 'bg-amber-50' : 'bg-error/10'">
            <span class="material-symbols-outlined text-sm sm:text-base"
              :class="p.status === 'paid' ? 'text-primary' : p.status === 'pending' ? 'text-amber-500' : 'text-error'">
              {{ p.status === 'paid' ? 'check_circle' : p.status === 'pending' ? 'hourglass_top' : 'cancel' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm font-bold text-text-main truncate">{{ p.plan_name }}</p>
            <p class="text-[10px] sm:text-xs text-on-surface-variant truncate">{{ p.order_code }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-xs sm:text-sm font-bold text-text-main">Rp{{ p.total.toLocaleString('id-ID') }}</p>
            <p class="text-[9px] sm:text-[10px] font-bold"
              :class="p.status === 'paid' ? 'text-primary' : p.status === 'pending' ? 'text-amber-500' : 'text-error'">
              {{ p.status === 'paid' ? 'Lunas' : p.status === 'pending' ? 'Pending' : 'Kedaluwarsa' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <div v-if="showCheckout && checkoutPlan" class="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" @mousedown.self="showCheckout = false">
      <div class="bg-canvas-cream rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 border-4 border-primary shadow-xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <div class="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-4 sm:hidden"></div>
        <h3 class="font-bold text-lg text-text-main mb-1">Checkout</h3>
        <p class="text-sm text-on-surface-variant mb-4">{{ checkoutPlan.name }} &middot; {{ checkoutPlan.period_label }}</p>

        <div class="bg-white rounded-xl p-4 border-2 border-[#B7D9BC] mb-3">
          <p class="text-xs text-on-surface-variant mb-1">Harga</p>
          <p class="font-bold text-lg text-text-main">Rp{{ checkoutPlan.price.toLocaleString('id-ID') }}</p>
        </div>

        <div class="mb-3">
          <label class="text-xs text-on-surface-variant font-bold mb-1 block">Kode Diskon</label>
          <div class="flex gap-2">
            <input v-model="discountCode"
              class="flex-1 min-w-0 px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white font-bold uppercase"
              placeholder="Masukkan kode (opsional)" />
            <button v-if="discountCode" @click="applyDiscount" :disabled="discountLoading"
              class="px-4 py-3 rounded-xl text-sm font-bold text-white btn-pop-green shrink-0 disabled:opacity-50">
              {{ discountLoading ? '...' : 'Pakai' }}
            </button>
          </div>
           <p v-if="discountError" class="text-xs text-error font-medium mt-1">{{ discountError }}</p>
        </div>

        <div v-if="appliedDiscount" class="rounded-xl p-4 border-2 mb-3"
          :style="{ background: checkoutPlan && planTheme(checkoutPlan).bg, borderColor: checkoutPlan && planTheme(checkoutPlan).color + '60' }">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-lg" :style="{ color: checkoutPlan && planTheme(checkoutPlan).color }">sell</span>
            <span class="text-sm font-bold" :style="{ color: checkoutPlan && planTheme(checkoutPlan).color }">
              {{ appliedDiscount.name || 'Diskon' }}{{ appliedDiscount.rate ? ` (${appliedDiscount.rate}%)` : '' }}
            </span>
          </div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-on-surface-variant">Harga asli</span>
            <span class="text-xs text-on-surface-variant line-through">Rp{{ checkoutPlan?.price.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold" :style="{ color: checkoutPlan && planTheme(checkoutPlan).color }">Diskon</span>
            <span class="text-xs font-bold" :style="{ color: checkoutPlan && planTheme(checkoutPlan).color }">-Rp{{ appliedDiscount.amount.toLocaleString('id-ID') }}</span>
          </div>
          <div class="border-t pt-2 flex items-center justify-between" :style="{ borderColor: checkoutPlan && planTheme(checkoutPlan).color + '30' }">
            <span class="text-sm font-bold text-text-main">Total Bayar</span>
            <span class="font-bold text-xl" :style="{ color: checkoutPlan && planTheme(checkoutPlan).color }">Rp{{ checkoutTotal.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="showCheckout = false"
            class="flex-1 py-3 rounded-2xl text-sm font-bold text-on-surface-variant btn-pop-gray">Batal</button>
          <button @click="confirmPayment" :disabled="checkoutLoading"
            class="flex-1 py-3 rounded-2xl text-sm font-bold text-white btn-pop-green disabled:opacity-50">
            {{ checkoutLoading ? 'Memproses...' : 'Bayar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- QR Payment Modal -->
    <div v-if="showQrModal && activePayment" class="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" @mousedown.self="closeQrModal">
      <div class="bg-canvas-cream rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 border-4 border-[#B7D9BC] shadow-xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <div class="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-4 sm:hidden"></div>
        <div class="text-center">
          <h3 class="font-bold text-lg text-text-main mb-1">{{ activePayment.plan_name }}</h3>
          <p v-if="activePayment.discount > 0" class="text-xs text-on-surface-variant mb-1">
            Harga: <span class="line-through">Rp{{ activePayment.amount.toLocaleString('id-ID') }}</span>
            &middot; Diskon: <span class="font-bold text-blue-600">-Rp{{ activePayment.discount.toLocaleString('id-ID') }}</span>
          </p>
          <p class="text-2xl font-bold text-blue-600 mb-4">Rp{{ activePayment.total.toLocaleString('id-ID') }}</p>

          <div v-if="activePayment.status === 'pending'" class="mb-4">
            <div class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] inline-block">
              <canvas ref="qrCanvas"></canvas>
            </div>
            <p class="text-xs text-on-surface-variant mt-3">Scan QRIS di atas menggunakan aplikasi bank/e-wallet</p>
            <div v-if="paymentChecking" class="flex items-center justify-center gap-2 mt-3 text-sm text-primary">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Menunggu pembayaran...
            </div>
            <p class="text-xs text-on-surface-variant mt-2">Kedaluwarsa: {{ formatTime(activePayment.expired_at) }}</p>
          </div>

          <div v-else-if="activePayment.status === 'paid'" class="mb-4">
            <div class="w-16 h-16 rounded-full bg-success-soft flex items-center justify-center mx-auto mb-3">
              <span class="material-symbols-outlined text-3xl text-primary">check_circle</span>
            </div>
            <p class="font-bold text-primary text-lg">Pembayaran Berhasil!</p>
            <p class="text-sm text-on-surface-variant mt-1">Paket telah diaktifkan</p>
          </div>

          <div v-else class="mb-4">
            <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-3">
              <span class="material-symbols-outlined text-3xl text-error">cancel</span>
            </div>
            <p class="font-bold text-error text-lg">{{ activePayment.status === 'expired' ? 'Kedaluwarsa' : 'Dibatalkan' }}</p>
          </div>

          <button @click="closeQrModal"
            class="w-full py-3 rounded-2xl text-sm font-bold text-on-surface-variant btn-pop-gray">
            {{ activePayment.status === 'paid' ? 'Tutup' : 'Nanti Saja' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import QRCode from 'qrcode'
import { useAppStore } from '../stores/appStore.js'
import { useAuthStore } from '../stores/authStore.js'
import * as api from '../services/api.js'

const app = useAppStore()
const auth = useAuthStore()

const selectedPlan = ref(null)
const payments = ref([])
const activePayment = ref(null)
const showQrModal = ref(false)
const qrCanvas = ref(null)
const paymentChecking = ref(false)
let pollTimer = null

const showCheckout = ref(false)
const checkoutPlan = ref(null)
const checkoutLoading = ref(false)
const discountCode = ref('')
const discountError = ref('')
const appliedDiscount = ref(null)
const discountLoading = ref(false)

const isTrial = computed(() => auth.userRole === 'trial')
const currentPlanId = computed(() => auth.userPlan?.plan_id || null)

const trialExpired = computed(() => {
  if (!isTrial.value) return false
  const t = auth.userPlan?.subscribe_trial_at
  if (!t) return false
  const now = auth.serverDate ? new Date(auth.serverDate) : new Date()
  return Math.floor((now - new Date(t)) / 86400000) > auth.trialDays
})
const trialRemaining = computed(() => {
  if (!isTrial.value) return 0
  const t = auth.userPlan?.subscribe_trial_at
  if (!t) return auth.trialDays
  const now = auth.serverDate ? new Date(auth.serverDate) : new Date()
  return Math.max(0, auth.trialDays - Math.floor((now - new Date(t)) / 86400000))
})
const trialProgress = computed(() => {
  if (!isTrial.value) return 0
  const t = auth.userPlan?.subscribe_trial_at
  if (!t) return 0
  const now = auth.serverDate ? new Date(auth.serverDate) : new Date()
  return Math.min(100, Math.round((Math.floor((now - new Date(t)) / 86400000) / auth.trialDays) * 100))
})

function isCurrentPlan(plan) { return currentPlanId.value === plan.id }
function isDowngrade(plan) {
  if (!currentPlanId.value) return false
  const cur = auth.plans.find(p => p.id === currentPlanId.value)
  return cur ? plan.price < cur.price : false
}

function hexToRgb(hex) {
  if (!hex) return null
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : null
}

function planTheme(plan) {
  const raw = plan.color || '#9CA3AF'
  const isRgb = raw.startsWith('rgb')
  const hex = isRgb ? null : raw
  const rgb = isRgb ? raw.replace(/[^\d,]/g, '') : hexToRgb(raw)
  const color = isRgb ? raw : `rgb(${rgb})`
  const bg = rgb ? `rgba(${rgb}, 0.08)` : '#F3F4F6'
  return { color, bg }
}
function isRecommended(plan) {
  return !!plan.recommended
}
function planIcon(plan) {
  if (plan.price === 0) return 'timer'
  if (plan.value >= 3) return 'family_restroom'
  return 'person'
}

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function selectPlan(plan) {
  if (isDowngrade(plan)) return
  selectedPlan.value = plan
}

const checkoutTotal = computed(() => {
  if (!checkoutPlan.value) return 0
  const price = checkoutPlan.value.price
  if (!appliedDiscount.value) return price
  return price - appliedDiscount.value.amount
})

async function startPayment(plan) {
  if (plan.price === 0) return
  checkoutPlan.value = plan
  discountError.value = ''
  appliedDiscount.value = null
  discountCode.value = ''
  showCheckout.value = true
}

async function applyDiscount() {
  discountError.value = ''
  appliedDiscount.value = null
  const code = discountCode.value.trim().toUpperCase()
  if (!code) return

  discountLoading.value = true
  try {
    const res = await api.validateDiscount(code, checkoutPlan.value.id)
    if (res.valid) {
      appliedDiscount.value = { code: res.code, name: res.name, rate: res.rate, amount: res.amount }
    } else {
      discountError.value = res.message
    }
  } catch (e) {
    discountError.value = e.message || 'Gagal memvalidasi diskon'
  } finally {
    discountLoading.value = false
  }
}

async function confirmPayment() {
  checkoutLoading.value = true
  try {
    stopPolling()
    const res = await api.createPayment(checkoutPlan.value.id, discountCode.value?.trim().toUpperCase() || null)
    activePayment.value = res.payment
    showCheckout.value = false
    showQrModal.value = true
    if (res.payment.status === 'pending') {
      startPolling()
    }
    loadHistory()
  } catch (e) {
    alert(e.message || 'Gagal membuat pembayaran')
  } finally {
    checkoutLoading.value = false
  }
}

async function cancelActivePayment() {
  if (!activePayment.value) return
  try {
    await api.cancelPayment(activePayment.value.id)
    stopPolling()
    activePayment.value = null
    loadHistory()
  } catch (e) {
    console.warn('Cancel error:', e)
    activePayment.value = null
  }
}

function closeQrModal() {
  showQrModal.value = false
  if (activePayment.value?.status !== 'pending') {
    activePayment.value = null
  }
}

function startPolling() {
  stopPolling()
  paymentChecking.value = true
  pollTimer = setInterval(async () => {
    if (!activePayment.value) { stopPolling(); return }
    try {
      const res = await api.getPaymentStatus(activePayment.value.id)
      activePayment.value = res.payment
      if (res.payment.status !== 'pending') {
        stopPolling()
        if (res.payment.status === 'paid') {
          const me = await api.getMe()
          auth.applyServerData(me)
          const paidPlan = auth.plans.find(p => p.id === res.payment.plan_id)
          if (paidPlan) selectedPlan.value = paidPlan
          setTimeout(() => { activePayment.value = null }, 3000)
        }
        loadHistory()
      }
    } catch (e) {
      console.warn('Poll error:', e)
    }
  }, 3000)
}

function stopPolling() {
  paymentChecking.value = false
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

async function renderQr() {
  if (!qrCanvas.value || !activePayment.value?.qris_string) return
  try {
    await QRCode.toCanvas(qrCanvas.value, activePayment.value.qris_string, {
      width: 200,
      margin: 1,
      color: { dark: '#1a1a1a', light: '#ffffff' }
    })
  } catch (e) {
    console.warn('QR render error:', e)
  }
}

watch(showQrModal, async (val) => {
  if (val) {
    await nextTick()
    renderQr()
    if (activePayment.value?.status === 'pending') startPolling()
  } else {
    stopPolling()
  }
})

watch(discountCode, (val) => {
  if (!val.trim()) {
    appliedDiscount.value = null
    discountError.value = ''
  }
})

async function loadHistory() {
  try {
    const res = await api.getPaymentHistory()
    payments.value = res.payments || []
    if (!activePayment.value || activePayment.value.status !== 'pending') {
      const pending = payments.value.find(p => p.status === 'pending')
      if (pending) activePayment.value = pending
    }
  } catch (e) {
    console.warn('Failed to load payments:', e)
  }
}

onMounted(async () => {
  if (auth.plans.length === 0) {
    try {
      const data = await api.getPlans()
      if (data.plans) auth.plans = data.plans
    } catch (e) {
      console.warn('Failed to load plans:', e)
    }
  }
  const rec = auth.plans.find(p => p.recommended)
  if (rec) {
    selectedPlan.value = rec
  } else if (currentPlanId.value) {
    const current = auth.plans.find(p => p.id === currentPlanId.value)
    if (current) selectedPlan.value = current
  }
  await loadHistory()
})

onUnmounted(() => { stopPolling() })
</script>

<style scoped>
.btn-pop-green { background-color: #6DBE7B; box-shadow: 0 4px 0 #176c33; transition: all 0.1s ease; }
.btn-pop-green:active { transform: translateY(4px); box-shadow: 0 0px 0 #176c33; }
.btn-pop-gray { background-color: #E5E7EB; box-shadow: 0 4px 0 #9CA3AF; transition: all 0.1s ease; }
.btn-pop-gray:active { transform: translateY(4px); box-shadow: 0 0px 0 #9CA3AF; }
.fade-in-up { animation: fadeInUp 0.25s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>