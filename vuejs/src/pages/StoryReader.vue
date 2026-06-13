<template>
  <div class="fixed inset-0 z-[100] bg-black/40 flex items-end lg:items-center justify-center lg:p-4">
    <div class="w-full max-w-md bg-canvas-cream rounded-[40px] shadow-2xl border-8 border-[#B7D9BC] overflow-hidden flex flex-col h-[100dvh] lg:h-[852px] relative">

      <!-- Header -->
      <div class="px-4 pt-4 pb-2 flex justify-between items-center z-10 shrink-0">
        <button @click="$emit('close')"
          class="w-11 h-11 bg-error border-4 border-white text-white rounded-full flex items-center justify-center text-xl shadow-md hover:scale-105 active:scale-95 transition-all">
          ✕
        </button>
        <div class="bg-primary text-on-primary px-5 py-1.5 rounded-full border-4 border-white shadow-md text-base font-semibold truncate max-w-[180px]">
          {{ story.title }}
        </div>
        <div class="w-11 h-11 bg-friendly-sky border-4 border-white text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
          {{ isFinished ? '✓' : `${currentPage.num}/${story.pages.length}` }}
        </div>
      </div>

      <!-- Page Content -->
      <div v-if="!isFinished" class="flex-1 flex flex-col justify-center px-4 gap-4 overflow-hidden"
        @mousedown="onDragStart"
        @mousemove="onDragMove"
        @mouseup="onDragEnd"
        @mouseleave="onDragEnd"
        @touchstart="onDragStart"
        @touchmove.passive="onDragMove"
        @touchend="onDragEnd">

        <!-- Illustration -->
        <div class="w-full aspect-[4/3] bg-success-soft rounded-[32px] border-4 border-white shadow-lg overflow-hidden relative floating-illustration"
          :style="{ transform: `translateX(${dragOffset}px)`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }">
          <ImageWrapper :src="currentPage.image" :alt="currentPage.text" height="100%" />
          <div class="absolute top-3 right-3 bg-primary text-on-primary border-2 border-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow">
            {{ currentPage.num }}
          </div>
        </div>

        <!-- Speech Bubble -->
        <div class="bg-white rounded-[32px] border-4 border-[#B7D9BC] p-5 shadow-md relative">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white"></div>
          <p class="text-text-main text-base lg:text-lg text-center leading-relaxed font-medium">
            {{ currentPage.text }}
          </p>
        </div>

        <!-- TTS Button -->
        <div class="flex justify-center">
          <button @click="toggleSpeech"
            class="border-4 border-white px-5 py-2.5 rounded-full flex items-center gap-2 text-base font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
            :class="isSpeaking ? 'bg-error text-on-error' : 'bg-primary text-on-primary'">
            <span class="material-symbols-outlined text-xl" :class="isSpeaking ? '' : 'animate-pulse'">{{ isSpeaking ? 'stop' : 'volume_up' }}</span>
            {{ isSpeaking ? 'Berhenti' : 'Dengarkan' }}
          </button>
        </div>
      </div>

      <!-- Finished / Moral Screen -->
      <div v-else class="flex-1 flex flex-col justify-center px-5 gap-5 overflow-y-auto py-6">
        <div class="flex flex-col items-center">
          <div class="w-20 h-20 bg-primary rounded-full border-4 border-white flex items-center justify-center text-5xl shadow-lg floating-illustration mb-1">
            🎉
          </div>
          <p class="text-primary text-xs mt-2 font-bold">Cerita Selesai!</p>
        </div>

        <div class="bg-white rounded-[32px] border-4 border-[#B7D9BC] p-5 shadow-md relative">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white"></div>
          <div class="flex items-center gap-2 mb-3 justify-center">
            <span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-base">💬</span>
            <p class="text-primary text-base font-bold">Pelajaran</p>
          </div>
          <p class="text-text-main text-base text-center leading-relaxed font-medium" style="font-style: italic;">
            {{ story.moral }}
          </p>
        </div>

        <div class="flex justify-center">
          <button @click="speakMoral"
            class="border-4 border-white px-5 py-2.5 rounded-full flex items-center gap-2 text-base font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
            :class="isSpeakingMoral ? 'bg-error text-on-error' : 'bg-primary text-on-primary'">
            <span class="material-symbols-outlined text-xl">{{ isSpeakingMoral ? 'stop' : 'volume_up' }}</span>
            {{ isSpeakingMoral ? 'Berhenti' : 'Dengarkan Pelajaran' }}
          </button>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="p-4 bg-success-soft rounded-t-[40px] border-t-4 border-[#B7D9BC] flex flex-col gap-4 items-center shrink-0">
        <!-- Page Dots -->
        <div v-if="!isFinished" class="flex gap-1.5 flex-wrap justify-center">
          <button v-for="page in story.pages" :key="page.num"
            @click="goToPage(page.num - 1)"
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow transition-all"
            :class="currentPageIndex === page.num - 1
              ? 'bg-primary border-white text-on-primary transform -translate-y-1'
              : 'bg-white border-[#B7D9BC] text-on-surface-variant'">
            {{ page.num }}
          </button>
        </div>

        <!-- Nav Buttons -->
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
            {{ isFinished ? 'Tutup' : currentPageIndex === story.pages.length - 1 ? 'Selesai ✨' : 'Lanjut' }}
            <span class="material-symbols-outlined text-xl">{{ isFinished ? 'close' : currentPageIndex === story.pages.length - 1 ? 'check' : 'arrow_forward' }}</span>
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
  story: { type: Object, required: true },
  color: { type: String, default: '#176c33' },
  bg: { type: String, default: '#E1F2E5' }
})

const emit = defineEmits(['close'])

const currentPageIndex = ref(0)
const isSpeaking = ref(false)
const isSpeakingMoral = ref(false)
const autoPlay = ref(false)
let utterance = null

const isDragging = ref(false)
const dragStartX = ref(0)
const dragOffset = ref(0)
const SWIPE_THRESHOLD = 50

const isFinished = ref(false)

const currentPage = computed(() => props.story.pages[currentPageIndex.value])

function getClientX(e) {
  return e.touches ? e.touches[0].clientX : e.clientX
}

function onDragStart(e) {
  isDragging.value = true
  dragStartX.value = getClientX(e)
  dragOffset.value = 0
}

function onDragMove(e) {
  if (!isDragging.value) return
  dragOffset.value = getClientX(e) - dragStartX.value
}

function onDragEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  if (dragOffset.value < -SWIPE_THRESHOLD) nextPage()
  else if (dragOffset.value > SWIPE_THRESHOLD) prevPage()
  dragOffset.value = 0
}

function goToPage(index) {
  autoPlay.value = false
  stopSpeech()
  currentPageIndex.value = index
}

function prevPage() {
  if (currentPageIndex.value > 0) {
    autoPlay.value = false
    stopSpeech()
    currentPageIndex.value--
  }
}

function nextPage() {
  if (isFinished.value) {
    emit('close')
    return
  }
  autoPlay.value = false
  stopSpeech()
  if (currentPageIndex.value < props.story.pages.length - 1) {
    currentPageIndex.value++
  } else {
    isFinished.value = true
  }
}

function backToLastPage() {
  isFinished.value = false
  stopSpeech()
}

function toggleSpeech() {
  if (isSpeaking.value) {
    autoPlay.value = false
    stopSpeech()
  } else {
    autoPlay.value = true
    speak()
  }
}

function speak() {
  if (!('speechSynthesis' in window)) return
  stopSpeech()
  utterance = new SpeechSynthesisUtterance(currentPage.value.text)
  utterance.lang = 'id-ID'
  utterance.rate = 0.9
  utterance.pitch = 1.1
  utterance.onend = () => {
    isSpeaking.value = false
    if (autoPlay.value && currentPageIndex.value < props.story.pages.length - 1) {
      currentPageIndex.value++
      setTimeout(() => speak(), 400)
    } else {
      autoPlay.value = false
    }
  }
  utterance.onerror = () => { isSpeaking.value = false; autoPlay.value = false }
  speechSynthesis.speak(utterance)
  isSpeaking.value = true
}

function speakMoral() {
  if (!('speechSynthesis' in window)) return
  if (isSpeakingMoral.value) {
    speechSynthesis.cancel()
    isSpeakingMoral.value = false
    return
  }
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(props.story.moral)
  u.lang = 'id-ID'
  u.rate = 0.9
  u.pitch = 1.1
  u.onend = () => { isSpeakingMoral.value = false }
  u.onerror = () => { isSpeakingMoral.value = false }
  speechSynthesis.speak(u)
  isSpeakingMoral.value = true
}

function stopSpeech() {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  isSpeaking.value = false
  isSpeakingMoral.value = false
}

onUnmounted(() => stopSpeech())
</script>

<style scoped>
.btn-pop-green {
  background-color: #6DBE7B;
  box-shadow: 0 6px 0 #176c33;
  transition: all 0.1s ease;
}
.btn-pop-green:active {
  transform: translateY(6px);
  box-shadow: 0 0px 0 #176c33;
}
.btn-pop-gray {
  background-color: #E5E7EB;
  box-shadow: 0 6px 0 #9CA3AF;
  transition: all 0.1s ease;
}
.btn-pop-gray:active {
  transform: translateY(6px);
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
