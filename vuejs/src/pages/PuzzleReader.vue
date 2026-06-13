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
          {{ puzzle.title }}
        </div>
        <div class="w-11 h-11 bg-friendly-sky border-4 border-white text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
          {{ isFinished ? '✓' : `${currentQ + 1}/${puzzle.questions.length}` }}
        </div>
      </div>

      <!-- Question Content -->
      <div v-if="!isFinished" class="flex-1 flex flex-col justify-center px-4 gap-4 overflow-hidden"
        @mousedown="onDragStart" @mousemove="onDragMove" @mouseup="onDragEnd" @mouseleave="onDragEnd"
        @touchstart="onDragStart" @touchmove.passive="onDragMove" @touchend="onDragEnd">

        <!-- Question Card -->
        <div class="w-full bg-white rounded-[32px] border-4 border-[#B7D9BC] p-5 shadow-md relative"
          :style="{ transform: `translateX(${dragOffset}px)`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary border-2 border-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow">
            {{ currentQ + 1 }}
          </div>
          <p class="text-text-main text-base lg:text-lg text-center leading-relaxed font-medium mt-2">
            {{ currentQuestion.q }}
          </p>
        </div>

        <!-- Hint -->
        <div class="flex justify-center">
          <button @click="showHint = !showHint"
            class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border-2"
            :class="showHint ? 'bg-friendly-sky/20 border-friendly-sky text-on-tertiary-fixed' : 'bg-white border-[#B7D9BC] text-on-surface-variant'">
            <span class="material-symbols-outlined text-lg">{{ showHint ? 'visibility_off' : 'visibility' }}</span>
            {{ showHint ? 'Sembunyikan Petunjuk' : 'Lihat Petunjuk' }}
          </button>
        </div>
        <div v-if="showHint" class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm fade-in-up">
          <p class="text-sm text-on-surface-variant text-center"><span class="w-5 h-5 rounded-full bg-friendly-sky/20 border border-[#B7D9BC] inline-flex items-center justify-center text-[10px] align-middle mr-1">💡</span> {{ currentQuestion.hint }}</p>
        </div>

        <!-- Answer -->
        <div class="flex justify-center">
          <button @click="showAnswer = !showAnswer"
            class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border-2"
            :class="showAnswer ? 'bg-success-soft border-primary text-primary' : 'bg-white border-[#B7D9BC] text-on-surface-variant'">
            <span class="material-symbols-outlined text-lg">{{ showAnswer ? 'visibility_off' : 'check_circle' }}</span>
            {{ showAnswer ? 'Sembunyikan Jawaban' : 'Lihat Jawaban' }}
          </button>
        </div>
        <div v-if="showAnswer" class="bg-success-soft rounded-2xl p-4 border-2 border-primary/20 shadow-sm fade-in-up">
           <p class="font-headline-md text-headline-md text-primary text-center"><span class="w-6 h-6 rounded-full bg-success-soft border-2 border-[#B7D9BC] inline-flex items-center justify-center text-xs align-middle mr-1">✅</span> {{ currentQuestion.a }}</p>
        </div>

        <!-- Benar / Salah -->
        <div v-if="answers[currentQ] === undefined" class="flex gap-3">
          <button @click="answer(true)"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-label-lg text-white bg-primary transition-all active:scale-95 shadow-md btn-pop-green">
            <span class="material-symbols-outlined text-xl">check_circle</span>
            Benar!
          </button>
          <button @click="answer(false)"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-label-lg text-white bg-error transition-all active:scale-95 shadow-md btn-pop-red">
            <span class="material-symbols-outlined text-xl">cancel</span>
            Salah
          </button>
        </div>
        <div v-else class="rounded-2xl p-4 text-center fade-in-up border-2"
          :class="answers[currentQ] ? 'bg-success-soft border-primary/20' : 'bg-error-container border-error/20'">
          <p class="font-headline-md text-headline-md"
            :class="answers[currentQ] ? 'text-primary' : 'text-error'">
            {{ answers[currentQ] ? '✅ Benar!' : '❌ Salah' }}
          </p>
        </div>
      </div>

      <!-- Finished Screen -->
      <div v-else class="flex-1 overflow-y-auto">
        <div class="flex flex-col items-center px-5 py-8 max-w-lg mx-auto">
          <div class="relative w-32 h-32 mb-6">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#E0E0E0" stroke-width="10" />
              <circle cx="60" cy="60" r="50" fill="none" :stroke="scoreColor" stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="314"
                :stroke-dashoffset="314 - (314 * score / 100)"
                class="transition-all duration-1000" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold" :style="{ color: scoreColor }">{{ score }}</span>
              <span class="text-xs text-on-surface-variant">dari 100</span>
            </div>
          </div>
          <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main text-center mb-2">
            {{ score >= 80 ? 'Luar Biasa! 🎉' : score >= 50 ? 'Bagus! 👍' : 'Terus Belajar! 💪' }}
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant text-center mb-8">{{ puzzle.title }}</p>

          <div class="w-full grid grid-cols-2 gap-3 mb-6">
            <div class="bg-success-soft rounded-2xl p-4 text-center border-2 border-primary/20">
              <p class="text-sm text-on-surface-variant mb-1">Benar</p>
              <p class="font-headline-md text-primary text-2xl">{{ correctCount }}</p>
            </div>
            <div class="bg-error-container rounded-2xl p-4 text-center border-2 border-error/20">
              <p class="text-sm text-on-surface-variant mb-1">Salah</p>
              <p class="font-headline-md text-error text-2xl">{{ wrongCount }}</p>
            </div>
          </div>

          <div class="w-full bg-white rounded-[28px] p-5 border-4 border-[#B7D9BC] shadow-md">
            <p class="font-label-lg text-label-lg text-primary mb-3">Detail Jawaban</p>
            <div class="space-y-2">
              <div v-for="(q, i) in puzzle.questions" :key="i"
                class="flex items-center gap-3 bg-canvas-cream rounded-xl p-3 border border-[#B7D9BC]/50">
                <span class="material-symbols-outlined text-lg"
                  :class="answers[i] ? 'text-primary' : 'text-error'">
                  {{ answers[i] ? 'check_circle' : 'cancel' }}
                </span>
                <p class="text-sm text-on-surface flex-1 truncate">{{ q.q }}</p>
                <span class="text-xs font-bold" :class="answers[i] ? 'text-primary' : 'text-error'">
                  {{ answers[i] ? 'Benar' : 'Salah' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="p-4 bg-success-soft rounded-t-[40px] border-t-4 border-[#B7D9BC] flex flex-col gap-4 items-center shrink-0">
        <div v-if="!isFinished" class="flex gap-1.5 flex-wrap justify-center">
          <button v-for="(q, i) in puzzle.questions" :key="i"
            @click="goToQ(i)"
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow transition-all"
            :class="currentQ === i
              ? 'bg-primary border-white text-on-primary transform -translate-y-1'
              : 'bg-white border-[#B7D9BC] text-on-surface-variant'">
            {{ i + 1 }}
          </button>
        </div>
        <div class="w-full flex gap-3">
          <button @click="isFinished ? backToQ() : prevQ()" :disabled="!isFinished && currentQ === 0"
            class="flex-1 py-3 px-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
            :class="!isFinished && currentQ === 0
              ? 'text-on-surface-variant btn-pop-gray opacity-60 cursor-not-allowed'
              : 'text-text-main btn-pop-gray'">
            <span class="material-symbols-outlined text-xl">arrow_back</span>
            {{ isFinished ? 'Main Lagi' : 'Kembali' }}
          </button>
          <button @click="nextQ"
            class="flex-1 py-3 px-4 rounded-2xl text-white font-semibold text-base btn-pop-green flex items-center justify-center gap-2">
            {{ isFinished ? 'Tutup' : currentQ === puzzle.questions.length - 1 ? 'Selesai ✨' : 'Lanjut' }}
            <span class="material-symbols-outlined text-xl">{{ isFinished ? 'close' : currentQ === puzzle.questions.length - 1 ? 'check' : 'arrow_forward' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  puzzle: { type: Object, required: true },
  color: { type: String, default: '#176c33' },
  bg: { type: String, default: '#E1F2E5' }
})

const emit = defineEmits(['close'])

const currentQ = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragOffset = ref(0)
const isFinished = ref(false)
const showHint = ref(false)
const showAnswer = ref(false)
const answers = ref({})
const SWIPE_THRESHOLD = 50

const currentQuestion = computed(() => props.puzzle.questions[currentQ.value])

const correctCount = computed(() => Object.values(answers.value).filter(v => v === true).length)
const wrongCount = computed(() => Object.values(answers.value).filter(v => v === false).length)
const score = computed(() => {
  const total = props.puzzle.questions.length
  if (total === 0) return 0
  return Math.round((correctCount.value / total) * 100)
})
const scoreColor = computed(() => score.value >= 80 ? '#176c33' : score.value >= 50 ? '#F4A261' : '#ba1a1a')

function answer(isCorrect) {
  answers.value[currentQ.value] = isCorrect
}

function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX }
function onDragStart(e) { isDragging.value = true; dragStartX.value = getClientX(e); dragOffset.value = 0 }
function onDragMove(e) { if (!isDragging.value) return; dragOffset.value = getClientX(e) - dragStartX.value }
function onDragEnd() {
  if (!isDragging.value) return; isDragging.value = false
  if (dragOffset.value < -SWIPE_THRESHOLD) nextQ()
  else if (dragOffset.value > SWIPE_THRESHOLD) prevQ()
  dragOffset.value = 0
}
function goToQ(i) { currentQ.value = i; showHint.value = false; showAnswer.value = false }
function prevQ() { if (currentQ.value > 0) { currentQ.value--; showHint.value = false; showAnswer.value = false } }
function nextQ() {
  if (isFinished.value) { emit('close'); return }
  if (currentQ.value < props.puzzle.questions.length - 1) { currentQ.value++; showHint.value = false; showAnswer.value = false }
  else isFinished.value = true
}
function backToQ() { isFinished.value = false; answers.value = {} }
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
.btn-pop-red {
  background-color: #E57373;
  box-shadow: 0 4px 0 #ba1a1a;
  transition: all 0.1s ease;
}
.btn-pop-red:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 #ba1a1a;
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
</style>
