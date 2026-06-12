<template>
  <div class="space-y-4">
    <div v-for="cl in checklists" :key="cl.id"
      class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-label-lg text-text-main flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-xs">✅</span> {{ cl.title }}
        </h4>
        <span class="text-xs font-bold text-primary bg-success-soft px-2 py-1 rounded-full">{{ checked(cl) }}/{{ cl.items.length }}</span>
      </div>

      <div class="space-y-2 mb-4">
        <AppCheckbox v-for="(item, i) in cl.items" :key="i"
          v-model="item.done"
          :label="item.label" />
        <div v-if="!cl.items.length" class="text-center text-xs text-on-surface-variant py-2">
          <p class="text-2xl mb-1">📋</p>
          Belum ada item
        </div>
      </div>

      <div class="w-full h-2 bg-white rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700"
          :style="{ width: percent(cl) + '%', background: '#176c33' }"></div>
      </div>

      <div class="flex items-center gap-2 mt-3">
        <button @click="openAddItem(cl)"
          class="h-9 flex-1 rounded-xl border-2 border-dashed text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border-[#B7D9BC] text-primary">
          <span class="material-symbols-outlined text-base">add</span>
          Tambah Item
        </button>
        <button @click="shareChecklist(cl)"
          class="h-9 w-9 rounded-xl border-2 flex items-center justify-center transition-all active:scale-95 border-[#B7D9BC] text-primary">
          <span class="material-symbols-outlined text-base">share</span>
        </button>
      </div>
    </div>

    <div v-if="!checklists.length"
      class="bg-canvas-cream rounded-[24px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
      <p class="text-3xl mb-2">✅</p>
      <p class="text-sm text-on-surface-variant font-medium">Belum ada checklist</p>
    </div>

    <button @click="showForm = true"
      class="w-full py-3 mt-4 rounded-2xl text-white text-sm font-bold btn-pop-green flex items-center justify-center gap-2">
      <span class="material-symbols-outlined text-lg">add</span>
      Buat Checklist
    </button>
  </div>

  <AppModal v-model="showForm" title="Tambah Checklist">
    <div class="space-y-4">
      <AppInput v-model="newTitle" label="Nama Checklist" placeholder="Contoh: Pagi Hari" :error="titleError" />
    </div>
    <div class="flex gap-3 mt-6">
      <AppButton variant="outline" block @click="closeForm">Batal</AppButton>
      <AppButton block @click="addChecklist">Simpan</AppButton>
    </div>
  </AppModal>

  <AppModal v-model="showItemForm" title="Tambah Item">
    <div class="space-y-4">
      <AppInput v-model="newItemLabel" label="Nama Aktivitas" placeholder="Contoh: Sikat gigi" :error="itemError" />
    </div>
    <div class="flex gap-3 mt-6">
      <AppButton variant="outline" block @click="closeItemForm">Batal</AppButton>
      <AppButton block @click="addItem">Simpan</AppButton>
    </div>
  </AppModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppCheckbox from '../components/AppCheckbox.vue'
import AppModal from '../components/AppModal.vue'
import AppInput from '../components/AppInput.vue'
import AppButton from '../components/AppButton.vue'
import { shareChecklistImage } from '../utils/share.js'

const props = defineProps({
  checklists: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-checklist', 'remove-checklist', 'add-item', 'remove-item'])

const showForm = ref(false)
const newTitle = ref('')
const titleError = ref('')
const showItemForm = ref(false)
const newItemLabel = ref('')
const itemError = ref('')
const activeChecklistId = ref(null)

function checked(cl) {
  return cl.items.filter(i => i.done).length
}

function percent(cl) {
  if (!cl.items.length) return 0
  return Math.round((checked(cl) / cl.items.length) * 100)
}

function closeForm() {
  showForm.value = false
  newTitle.value = ''
  titleError.value = ''
}

function addChecklist() {
  titleError.value = ''
  if (!newTitle.value.trim()) {
    titleError.value = 'Nama checklist wajib diisi'
    return
  }
  emit('add-checklist', { id: Date.now(), title: newTitle.value.trim(), items: [] })
  closeForm()
}

function openAddItem(cl) {
  activeChecklistId.value = cl.id
  showItemForm.value = true
}

function closeItemForm() {
  showItemForm.value = false
  newItemLabel.value = ''
  itemError.value = ''
  activeChecklistId.value = null
}

function addItem() {
  itemError.value = ''
  if (!newItemLabel.value.trim()) {
    itemError.value = 'Nama aktivitas wajib diisi'
    return
  }
  if (!activeChecklistId.value) return
  emit('add-item', { checklistId: activeChecklistId.value, item: { label: newItemLabel.value.trim(), done: false } })
  closeItemForm()
}

function shareChecklist(cl) {
  shareChecklistImage(cl.title, cl.items, checked(cl), percent(cl))
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
