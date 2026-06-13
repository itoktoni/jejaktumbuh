<template>
  <div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
    <div class="flex items-center justify-between mb-stack-lg">
      <h2 class="font-headline-md text-headline-md">Alat Bantu Bunda</h2>
      <AnakSelector :anak-list="anakList" v-model="selectedAnakId" />
    </div>

    <ChallengePage :challenges="data.challenges" :challenge-history="data.challengeHistory" @add-challenge="onAddChallenge" @add-point="onAddPoint" @remove-point="onRemovePoint" @edit-challenge="onEditChallenge" />
    <JadwalPage :schedules="data.schedules" @add-schedule="onAddSchedule" @remove-schedule="onRemoveSchedule" />
    <ChecklistPage :checklists="data.checklists" @add-checklist="onAddChecklist" @remove-checklist="onRemoveChecklist" @add-item="onAddChecklistItem" @remove-item="onRemoveChecklistItem" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { challengeByAnak, defaultChallenge } from '../data/challenge.js'
import ChallengePage from './ChallengePage.vue'
import JadwalPage from './JadwalPage.vue'
import ChecklistPage from './ChecklistPage.vue'
import AnakSelector from '../components/AnakSelector.vue'

const props = defineProps({
  anakList: { type: Array, default: () => [] }
})

const selectedAnakId = ref(null)
const anakData = ref({})

const toolsDataByAnak = {
  1: {
    ...JSON.parse(JSON.stringify(challengeByAnak[1] || defaultChallenge)),
    schedules: [
      { time: '07:00', label: 'Sarapan & Persiapan Sekolah', done: true },
      { time: '08:00', label: 'Belajar Membaca', done: true },
      { time: '16:00', label: 'Waktu Bermain Bebas', done: false },
      { time: '20:00', label: 'Membaca Buku', done: false }
    ],
    checklists: [
      {
        id: 1, title: 'Pagi Hari',
        items: [
          { label: 'Sholat Subuh', done: true },
          { label: 'Membaca buku sebelum tidur', done: true },
          { label: 'Sarapan sehat', done: false }
        ]
      },
      {
        id: 2, title: 'Malam Hari',
        items: [
          { label: 'Merapiikan mainan', done: false },
          { label: 'Minum air putih', done: true },
          { label: 'Sholat Isya', done: true }
        ]
      }
    ]
  },
  2: {
    ...JSON.parse(JSON.stringify(challengeByAnak[2] || defaultChallenge)),
    schedules: [
      { time: '07:30', label: 'Sarapan & Bermain', done: true },
      { time: '10:00', label: 'Belajar Menggambar', done: false },
      { time: '15:00', label: 'Tidur Siang', done: true }
    ],
    checklists: [
      {
        id: 1, title: 'Kegiatan Harian',
        items: [
          { label: 'Sikat Gigi Sendiri', done: true },
          { label: 'Membereskan Mainan', done: false },
          { label: 'Makan Sendiri', done: true }
        ]
      }
    ]
  }
}

const defaultData = {
  challenges: [],
  challengeHistory: [],
  schedules: [
    { time: '07:00', label: 'Sarapan', done: false },
    { time: '20:00', label: 'Tidur', done: false }
  ],
  checklists: []
}

function getData(anakId) {
  if (!anakData.value[anakId]) {
    anakData.value[anakId] = JSON.parse(JSON.stringify(toolsDataByAnak[anakId] || defaultData))
  }
  return anakData.value[anakId]
}

const data = computed(() => getData(selectedAnakId.value))

function onAddChallenge(item) {
  data.value.challenges.push(item)
}

function onAddPoint({ id, amount }) {
  const c = data.value.challenges.find(c => c.id === id)
  if (c) {
    c.points = Math.min(c.maxPoints, c.points + amount)
  }
}

function onRemovePoint({ id }) {
  const c = data.value.challenges.find(c => c.id === id)
  if (c) {
    c.points = Math.max(0, c.points - 1)
  }
}

function onEditChallenge(editData) {
  const c = data.value.challenges.find(c => c.id === editData.id)
  if (c) {
    c.category = editData.category
    c.title = editData.title
    c.notes = editData.notes
    c.emoji = editData.emoji
    c.bg = editData.bg
    c.color = editData.color
    c.maxPoints = editData.maxPoints
  }
}

function onAddChecklist(item) {
  data.value.checklists.push(item)
}

function onRemoveChecklist(index) {
  data.value.checklists.splice(index, 1)
}

function onAddChecklistItem({ checklistId, item }) {
  const cl = data.value.checklists.find(c => c.id === checklistId)
  if (cl) cl.items.push(item)
}

function onRemoveChecklistItem({ checklistId, itemIndex }) {
  const cl = data.value.checklists.find(c => c.id === checklistId)
  if (cl) cl.items.splice(itemIndex, 1)
}

function onAddSchedule(item) {
  data.value.schedules.push(item)
}

function onRemoveSchedule(item) {
  const idx = data.value.schedules.indexOf(item)
  if (idx > -1) data.value.schedules.splice(idx, 1)
}

watch(() => props.anakList, (list) => {
  if (list.length && !selectedAnakId.value) {
    selectedAnakId.value = list[list.length - 1].id
  }
}, { immediate: true })
</script>
