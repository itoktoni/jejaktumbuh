<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:magnify" class="ws-toolbar-icon" /> Mencari Kata</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box ws-title-box">
            <span class="ws-title"><Icon icon="mdi:magnify" class="ws-title-icon" /> Mencari Kata</span>
          </div>
          <div class="ws-header-box ws-name-box">
            <span class="ws-label">Nama:</span>
            <span class="ws-name-value">{{ childName }}</span>
          </div>
          <div class="ws-header-box ws-date-box">
            <span class="ws-label">Tanggal:</span>
            <span class="ws-date-value">{{ todayStr() }}</span>
          </div>
        </div>
        <div class="ws-content">
          <div class="ws-grid">
            <div v-for="(row, ri) in grid" :key="ri" class="ws-grid-row">
              <span v-for="(cell, ci) in row" :key="ci" class="ws-grid-cell">{{ cell }}</span>
            </div>
          </div>
          <div class="ws-word-list">
            <div class="ws-word-list-title">Kata yang harus dicari:</div>
            <div class="ws-word-items">
              <span v-for="(w, i) in words" :key="i" class="ws-word-tag">{{ w }}</span>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { downloadWorksheetPDF } from '../../utils/worksheetPdf.js'
import { useToolsStore } from '../../stores/toolsStore.js'
import { useAnakStore } from '../../stores/anakStore.js'

const emit = defineEmits(['close'])
const generating = ref(false)
const printArea = ref(null)
const toolsStore = useToolsStore()
const anakStore = useAnakStore()

const childName = computed(() => {
  const anak = anakStore.anakList.find(a => a.id === toolsStore.toolsAnakId)
  return anak ? anak.nama : ''
})

function todayStr() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const themes = {
  hewan: ['SAPI', 'AYAM', 'IKAN', 'KUCING', 'ANJING'],
  buah: ['APEL', 'PISANG', 'JERUK', 'MANGGA', 'ANGGUR']
}

const themeKeys = Object.keys(themes)
const selectedTheme = themes[themeKeys[Math.floor(Math.random() * themeKeys.length)]]
const words = [...selectedTheme]

const SIZE = 10
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function generateGrid() {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  for (const word of words) {
    let placed = false
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const row = Math.floor(Math.random() * SIZE)
      const col = Math.floor(Math.random() * (SIZE - word.length + 1))
      let canPlace = true
      for (let k = 0; k < word.length; k++) {
        if (g[row][col + k] !== '' && g[row][col + k] !== word[k]) {
          canPlace = false
          break
        }
      }
      if (canPlace) {
        for (let k = 0; k < word.length; k++) {
          g[row][col + k] = word[k]
        }
        placed = true
      }
    }
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === '') {
        g[r][c] = letters[Math.floor(Math.random() * 26)]
      }
    }
  }
  return g
}

const grid = generateGrid()

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_MencariKata.pdf')
  } catch (e) {
    console.error(e)
    alert('Gagal membuat PDF.')
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: #e8e8e8; font-family: 'helvetica', sans-serif; }
.ws-wrapper { padding-top: 60px; }
.ws-toolbar {
  position: fixed; top: 0; left: 0; right: 0;
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  color: #E65100; padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  font-family: 'helvetica', sans-serif;
}
.ws-btn-close {
  background: rgba(230,81,0,0.15); color: #E65100; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 18px; cursor: pointer; font-weight: 700;
}
.ws-toolbar-title { font-size: 15px; font-weight: 700; flex: 1; }
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.ws-title-icon { width: 20px; height: 20px; vertical-align: -4px; margin-right: 6px; }
.ws-toolbar-actions { display: flex; gap: 8px; }
.ws-btn {
  background: white; color: #E65100; border: none;
  padding: 8px 16px; border-radius: 10px;
  font-weight: 700; font-size: 13px; cursor: pointer;
  font-family: 'helvetica', sans-serif;
}
.ws-btn:hover { transform: scale(1.03); }
.ws-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ws-print-area {
  width: 794px;
  margin: 0px auto;
  padding: 20px 50px;
  background: white;
  font-family: 'helvetica', sans-serif;
}
.ws-header { display: flex; gap: 8px; margin-bottom: 20px; }
.ws-header-box {
  border: 2.5px solid #222; border-radius: 12px;
  padding: 10px 16px; display: flex; align-items: center; gap: 8px;
}
.ws-title-box { flex: 2; justify-content: center; }
.ws-name-box { flex: 1.5; }
.ws-date-box { flex: 1.2; }
.ws-title { font-size: 20px; font-weight: 700; color: #222; }
.ws-label { font-size: 14px; font-weight: 700; color: #222; white-space: nowrap; }
.ws-name-value, .ws-date-value { font-size: 14px; color: #555; }
.ws-content { display: flex; flex-direction: column; gap: 16px; align-items: center; }
.ws-grid { display: flex; flex-direction: column; }
.ws-grid-row { display: flex; }
.ws-grid-cell {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid #FB8C00; background: #FFF3E0;
  font-size: 16px; font-weight: 700; color: #222;
}
.ws-word-list { width: 100%; }
.ws-word-list-title { font-size: 16px; font-weight: 700; color: #E65100; margin-bottom: 8px; }
.ws-word-items { display: flex; flex-wrap: wrap; gap: 8px; }
.ws-word-tag {
  background: #FFF3E0; border: 2px solid #FB8C00;
  border-radius: 8px; padding: 4px 12px;
  font-size: 14px; font-weight: 700; color: #E65100;
}
@media print {
  html, body { background: white; }
  .ws-toolbar { display: none; }
  .ws-wrapper { padding-top: 0; }
  .ws-print-area { padding: 0; gap: 0; }
  .ws-print-area {
    box-shadow: none; page-break-after: always;
    width: 100%; min-height: 0; height: 297mm;
    padding: 12mm 15mm; overflow: hidden;
  }
  .ws-print-area:last-child { page-break-after: auto; }
}
</style>
