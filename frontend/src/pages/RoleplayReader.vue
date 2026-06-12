<template>
  <div class="fixed inset-0 z-[100] bg-black/40 flex items-end lg:items-center justify-center p-2 lg:p-4">
    <div class="w-full max-w-md bg-canvas-cream rounded-[40px] shadow-2xl border-8 border-[#B7D9BC] overflow-hidden flex flex-col h-[100dvh] lg:h-[852px] relative">

      <!-- Header -->
      <div class="px-4 pt-4 pb-2 flex justify-between items-center z-10 shrink-0">
        <button @click="$emit('close')"
          class="w-11 h-11 bg-error border-4 border-white text-white rounded-full flex items-center justify-center text-xl shadow-md hover:scale-105 active:scale-95 transition-all">
          ✕
        </button>
        <div class="bg-primary text-on-primary px-5 py-1.5 rounded-full border-4 border-white shadow-md text-base font-semibold truncate max-w-[180px]">
          {{ roleplay.title }}
        </div>
        <div class="w-11 h-11 bg-friendly-sky border-4 border-white text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
          {{ isFinished ? '✓' : `${currentPage.num}/${roleplay.pages.length}` }}
        </div>
      </div>

      <!-- Page Content -->
      <div v-if="!isFinished" class="flex-1 min-h-0 relative select-none"
        @mousedown="onDragStart" @mousemove="onDragMove" @mouseup="onDragEnd" @mouseleave="onDragEnd"
        @touchstart="onDragStart" @touchmove.passive="onDragMove" @touchend="onDragEnd">
        <div class="h-full overflow-y-auto"
          :style="{ transform: `translateX(${dragOffset}px)`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }">
          <div class="flex flex-col">
            <!-- Image -->
            <div class="w-full shrink-0">
              <ImageWrapper :src="currentPage.image" :alt="currentPage.narrator" height="220px" />
            </div>
            <!-- Content -->
            <div class="px-4 py-4 space-y-2">
              <!-- Narrator -->
              <div class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="w-7 h-7 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-xs">📖</span>
                    <span class="font-label-lg text-label-lg text-primary">Narator</span>
                  </div>
                  <button @click="speakNarrator" class="w-8 h-8 rounded-full flex items-center justify-center transition-all border-2"
                    :class="isSpeakingNarrator ? 'bg-error text-on-error border-error' : 'bg-success-soft text-primary border-[#B7D9BC]'">
                    <span class="material-symbols-outlined text-lg">{{ isSpeakingNarrator ? 'stop' : 'volume_up' }}</span>
                  </button>
                </div>
                <p class="font-body-md text-body-md text-on-surface leading-relaxed">{{ currentPage.narrator }}</p>
              </div>
              <!-- Dialogs -->
              <div v-for="(d, i) in currentPage.dialog" :key="i"
                class="flex gap-3"
                :class="isRightRole(d.role) ? 'flex-row-reverse' : ''">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border-2 border-white shadow-sm"
                  :style="{ background: getRoleColor(d.role).bg }">
                  {{ getRoleEmoji(d.role) }}
                </div>
                <div class="max-w-[75%]">
                  <span class="text-xs font-bold mb-1 block"
                    :class="isRightRole(d.role) ? 'text-right' : ''"
                    :style="{ color: getRoleColor(d.role).text }">
                    {{ d.role }}
                  </span>
                  <div class="rounded-2xl px-4 py-3 border-2"
                    :style="{
                      background: getRoleColor(d.role).bg,
                      borderColor: getRoleColor(d.role).border
                    }"
                    :class="isRightRole(d.role) ? 'rounded-tr-sm' : 'rounded-tl-sm'">
                    <p class="text-sm leading-relaxed" :style="{ color: getRoleColor(d.role).text }">{{ d.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Finished Screen -->
      <div v-else class="flex-1 min-h-0 overflow-y-auto">
        <div class="flex flex-col items-center px-5 py-8 max-w-lg mx-auto">
          <div class="w-20 h-20 rounded-full bg-success-soft border-4 border-[#B7D9BC] flex items-center justify-center text-5xl mb-6 shadow-md floating-illustration">🎭</div>
          <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main text-center mb-2">Selesai!</h2>
          <p class="font-body-md text-body-md text-on-surface-variant text-center mb-8">{{ roleplay.title }}</p>
          <!-- Roles -->
          <div class="w-full grid grid-cols-2 gap-3 mb-6">
            <div v-for="role in roleplay.roles" :key="role.name" class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm text-center">
              <div class="text-3xl mb-2">{{ role.emoji }}</div>
              <p class="font-label-lg text-label-lg text-primary">{{ role.name }}</p>
              <p class="text-xs text-on-surface-variant mt-1">{{ role.desc }}</p>
            </div>
          </div>
          <!-- Moral -->
          <div class="w-full bg-white rounded-[28px] p-5 border-4 border-[#B7D9BC] shadow-md relative">
            <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white"></div>
            <div class="flex items-center gap-2 mb-3 justify-center">
              <span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-base">💬</span>
              <p class="text-primary text-base font-bold">Pelajaran</p>
            </div>
            <p class="font-body-lg text-body-lg text-on-surface leading-relaxed text-center">{{ roleplay.moral }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="p-4 bg-success-soft rounded-t-[40px] border-t-4 border-[#B7D9BC] flex flex-col gap-4 items-center shrink-0">
        <div v-if="!isFinished" class="flex gap-1.5 flex-wrap justify-center">
          <button v-for="page in roleplay.pages" :key="page.num"
            @click="goToPage(page.num - 1)"
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow transition-all"
            :class="currentPageIndex === page.num - 1
              ? 'bg-primary border-white text-on-primary transform -translate-y-1'
              : 'bg-white border-[#B7D9BC] text-on-surface-variant'">
            {{ page.num }}
          </button>
        </div>
        <div class="w-full flex gap-3">
          <button @click="isFinished ? backToLastPage() : prevPage()" :disabled="!isFinished && currentPageIndex === 0"
            class="flex-1 py-3 px-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
            :class="!isFinished && currentPageIndex === 0
              ? 'text-on-surface-variant btn-pop-gray opacity-60 cursor-not-allowed'
              : 'text-text-main btn-pop-gray'">
            <span class="material-symbols-outlined text-xl">arrow_back</span>
            {{ isFinished ? 'Baca Lagi' : 'Kembali' }}
          </button>
          <button @click="nextPage"
            class="flex-1 py-3 px-4 rounded-2xl text-white font-semibold text-base btn-pop-green flex items-center justify-center gap-2">
            {{ isFinished ? 'Tutup' : currentPageIndex === roleplay.pages.length - 1 ? 'Selesai ✨' : 'Lanjut' }}
            <span class="material-symbols-outlined text-xl">{{ isFinished ? 'close' : currentPageIndex === roleplay.pages.length - 1 ? 'check' : 'arrow_forward' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import ImageWrapper from '../components/ImageWrapper.vue'

const props = defineProps({
  roleplay: { type: Object, required: true },
  color: { type: String, default: '#176c33' },
  bg: { type: String, default: '#E1F2E5' }
})

const emit = defineEmits(['close'])

const currentPageIndex = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragOffset = ref(0)
const isFinished = ref(false)
const isSpeakingNarrator = ref(false)
const SWIPE_THRESHOLD = 50

const currentPage = computed(() => props.roleplay.pages[currentPageIndex.value])

const rightRoles = ['Pembeli', 'Pasien', 'Anak']
const mainRoles = ['Pedagang', 'Dokter', 'Ibu', 'Nenek']
const emojiMap = { Pedagang: '👨‍🍳', Dokter: '👨‍⚕️', Pembeli: '👩', Pasien: '🧒', Ibu: '👩', Anak: '🧒', Nenek: '👵' }

const roleColorPalette = [
  { bg: '#E8F5E9', border: '#B7D9BC', text: '#176c33' },
  { bg: '#FFF3E0', border: '#F4A261', text: '#8e4e14' },
  { bg: '#E3F2FD', border: '#7CC6FE', text: '#004568' },
  { bg: '#F3E5F5', border: '#CE93D8', text: '#6A1B9A' },
  { bg: '#FFEBEE', border: '#EF9A9A', text: '#ba1a1a' },
  { bg: '#E0F2F1', border: '#80CBC4', text: '#00695C' },
  { bg: '#FFF8E1', border: '#FFE082', text: '#F57F17' },
]

const roleColors = {}
let colorIndex = 0

function getRoleColor(role) {
  if (!roleColors[role]) {
    roleColors[role] = roleColorPalette[colorIndex % roleColorPalette.length]
    colorIndex++
  }
  return roleColors[role]
}

function isRightRole(role) { return rightRoles.includes(role) }
function isMainRole(role) { return mainRoles.includes(role) }
function getRoleEmoji(role) { return emojiMap[role] || '👤' }

function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX }
function onDragStart(e) { isDragging.value = true; dragStartX.value = getClientX(e); dragOffset.value = 0 }
function onDragMove(e) { if (!isDragging.value) return; dragOffset.value = getClientX(e) - dragStartX.value }
function onDragEnd() {
  if (!isDragging.value) return; isDragging.value = false
  if (dragOffset.value < -SWIPE_THRESHOLD) nextPage()
  else if (dragOffset.value > SWIPE_THRESHOLD) prevPage()
  dragOffset.value = 0
}
function goToPage(index) { stopSpeech(); currentPageIndex.value = index }
function prevPage() { if (currentPageIndex.value > 0) { stopSpeech(); currentPageIndex.value-- } }
function nextPage() {
  if (isFinished.value) { emit('close'); return }
  stopSpeech()
  if (currentPageIndex.value < props.roleplay.pages.length - 1) currentPageIndex.value++
  else isFinished.value = true
}
function backToLastPage() { isFinished.value = false }

function speakNarrator() {
  if (!('speechSynthesis' in window)) return
  if (isSpeakingNarrator.value) { stopSpeech(); return }
  stopSpeech()
  const u = new SpeechSynthesisUtterance(currentPage.value.narrator)
  u.lang = 'id-ID'; u.rate = 0.9; u.pitch = 1.1
  u.onend = () => { isSpeakingNarrator.value = false }
  u.onerror = () => { isSpeakingNarrator.value = false }
  speechSynthesis.speak(u)
  isSpeakingNarrator.value = true
}

function stopSpeech() {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  isSpeakingNarrator.value = false
}

onUnmounted(() => stopSpeech())
</script>

<style scoped>
.btn-pop-green {
  background-color: #6DBE7B;
  box-shadow: 0 4px 0 #176c33;
  transition: all 0.1s ease;
}
.btn-pop-green:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 #176c33;
}
.btn-pop-gray {
  background-color: #E5E7EB;
  box-shadow: 0 4px 0 #9CA3AF;
  transition: all 0.1s ease;
}
.btn-pop-gray:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 #9CA3AF;
}
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}
.floating-illustration {
  animation: float 4s ease-in-out infinite;
}
</style>
