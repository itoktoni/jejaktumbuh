<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar" style="background: linear-gradient(135deg, #00897B, #E0F2F1);">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:shape-outline" class="ws-toolbar-icon" /> Mengenal Bentuk</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" style="color: #00695C;" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box title-box">
            <span class="ws-title">⬜ Mengenal Bentuk</span>
          </div>
          <div class="ws-header-box name-box">
            <span class="ws-label">Nama:</span>
            <div class="ws-name-line"></div>
          </div>
        </div>
        <div class="ws-grid2">
          <div v-for="(s, i) in shapes" :key="i" class="ws-shape-cell">
            <svg viewBox="0 0 100 100" class="ws-shape-svg">
              <circle v-if="s.shape === 'circle'" cx="50" cy="45" r="35" fill="none" stroke="#aaa" stroke-width="2" stroke-dasharray="5,3" />
              <rect v-if="s.shape === 'square'" x="15" y="10" width="70" height="70" fill="none" stroke="#aaa" stroke-width="2" stroke-dasharray="5,3" />
              <polygon v-if="s.shape === 'triangle'" points="50,8 90,82 10,82" fill="none" stroke="#aaa" stroke-width="2" stroke-dasharray="5,3" />
              <path v-if="s.shape === 'heart'" d="M50 88 C20 60 0 40 0 25 C0 10 15 0 30 0 C40 0 48 8 50 15 C52 8 60 0 70 0 C85 0 100 10 100 25 C100 40 80 60 50 88Z" fill="none" stroke="#aaa" stroke-width="2" stroke-dasharray="5,3" />
            </svg>
            <div class="ws-shape-name">{{ s.name }}</div>
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

const shapes = [
  { name: 'Lingkaran', shape: 'circle' },
  { name: 'Persegi', shape: 'square' },
  { name: 'Segitiga', shape: 'triangle' },
  { name: 'Hati', shape: 'heart' }
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
    await downloadWorksheetPDF(printArea.value, 'Worksheet_MengenalBentuk.pdf')
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
.ws-btn { background: white; color: #00695C; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; }
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
.ws-grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; flex: 1; align-content: start; }
.ws-shape-cell { display: flex; flex-direction: column; align-items: center; gap: 8px; border: 2px solid #ccc; border-radius: 12px; padding: 20px; }
.ws-shape-svg { width: 120px; height: 120px; }
.ws-shape-name { font-size: 18px; font-weight: 700; color: #333; }
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
@media print { html, body { background: white; } .ws-toolbar { display: none; } .ws-wrapper { padding-top: 0; } .ws-print-area { padding: 0; width: 100%; } }
</style>
