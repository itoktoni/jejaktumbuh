<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar" style="background: linear-gradient(135deg, #8E24AA, #F3E5F5);">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:counter" class="ws-toolbar-icon" /> Angka 1-10</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" style="color: #6A1B9A;" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box title-box">
            <span class="ws-title"><Icon icon="mdi:counter" class="ws-title-icon" /> Angka 1-10</span>
          </div>
          <div class="ws-header-box name-box">
            <span class="ws-label">Nama:</span>
            <div class="ws-name-line"></div>
          </div>
        </div>
        <div class="ws-grid2">
          <div v-for="(n, i) in numberWords" :key="i" class="ws-num-cell">
            <div class="ws-num-display">{{ n.num }} <span class="ws-num-arrow">→</span> ({{ n.word }})</div>
            <div class="ws-practice-dashes"></div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { downloadWorksheetPDF } from '../../utils/worksheetPdf.js'
import { useToolsStore } from '../../stores/toolsStore.js'
import { useAnakStore } from '../../stores/anakStore.js'

const emit = defineEmits(['close'])
const toolsStore = useToolsStore()
const anakStore = useAnakStore()
const generating = ref(false)
const printArea = ref(null)

const numberWords = [
  { num: 1, word: 'satu' },
  { num: 2, word: 'dua' },
  { num: 3, word: 'tiga' },
  { num: 4, word: 'empat' },
  { num: 5, word: 'lima' },
  { num: 6, word: 'enam' },
  { num: 7, word: 'tujuh' },
  { num: 8, word: 'delapan' },
  { num: 9, word: 'sembilan' },
  { num: 10, word: 'sepuluh' }
]

function getChildName() {
  const anak = anakStore.anakList.find(a => a.id === toolsStore.toolsAnakId)
  return anak ? anak.nama : ''
}

function todayStr() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_AngkaWs.pdf')
  } catch (e) {
    console.error(e)
    alert('Gagal membuat PDF.')
  } finally {
    generating.value = false
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: #e8e8e8; font-family: 'helvetica', sans-serif; }
.ws-wrapper { padding-top: 60px; }
.ws-toolbar { position: fixed; top: 0; left: 0; right: 0; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
.ws-btn-close { background: rgba(255,255,255,0.2); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 18px; cursor: pointer; font-weight: 700; }
.ws-toolbar-title { font-size: 15px; font-weight: 700; flex: 1; }
.ws-toolbar-actions { display: flex; gap: 8px; }
.ws-btn { background: white; color: #6A1B9A; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; }
.ws-btn:hover { transform: scale(1.03); }
.ws-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ws-print-area { width: 794px; margin: 0px auto; padding: 20px 50px; background: white; font-family: 'helvetica', sans-serif; }
.ws-header { display: flex; gap: 8px; margin-bottom: 20px; }
.ws-header-box { flex: 1; border: 2.5px solid #222; border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; }
.title-box { justify-content: center; }
.ws-title { font-size: 20px; font-weight: 700; color: #222; }
.name-box { gap: 10px; }
.ws-label { font-size: 18px; font-weight: 700; color: #222; white-space: nowrap; }
.ws-name-line { flex: 1; border-bottom: 2.5px dashed #aaa; min-height: 22px; }
.ws-grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; flex: 1; align-content: start; }
.ws-num-cell { border: 2px solid #ccc; border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.ws-num-display { font-size: 20px; font-weight: 700; color: #333; text-align: center; }
.ws-num-arrow { color: #999; }
.ws-practice-dashes { border-bottom: 2px dashed #ccc; width: 100%; }
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.ws-title-icon { width: 20px; height: 20px; vertical-align: -4px; margin-right: 6px; }
@media print { html, body { background: white; } .ws-toolbar { display: none; } .ws-wrapper { padding-top: 0; } .ws-print-area { padding: 0; } }
</style>
