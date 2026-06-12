<template>
  <div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">

    <h2 class="font-headline-md text-headline-md mb-6 flex items-center gap-2">
      <span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-base">📊</span> Laporan Perkembangan
    </h2>

    <div class="space-y-4">
      <div v-if="!anakList.length" class="bg-canvas-cream rounded-[32px] border-4 border-dashed border-[#B7D9BC] p-8 text-center">
        <div class="text-5xl mb-3">👶</div>
        <p class="font-label-lg text-text-main mb-1">Belum ada data anak</p>
        <p class="text-sm text-on-surface-variant">Tambahkan anak terlebih dahulu di menu Profil untuk mulai melihat perkembangan.</p>
      </div>

      <div v-for="anak in anakList" :key="anak.id" class="bg-canvas-cream rounded-[28px] border-4 border-[#B7D9BC] shadow-md overflow-hidden">
        <button class="w-full flex items-center gap-4 p-5 text-left hover:bg-white/50 transition-colors"
          @click="toggle(anak.id)">
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 border-2 border-white shadow-sm" :style="{ background: anak.bg }">
            {{ anak.emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-label-lg text-text-main">{{ anak.nama }}</p>
            <p class="text-sm text-on-surface-variant">{{ ageLabel(anak.tahun, anak.bulan, anak.tanggal) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="anak.skills" class="text-xs font-bold text-primary bg-success-soft px-2 py-1 rounded-full">
              {{ anak.skills.length }} skills
            </span>
            <span v-if="getAnakTotal(anak.id).completed > 0" class="text-xs font-bold text-white bg-primary px-2 py-1 rounded-full">
              {{ getAnakTotal(anak.id).completed }} selesai
            </span>
            <span class="material-symbols-outlined text-primary transition-transform duration-200"
              :class="{ 'rotate-180': openId === anak.id }">expand_more</span>
          </div>
        </button>

        <div v-show="openId === anak.id" class="px-5 pb-5 space-y-5 border-t-2 border-[#B7D9BC]/50">

          <div v-if="anak.skills && anak.skills.length" class="pt-4 space-y-3">
            <h4 class="text-xs font-bold text-primary uppercase tracking-wider">Skills Aktif</h4>
            <div v-for="sp in anak.skills" :key="sp.key"
              class="rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              @click="$emit('open-skill', { anakId: anak.id, skillKey: sp.key, pilarKey: sp.pilar })">
              <div class="flex items-center gap-3 mb-3">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-text-main">{{ sp.title }}</p>
                  <p class="text-xs text-on-surface-variant">{{ getPilarName(sp.pilar) }}</p>
                </div>
                <span class="text-xs font-bold" :style="{ color: sp.color }">
                  {{ getSkillProgress(anak.id, sp.key).points }}/{{ getSkillProgress(anak.id, sp.key).max }}
                </span>
              </div>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div class="h-full rounded-full transition-all duration-700"
                  :style="{ width: getSkillProgress(anak.id, sp.key).percent + '%', background: sp.color }"></div>
              </div>

              <div v-if="sp.activities && sp.activities.length" class="mb-3 space-y-1.5">
                <div v-for="act in sp.activities" :key="act.id || act.title"
                  class="flex items-center gap-2 px-3 py-2 bg-canvas-cream rounded-xl text-xs border border-[#B7D9BC]/50"
                  :class="{ 'opacity-50 line-through': act.completed }">
                  <button @click.stop="toggleActivityComplete(anak.id, act)"
                    class="relative w-10 h-6 rounded-full shrink-0 transition-colors duration-200 focus:outline-none"
                    :class="act.completed ? 'bg-primary' : 'bg-gray-300'">
                    <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                      :class="{ 'translate-x-4': act.completed }"></span>
                  </button>
                  <span class="text-base">{{ act.emoji }}</span>
                  <span class="flex-1 font-medium text-text-main">{{ act.title }}</span>
                  <span class="text-on-surface-variant">{{ act.date }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1 text-xs text-on-surface-variant">
                  <span class="material-symbols-outlined text-xs">check_circle</span>
                  <span>{{ (sp.activities || []).filter(a => a.completed).length }}/{{ (sp.activities || []).length }} selesai</span>
                </div>
                <div class="flex items-center gap-2">
                  <button @click.stop="$emit('delete-skill', { anak, skill: sp })"
                    class="h-8 w-8 rounded-lg flex items-center justify-center border-2 transition-all active:scale-95 border-error/30 text-error">
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                  <button @click.stop="openEvaluasi(anak, sp)"
                    class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white transition-all active:scale-95"
                    :style="{ background: sp.color }">
                    <span class="material-symbols-outlined text-sm">rate_review</span>
                    Evaluasi
                  </button>
                  <button @click.stop="shareEvalDirect(anak, sp)"
                    class="h-8 w-8 rounded-lg flex items-center justify-center border-2 transition-all active:scale-95"
                    :style="{ borderColor: sp.color + '60', color: sp.color }">
                    <span class="material-symbols-outlined text-base">share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="pt-4 text-center text-sm text-on-surface-variant py-4">
            <p class="text-2xl mb-1">📝</p>
            Belum ada skills aktif
          </div>

          <div class="" v-if="anak.completedSkills && anak.completedSkills.length">
            <h4 class="text-xs font-bold text-primary uppercase tracking-wider mb-3">Skills Selesai</h4>
            <div class="space-y-2">
              <div v-for="sp in anak.completedSkills" :key="sp.key"
                class="flex items-center gap-3 bg-white rounded-2xl p-3 border-2 border-[#B7D9BC] shadow-sm">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-text-main">{{ sp.title }}</p>
                  <p class="text-xs text-on-surface-variant">{{ getPilarName(sp.pilar) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button @click="$emit('reset-skill', { anak, skill: sp })"
                    class="h-8 w-8 rounded-lg flex items-center justify-center border-2 transition-all active:scale-95 border-error/30 text-error">
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                  <button @click.stop="shareEvalDirect(anak, sp)"
                    class="h-8 w-8 rounded-lg flex items-center justify-center border-2 transition-all active:scale-95"
                    :style="{ borderColor: (sp.color || '#176c33') + '60', color: sp.color || '#176c33' }">
                    <span class="material-symbols-outlined text-base">share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Completed Evaluations -->
          <div v-if="getCompletedEvals(anak.id).length">
            <button @click="showCompleted = showCompleted === anak.id ? null : anak.id"
              class="w-full flex items-center justify-between py-2">
              <h4 class="text-xs font-bold text-primary uppercase tracking-wider">
                Evaluasi Selesai ({{ getCompletedEvals(anak.id).length }})
              </h4>
              <span class="material-symbols-outlined text-primary text-lg transition-transform"
                :class="{ 'rotate-180': showCompleted === anak.id }">expand_more</span>
            </button>
            <div v-show="showCompleted === anak.id" class="space-y-2">
              <div v-for="ev in getCompletedEvals(anak.id)" :key="ev.id"
                class="flex items-center gap-3 bg-white rounded-xl p-3 border-2 border-[#B7D9BC] shadow-sm">
                <div class="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-primary text-sm">check_circle</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-text-main">{{ ev.skill_title }}</p>
                  <p class="text-[10px] text-on-surface-variant">{{ formatDate(ev.updated_at) }}</p>
                </div>
                <span class="text-xs font-bold text-white bg-primary px-2 py-1 rounded-full">
                  {{ ev.points }}/{{ ev.max_points }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <AppModal v-model="showEvaluasi" :title="evalTitle" fullscreen closable>
      <div class="text-center mb-4">
        <p class="text-xs text-on-surface-variant">{{ evalDesc }}</p>
      </div>

      <div v-if="evalQuestions.length" class="space-y-2 mb-5">
        <p class="text-[11px] font-bold text-primary uppercase tracking-wider">Panduan Penilaian</p>
        <div v-for="(q, i) in evalQuestions" :key="i"
          class="bg-white rounded-xl p-3 text-sm text-text-main border-2 border-[#B7D9BC]/50">
          {{ i + 1 }}. {{ q }}
        </div>
      </div>

      <div class="bg-success-soft rounded-xl p-3 border-2 border-[#B7D9BC]/50 mb-4 text-center">
        <p class="text-xs text-on-surface-variant">
          <template v-if="app.userGender === 'Ayah'">Menurut <span class="font-bold text-text-main">Ayah</span>, berapa nilai yang sudah <span class="font-bold text-text-main">ananda</span> peroleh berdasarkan pertanyaan diatas terhadap softskill yang sudah dikuasai?</template>
          <template v-else-if="app.userGender === 'Bunda'">Menurut <span class="font-bold text-text-main">Bunda</span>, berapa nilai yang sudah <span class="font-bold text-text-main">ananda</span> peroleh berdasarkan pertanyaan diatas terhadap softskill yang sudah dikuasai?</template>
          <template v-else>Menurut Ayah / Bunda, berapa nilai yang sudah <span class="font-bold text-text-main">ananda</span> peroleh berdasarkan pertanyaan diatas terhadap softskill yang sudah dikuasai?</template>
        </p>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#B7D9BC]/50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-primary uppercase tracking-wider">Penilaian</span>
          <span class="text-xs font-bold text-primary">{{ evalPoints }}/{{ evalMax }}</span>
        </div>
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1">
            <div class="w-full h-5 rounded-full overflow-hidden relative bg-primary/10">
              <div class="h-full rounded-full transition-all duration-300 bg-primary"
                :style="{ width: evalPercent + '%' }">
              </div>
            </div>
          </div>
        </div>
        <input type="range" v-model.number="evalPoints" :min="0" :max="evalMax" step="1"
          class="w-full accent-primary h-3 rounded-full appearance-none cursor-pointer"
          @input="onSliderChange" />
        <div class="flex justify-between text-[10px] text-on-surface-variant mt-1.5 px-0.5">
          <span v-for="i in evalMax + 1" :key="i">{{ i - 1 }}</span>
        </div>
      </div>

      <div class="flex gap-3 mt-5">
        <AppButton variant="outline" block @click="closeEvaluasi">Tutup</AppButton>
        <AppButton block @click="shareEval">
          <span class="material-symbols-outlined text-lg">share</span> Share
        </AppButton>
      </div>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { pilars } from '../data/pilars.js'
import { getEvaluasi } from '../data/skills.js'
import { ageLabel } from '../utils/age.js'
import { shareProgress } from '../utils/share.js'
import AppModal from '../components/AppModal.vue'
import AppButton from '../components/AppButton.vue'
import { useAppStore } from '../stores/appStore.js'
import * as api from '../services/api.js'

const app = useAppStore()

const props = defineProps({
  anakList: { type: Array, default: () => [] },
  selectedAnakId: { type: Number, default: null }
})

defineEmits(['evaluasi', 'reset-skill', 'delete-skill', 'open-skill'])

const openId = ref(null)
const showCompleted = ref(null)
const showEvaluasi = ref(false)
const evalAnak = ref(null)
const evalSkill = ref(null)
const evalQuestions = ref([])
const evalPoints = ref(0)
const evalMax = 10
const evalSaving = ref(false)
let autoSaveTimer = null

const evaluationsData = ref({})
const activeEvals = ref({})
const completedCount = ref({})
const totalPoints = ref({})
const totalMax = ref({})

watch(() => props.selectedAnakId, (id) => {
  if (id) {
    openId.value = id
    fetchEvaluations(id)
  }
}, { immediate: true })

watch(() => props.anakList, (list) => {
  for (const a of list) {
    if (!evaluationsData.value[a.id]) fetchEvaluations(a.id)
  }
}, { immediate: true })

function toggle(id) {
  if (openId.value === id) {
    openId.value = null
  } else {
    openId.value = id
    fetchEvaluations(id)
  }
}

async function fetchEvaluations(anakId) {
  if (!api.isAuthenticated()) return
  const anak = props.anakList.find(a => a.id === anakId)
  if (!anak || !anak.serverSynced) return
  try {
    const data = await api.getEvaluations(anakId)
    evaluationsData.value[anakId] = data.evaluations || []
    activeEvals.value[anakId] = data.active || []
    completedCount.value[anakId] = data.completed_count || 0
    totalPoints.value[anakId] = data.total_points || 0
    totalMax.value[anakId] = data.total_max || 0
  } catch (e) {
    console.warn('Failed to fetch evaluations:', e)
  }
}

function getAnakTotal(anakId) {
  return {
    points: totalPoints.value[anakId] || 0,
    max: totalMax.value[anakId] || 0,
    completed: completedCount.value[anakId] || 0,
  }
}

function getSkillProgress(anakId, skillKey) {
  const evals = activeEvals.value[anakId] || []
  const ev = evals.find(e => e.skill_key === skillKey)
  if (!ev || !ev.max_points) return { points: 0, max: 10, percent: 0 }
  return {
    points: ev.points,
    max: ev.max_points,
    percent: Math.round((ev.points / ev.max_points) * 100),
  }
}

function getCompletedEvals(anakId) {
  return (evaluationsData.value[anakId] || []).filter(e => e.points >= e.max_points)
}

async function toggleActivityComplete(anakId, act) {
  if (!act.id) return
  const anak = props.anakList.find(a => a.id === anakId)
  if (!anak || !anak.serverSynced) return
  act.completed = !act.completed
  try {
    await api.toggleActivity(anakId, act.id)
  } catch (e) {
    act.completed = !act.completed
    console.warn('Failed to toggle activity:', e)
  }
}

function getPilarName(key) {
  const p = pilars.find(p => p.key === key)
  return p ? p.title : key
}

function getPilarBg(key) {
  const p = pilars.find(p => p.key === key)
  return p ? p.bg : '#F5F5F5'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const evalTitle = computed(() => {
  if (!evalSkill.value) return 'Evaluasi'
  return `Evaluasi: ${evalSkill.value.title}`
})

const evalEmoji = computed(() => evalSkill.value?.emoji || '⭐')
const evalColor = computed(() => evalSkill.value?.color || '#176c33')
const evalDesc = computed(() => evalSkill.value?.desc || '')

const evalPercent = computed(() => Math.min(100, Math.round((evalPoints.value / evalMax) * 100)))

function openEvaluasi(anak, sp) {
  evalAnak.value = anak
  evalSkill.value = sp
  const data = getEvaluasi(sp.key)
  evalQuestions.value = data ? data.evaluasi : []
  const existing = (activeEvals.value[anak.id] || []).find(e => e.skill_key === sp.key)
  evalPoints.value = existing ? existing.points : 0
  showEvaluasi.value = true
}

function addEvalPoint() {
  if (evalPoints.value < evalMax) {
    evalPoints.value++
  }
}

function removeEvalPoint() {
  if (evalPoints.value > 0) {
    evalPoints.value--
  }
}

function onSliderChange() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    autoSaveEvaluation()
  }, 800)
}

async function autoSaveEvaluation() {
  if (!evalAnak.value || !evalSkill.value || evalPoints.value === 0) return
  if (!evalAnak.value.serverSynced) return
  evalSaving.value = true
  try {
    await api.addEvaluation(evalAnak.value.id, {
      skill_key: evalSkill.value.key,
      skill_title: evalSkill.value.title,
      pilar: evalSkill.value.pilar,
      points: evalPoints.value,
      max_points: evalMax,
      notes: `${evalPoints.value} dari ${evalMax} poin`,
    })
    await fetchEvaluations(evalAnak.value.id)
  } catch (e) {
    console.warn('Auto-save failed:', e)
  }
  evalSaving.value = false
}

function closeEvaluasi() {
  showEvaluasi.value = false
}

async function saveEvaluation() {
  if (!evalAnak.value || !evalSkill.value || evalPoints.value === 0) return
  if (!evalAnak.value.serverSynced) return
  evalSaving.value = true
  try {
    await api.addEvaluation(evalAnak.value.id, {
      skill_key: evalSkill.value.key,
      skill_title: evalSkill.value.title,
      pilar: evalSkill.value.pilar,
      points: evalPoints.value,
      max_points: evalMax,
      notes: `${evalPoints.value} dari ${evalMax} poin`,
    })
    await fetchEvaluations(evalAnak.value.id)
  } catch (e) {
    console.warn('Failed to save evaluation:', e)
  }
  evalSaving.value = false
}

async function shareEval() {
  if (!evalAnak.value || !evalSkill.value) return
  await saveEvaluation()
  const progress = getSkillProgress(evalAnak.value.id, evalSkill.value.key)
  shareProgress({
    title: evalSkill.value.title,
    category: getPilarName(evalSkill.value.pilar),
    emoji: evalSkill.value.emoji,
    color: evalColor.value,
    points: progress.points,
    maxPoints: progress.max,
    notes: progress.points >= progress.max
      ? `Selesai! ${progress.points}/${progress.max} poin`
      : `Progress ${progress.points}/${progress.max} poin`,
    childName: evalAnak.value.nama,
    isComplete: progress.points >= progress.max,
  })
}

function shareEvalDirect(anak, sp) {
  const progress = getSkillProgress(anak.id, sp.key)
  shareProgress({
    title: sp.title,
    category: getPilarName(sp.pilar),
    emoji: sp.emoji,
    color: sp.color,
    points: progress.points,
    maxPoints: progress.max,
    notes: progress.points >= progress.max
      ? `Selesai! ${progress.points}/${progress.max} poin`
      : `Progress ${progress.points}/${progress.max} poin`,
    childName: anak.nama,
    isComplete: progress.points >= progress.max,
  })
}
</script>

<style scoped>
input[type="range"] { -webkit-appearance: none; background: transparent; }
input[type="range"]::-webkit-slider-runnable-track { height: 10px; border-radius: 5px; background: #B7D9BC; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px; border-radius: 50%; background: #176C33; margin-top: -9px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer; }
input[type="range"]::-moz-range-track { height: 10px; border-radius: 5px; background: #B7D9BC; }
input[type="range"]::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: #176C33; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer; }
</style>
