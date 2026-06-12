<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-headline-md text-text-main flex items-center gap-2">
        <span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-base">🏆</span> Challenge
      </h3>
      <button @click="showHistory = !showHistory"
        class="flex items-center gap-1.5 text-sm font-bold text-primary transition-colors bg-success-soft px-3 py-1.5 rounded-full">
        <span class="material-symbols-outlined text-lg">{{ showHistory ? 'close' : 'history' }}</span>
        {{ showHistory ? 'Tutup' : 'History' }}
      </button>
    </div>

    <div v-if="!showHistory" class="space-y-4">
      <div v-for="c in activeChallenges" :key="c.id"
        class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
        @click="openEdit(c)">
        <div class="flex items-end gap-4">
          <div class="flex-1 min-w-0">
            <div class="mb-1">
              <p class="text-[11px] font-bold uppercase tracking-wider mb-0.5" :style="{ color: c.color }">{{ c.category }}</p>
              <p class="font-label-lg font-bold text-text-main">{{ c.title }}</p>
              <p v-if="c.notes" class="text-xs text-on-surface-variant mt-0.5">{{ c.notes }}</p>
            </div>

            <div class="flex items-center gap-2 mt-4">
              <button @click.stop="removePoint(c)"
                class="h-9 px-3 rounded-xl text-xs font-bold border-2 transition-all active:scale-95"
                :style="{ borderColor: c.color + '80', color: c.color }">
                -1 Poin
              </button>
              <button @click.stop="addPoint(c)"
                class="h-9 px-3 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                :style="{ background: c.color }">
                +1 Poin
              </button>
              <button @click.stop="handleShareProgress(c)"
                class="h-9 w-9 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 flex items-center justify-center"
                :style="{ borderColor: c.color + '80', color: c.color }">
                <span class="material-symbols-outlined text-base">share</span>
              </button>
              <button @click.stop="deleteChallenge(c)"
                class="h-9 w-9 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 flex items-center justify-center border-error/30 text-error">
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>

          <div class="celengan shrink-0 flex flex-col items-center self-stretch">
            <div class="celengan-tube relative w-16 h-full rounded-xl overflow-hidden border-2 shadow-lg"
              :style="{ borderColor: c.color + '60', background: c.color + '10', boxShadow: `0 4px 16px ${c.color}40` }">
              <div class="absolute bottom-0 left-0 right-0 transition-all duration-700 rounded-b-xl"
                :style="{ height: pointPercent(c) + '%', background: `linear-gradient(to top, ${c.color}, ${c.color}CC)` }">
              </div>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-lg font-extrabold leading-none" :style="{ color: pointPercent(c) > 50 ? '#FFF9F3' : c.color }">{{ c.points }}</span>
                <span class="text-[10px] font-bold leading-none mt-0.5" :style="{ color: pointPercent(c) > 50 ? 'rgba(255,255,255,0.8)' : 'text-on-surface-variant' }">/ {{ c.maxPoints }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!activeChallenges.length"
        class="bg-canvas-cream rounded-[24px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <p class="text-3xl mb-2">🏅</p>
        <p class="text-sm text-on-surface-variant font-medium">Belum ada challenge aktif</p>
      </div>
      <button @click="showAddForm = true"
        class="w-full py-3 rounded-2xl text-sm font-bold text-white btn-pop-green flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-lg">add</span>
        Tambah Challenge
      </button>
    </div>

    <div v-else class="space-y-5">
      <div v-for="(items, cat) in historyByCategory" :key="cat">
        <div class="flex items-center gap-2 mb-2">
          <h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ cat }}</h4>
          <span class="text-xs font-bold text-primary bg-success-soft px-2 py-0.5 rounded-full">{{ items.length }}</span>
        </div>
        <div class="space-y-2">
          <div v-for="c in items" :key="c.id"
            class="bg-canvas-cream rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-main">{{ c.title }}</p>
              <p class="text-xs text-on-surface-variant">{{ c.maxPoints }} poin terkumpul</p>
            </div>
            <button @click="handleShareChallenge(c)"
              class="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 bg-success-soft text-primary">
              <span class="material-symbols-outlined text-xl">share</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="!challengeHistory.length"
        class="bg-canvas-cream rounded-[24px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <p class="text-3xl mb-2">📜</p>
        <p class="text-sm text-on-surface-variant font-medium">Belum ada riwayat challenge</p>
      </div>
    </div>
  </div>

  <AppModal v-model="showAddForm" title="Tambah Challenge">
    <div class="space-y-4">
      <AppSelect v-model="form.category" label="Kategori" placeholder="Pilih kategori" :error="errors.category">
        <option v-for="(_, key) in kategoriChallenge" :key="key" :value="key">{{ key }}</option>
      </AppSelect>
      <AppInput v-model="form.title" label="Nama Challenge" placeholder="Contoh: Perkalian 1-10" :error="errors.title" />
      <AppTextarea v-model="form.notes" label="Catatan" placeholder="Catatan tambahan..." :rows="2" />
      <AppInput v-model.number="form.maxPoints" label="Target Poin" type="number" placeholder="10" :error="errors.maxPoints" />
    </div>
    <div class="flex gap-3 mt-6">
      <AppButton variant="outline" block @click="closeForm">Batal</AppButton>
      <AppButton block @click="saveForm">Simpan</AppButton>
    </div>
  </AppModal>

  <AppModal v-model="showEditForm" title="Edit Challenge">
    <div class="space-y-4">
      <AppSelect v-model="editForm.category" label="Kategori" placeholder="Pilih kategori" :error="errors.category">
        <option v-for="(_, key) in kategoriChallenge" :key="key" :value="key">{{ key }}</option>
      </AppSelect>
      <AppInput v-model="editForm.title" label="Nama Challenge" placeholder="Contoh: Perkalian 1-10" :error="errors.title" />
      <AppTextarea v-model="editForm.notes" label="Catatan" placeholder="Catatan tambahan..." :rows="2" />
      <AppInput v-model.number="editForm.maxPoints" label="Target Poin" type="number" placeholder="10" :error="errors.maxPoints" />
    </div>
    <div class="flex gap-3 mt-6">
      <AppButton variant="outline" block @click="closeEdit">Batal</AppButton>
      <AppButton block @click="saveEdit">Simpan</AppButton>
    </div>
  </AppModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppModal from '../components/AppModal.vue'
import AppInput from '../components/AppInput.vue'
import AppSelect from '../components/AppSelect.vue'
import AppTextarea from '../components/AppTextarea.vue'
import AppButton from '../components/AppButton.vue'
import { kategoriChallenge } from '../data/challenge.js'
import { playAddSound, playRemoveSound } from '../utils/sound.js'
import { shareChallenge, shareProgress } from '../utils/share.js'
import { useToolsStore } from '../stores/toolsStore.js'
import { useAnakStore } from '../stores/anakStore.js'

const tools = useToolsStore()
const anakStore = useAnakStore()

const selectedAnakName = computed(() => {
  const a = anakStore.anakList.find(a => a.id === tools.toolsAnakId)
  return a ? a.nama : 'Anak'
})

const props = defineProps({
  challenges: { type: Array, default: () => [] },
  challengeHistory: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-challenge', 'add-point', 'remove-point', 'edit-challenge', 'delete-challenge'])

const showHistory = ref(false)
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingId = ref(null)

const errors = ref({ category: '', title: '', maxPoints: '' })

const categoryEmojis = kategoriChallenge

const defaultForm = { category: '', title: '', notes: '', maxPoints: 10 }
const form = ref({ ...defaultForm })
const editForm = ref({ ...defaultForm })

const activeChallenges = computed(() => props.challenges.filter(c => c.points < c.maxPoints))

const historyByCategory = computed(() => {
  const grouped = {}
  for (const c of props.challengeHistory) {
    if (!grouped[c.category]) grouped[c.category] = []
    grouped[c.category].push(c)
  }
  return grouped
})

function pointPercent(c) {
  return Math.min(100, Math.round((c.points / c.maxPoints) * 100))
}

function addPoint(c, amount = 1) {
  playAddSound()
  emit('add-point', { id: c.id, amount })
}

function removePoint(c) {
  playRemoveSound()
  emit('remove-point', { id: c.id })
}

function handleShareProgress(c) {
  shareProgress({ ...c, childName: selectedAnakName.value })
}

function handleShareChallenge(c) {
  shareChallenge({ ...c, childName: selectedAnakName.value })
}

function deleteChallenge(c) {
  emit('delete-challenge', { id: c.id })
}

function openEdit(c) {
  editingId.value = c.id
  editForm.value = {
    category: c.category,
    title: c.title,
    notes: c.notes || '',
    maxPoints: c.maxPoints
  }
  showEditForm.value = true
}

function closeEdit() {
  showEditForm.value = false
  editingId.value = null
  errors.value = { category: '', title: '', maxPoints: '' }
}

function saveEdit() {
  if (!validateForm(editForm.value)) return
  const cat = categoryEmojis[editForm.value.category] || categoryEmojis['Lainnya']
  emit('edit-challenge', {
    id: editingId.value,
    category: editForm.value.category,
    title: editForm.value.title.trim(),
    notes: editForm.value.notes.trim(),
    emoji: cat.emoji,
    bg: cat.bg,
    color: cat.color,
    maxPoints: Number(editForm.value.maxPoints) || 10
  })
  closeEdit()
}

function closeForm() {
  showAddForm.value = false
  form.value = { ...defaultForm }
  errors.value = { category: '', title: '', maxPoints: '' }
}

function validateForm(data) {
  errors.value = { category: '', title: '', maxPoints: '' }
  let valid = true
  if (!data.category) {
    errors.value.category = 'Kategori wajib dipilih'
    valid = false
  }
  if (!data.title || !data.title.trim()) {
    errors.value.title = 'Nama challenge wajib diisi'
    valid = false
  }
  const pts = Number(data.maxPoints)
  if (!data.maxPoints || !Number.isInteger(pts) || pts < 1) {
    errors.value.maxPoints = 'Target poin harus angka bulat minimal 1'
    valid = false
  }
  return valid
}

function saveForm() {
  if (!validateForm(form.value)) return
  const max = Number(form.value.maxPoints) || 10
  const cat = categoryEmojis[form.value.category] || categoryEmojis['Lainnya']
  emit('add-challenge', {
    id: Date.now(),
    category: form.value.category,
    title: form.value.title.trim(),
    notes: form.value.notes.trim(),
    emoji: cat.emoji,
    bg: cat.bg,
    color: cat.color,
    points: 0,
    maxPoints: max
  })
  closeForm()
}
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
</style>
