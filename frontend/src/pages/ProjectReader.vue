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
          {{ project.title }}
        </div>
        <div class="w-11 h-11 bg-friendly-sky border-4 border-white text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
          {{ isFinished ? '✓' : `${currentPageDisplay}/${totalPages}` }}
        </div>
      </div>

      <!-- Content -->
      <div v-if="!isFinished" class="flex-1 overflow-hidden relative select-none"
        @mousedown="onDragStart" @mousemove="onDragMove" @mouseup="onDragEnd" @mouseleave="onDragEnd"
        @touchstart="onDragStart" @touchmove.passive="onDragMove" @touchend="onDragEnd">
        <div class="h-full overflow-y-auto"
          :style="{ transform: `translateX(${dragOffset}px)`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }">

          <!-- Materials Page -->
          <div v-if="currentStep === -1" class="flex flex-col">
            <div class="w-full h-[220px] lg:h-[260px] overflow-hidden bg-success-soft shrink-0 relative">
              <img v-if="!imgFailed.project" :src="project.image" :alt="project.title" class="w-full h-full object-cover pointer-events-none" @error="imgFailed.project = true" />
              <div v-else class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-5xl mb-1">broken_image</span>
                <span class="text-sm font-medium">Gambar tidak tersedia</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <h2 class="text-white font-headline-lg-mobile text-headline-lg-mobile drop-shadow-lg">{{ project.title }}</h2>
                <p class="text-white/90 text-sm drop-shadow-lg mt-1">{{ project.desc }}</p>
              </div>
            </div>
            <div class="px-4 py-4 space-y-3">
              <!-- Info -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm text-center">
                  <p class="text-xs text-on-surface-variant mb-1">Durasi</p>
                  <p class="font-label-lg text-label-lg text-primary">⏱ {{ project.duration }}</p>
                </div>
                <div class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm text-center">
                  <p class="text-xs text-on-surface-variant mb-1">Tingkat</p>
                  <p class="font-label-lg text-label-lg text-primary">📊 {{ project.difficulty }}</p>
                </div>
              </div>
              <!-- Materials -->
              <div class="bg-white rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 border-white shadow-sm" :style="{ background: bg }">📦</div>
                  <div>
                    <h3 class="font-headline-md text-headline-md">Bahan yang Dibutuhkan</h3>
                    <p class="text-xs text-on-surface-variant">Siapkan semua bahan sebelum mulai</p>
                  </div>
                </div>
                <ul class="space-y-2">
                  <li v-for="(m, i) in project.materials" :key="i" class="flex items-center gap-3 bg-canvas-cream rounded-xl p-3 border border-[#B7D9BC]/50">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" :style="{ background: color }">
                      {{ i + 1 }}
                    </div>
                    <span class="text-sm text-on-surface font-medium">{{ m }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Step Content -->
          <div v-else class="flex flex-col">
            <div class="w-full h-[220px] lg:h-[260px] overflow-hidden bg-success-soft shrink-0 relative">
              <img v-if="!imgFailed.step" :src="currentStepData.image" :alt="currentStepData.title" class="w-full h-full object-cover pointer-events-none" @error="imgFailed.step = true" />
              <div v-else class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-5xl mb-1">broken_image</span>
                <span class="text-sm font-medium">Gambar tidak tersedia</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div class="absolute bottom-3 left-3 flex items-center gap-2">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm" :style="{ background: color }">
                  {{ currentStep + 1 }}
                </div>
                <span class="text-white font-label-lg drop-shadow-lg">{{ currentStepData.title }}</span>
              </div>
            </div>
            <div class="px-5 py-5">
              <p class="font-body-lg text-body-lg text-on-surface leading-relaxed">{{ currentStepData.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Finished Screen -->
      <div v-else class="flex-1 overflow-y-auto">
        <div class="flex flex-col items-center px-5 py-8 max-w-lg mx-auto">
          <div class="w-20 h-20 rounded-full bg-success-soft border-4 border-[#B7D9BC] flex items-center justify-center text-5xl mb-6 shadow-md floating-illustration">🎉</div>
          <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main text-center mb-2">Proyek Selesai!</h2>
          <p class="font-body-md text-body-md text-on-surface-variant text-center mb-8">{{ project.title }}</p>
          <div class="w-full grid grid-cols-2 gap-3 mb-6">
            <div class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm text-center">
              <p class="text-sm text-on-surface-variant mb-1">Durasi</p>
              <p class="font-label-lg text-label-lg text-primary">⏱ {{ project.duration }}</p>
            </div>
            <div class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm text-center">
              <p class="text-sm text-on-surface-variant mb-1">Tingkat</p>
              <p class="font-label-lg text-label-lg text-primary">📊 {{ project.difficulty }}</p>
            </div>
          </div>
          <div class="w-full bg-white rounded-[28px] p-5 border-4 border-[#B7D9BC] shadow-md relative">
            <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white"></div>
            <div class="flex items-center gap-2 mb-3 justify-center">
              <span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-base">💡</span>
              <p class="text-primary text-base font-bold">Tips</p>
            </div>
            <p class="font-body-lg text-body-lg text-on-surface leading-relaxed text-center">{{ project.tips }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="p-4 bg-success-soft rounded-t-[40px] border-t-4 border-[#B7D9BC] flex flex-col gap-4 items-center shrink-0">
        <div v-if="!isFinished" class="flex gap-1.5 flex-wrap justify-center">
          <button @click="goToMaterials"
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow transition-all"
            :class="currentStep === -1
              ? 'bg-primary border-white text-on-primary transform -translate-y-1'
              : 'bg-white border-[#B7D9BC] text-on-surface-variant'">
            📦
          </button>
          <button v-for="(step, i) in project.steps" :key="i"
            @click="goToStep(i)"
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow transition-all"
            :class="currentStep === i
              ? 'bg-primary border-white text-on-primary transform -translate-y-1'
              : 'bg-white border-[#B7D9BC] text-on-surface-variant'">
            {{ i + 1 }}
          </button>
        </div>
        <div class="w-full flex gap-3">
          <button @click="isFinished ? backToSteps() : prevPage()" :disabled="!isFinished && currentStep === -1"
            class="flex-1 py-3 px-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
            :class="!isFinished && currentStep === -1
              ? 'text-on-surface-variant btn-pop-gray opacity-60 cursor-not-allowed'
              : 'text-text-main btn-pop-gray'">
            <span class="material-symbols-outlined text-xl">arrow_back</span>
            {{ isFinished ? 'Lihat Langkah' : 'Kembali' }}
          </button>
          <button @click="nextPage"
            class="flex-1 py-3 px-4 rounded-2xl text-white font-semibold text-base btn-pop-green flex items-center justify-center gap-2">
            {{ isFinished ? 'Tutup' : currentStep === project.steps.length - 1 ? 'Selesai ✨' : 'Lanjut' }}
            <span class="material-symbols-outlined text-xl">{{ isFinished ? 'close' : currentStep === project.steps.length - 1 ? 'check' : 'arrow_forward' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  project: { type: Object, required: true },
  color: { type: String, default: '#176c33' },
  bg: { type: String, default: '#E1F2E5' }
})

const emit = defineEmits(['close'])

const imgFailed = reactive({ project: false, step: false })

const currentStep = ref(-1)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragOffset = ref(0)
const isFinished = ref(false)
const SWIPE_THRESHOLD = 50

const totalPages = computed(() => 1 + props.project.steps.length)
const currentPageDisplay = computed(() => currentStep.value + 2)
const currentStepData = computed(() => props.project.steps[currentStep.value])

function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX }
function onDragStart(e) { isDragging.value = true; dragStartX.value = getClientX(e); dragOffset.value = 0 }
function onDragMove(e) { if (!isDragging.value) return; dragOffset.value = getClientX(e) - dragStartX.value }
function onDragEnd() {
  if (!isDragging.value) return; isDragging.value = false
  if (dragOffset.value < -SWIPE_THRESHOLD) nextPage()
  else if (dragOffset.value > SWIPE_THRESHOLD) prevPage()
  dragOffset.value = 0
}
function goToMaterials() { currentStep.value = -1 }
function goToStep(i) { currentStep.value = i }
function prevPage() { if (currentStep.value > -1) currentStep.value-- }
function nextPage() {
  if (isFinished.value) { emit('close'); return }
  if (currentStep.value < props.project.steps.length - 1) currentStep.value++
  else isFinished.value = true
}
function backToSteps() { isFinished.value = false }
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
