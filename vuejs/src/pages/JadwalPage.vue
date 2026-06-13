<template>
  <div class="space-y-4">
    <div v-for="s in schedules" :key="s.time"
      class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all"
      @click="s.done = !s.done">
      <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all border-2 border-white shadow-sm"
        :style="s.done ? { background: '#176c33', color: '#fff' } : { background: '#E1F2E5', color: '#176c33' }">
        <span class="material-symbols-outlined text-lg">{{ s.done ? 'check' : 'schedule' }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-label-lg" :class="s.done ? 'text-on-surface-variant line-through' : 'text-text-main'">{{ s.label }}</p>
        <p class="text-xs text-on-surface-variant">{{ s.time }}</p>
      </div>
      <button @click.stop="emit('remove-schedule', s)"
        class="w-8 h-8 rounded-full flex items-center justify-center text-error/50 hover:bg-error/10 hover:text-error transition-colors">
        <span class="material-symbols-outlined text-base">close</span>
      </button>
    </div>

    <div v-if="!schedules.length"
      class="bg-canvas-cream rounded-[24px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
      <p class="text-3xl mb-2">📅</p>
      <p class="text-sm text-on-surface-variant font-medium">Belum ada jadwal</p>
    </div>

    <button @click="showForm = true"
      class="w-full py-3 rounded-2xl text-sm font-bold text-white btn-pop-green flex items-center justify-center gap-2">
      <span class="material-symbols-outlined text-lg">add</span>
      Tambah Jadwal
    </button>
  </div>

  <AppModal v-model="showForm" title="Tambah Jadwal">
    <div class="space-y-4">
      <AppInput v-model="newLabel" label="Nama Aktivitas" placeholder="Contoh: Belajar Membaca" :error="labelError" />
      <AppInput v-model="newTime" label="Waktu" type="time" placeholder="08:00" :error="timeError" />
    </div>
    <div class="flex gap-3 mt-6">
      <AppButton variant="outline" block @click="closeForm">Batal</AppButton>
      <AppButton block @click="addSchedule">Simpan</AppButton>
    </div>
  </AppModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppModal from '../components/AppModal.vue'
import AppInput from '../components/AppInput.vue'
import AppButton from '../components/AppButton.vue'

const props = defineProps({
  schedules: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-schedule', 'remove-schedule'])

const showForm = ref(false)
const newLabel = ref('')
const newTime = ref('')
const labelError = ref('')
const timeError = ref('')

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  const lastReset = localStorage.getItem('jadwal_last_reset')
  if (lastReset !== today) {
    props.schedules.forEach(s => { s.done = false })
    localStorage.setItem('jadwal_last_reset', today)
  }
})

function closeForm() {
  showForm.value = false
  newLabel.value = ''
  newTime.value = ''
  labelError.value = ''
  timeError.value = ''
}

function addSchedule() {
  labelError.value = ''
  timeError.value = ''
  let valid = true
  if (!newLabel.value.trim()) {
    labelError.value = 'Nama aktivitas wajib diisi'
    valid = false
  }
  if (!newTime.value) {
    timeError.value = 'Waktu wajib diisi'
    valid = false
  }
  if (!valid) return
  emit('add-schedule', { time: newTime.value, label: newLabel.value.trim(), done: false })
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
