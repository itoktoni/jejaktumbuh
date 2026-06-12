<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar" style="background: linear-gradient(135deg, #E91E63, #FCE4EC);">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:wave" class="ws-toolbar-icon" /> Garis Zig Zag</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" style="color: #C2185B;" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box title-box">
            <span class="ws-title"><Icon icon="mdi:wave" class="ws-title-icon" /> Garis Zig Zag</span>
          </div>
          <div class="ws-header-box name-box">
            <span class="ws-label">Nama:</span>
            <div class="ws-name-line"></div>
          </div>
        </div>
        <div class="ws-patterns">
          <div v-for="(p, i) in patterns" :key="i" class="ws-pattern-item">
            <div class="ws-pattern-name">{{ p.name }}</div>
            <svg :viewBox="'0 0 400 50'" class="ws-pattern-svg">
              <path :d="p.svgPath" fill="none" stroke="#ccc" stroke-width="2" stroke-dasharray="6,4" />
            </svg>
            <div class="ws-practice-line"></div>
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

const patterns = [
  { name: 'Garis Lurus', svgPath: 'M 10 25 L 390 25' },
  { name: 'Zig Zag', svgPath: 'M 10 35 L 50 10 L 90 35 L 130 10 L 170 35 L 210 10 L 250 35 L 290 10 L 330 35 L 370 10 L 390 25' },
  { name: 'Gelombang', svgPath: 'M 10 25 C 45 0, 75 0, 110 25 C 145 50, 175 50, 210 25 C 245 0, 275 0, 310 25 C 345 50, 375 50, 390 25' },
  { name: 'Garis Putus-putus', svgPath: 'M 10 25 L 50 25 M 70 25 L 110 25 M 130 25 L 170 25 M 190 25 L 230 25 M 250 25 L 290 25 M 310 25 L 350 25 M 370 25 L 390 25' },
  { name: 'Garis Lengkung S', svgPath: 'M 10 40 C 60 40, 60 10, 110 10 C 160 10, 160 40, 210 40 C 260 40, 260 10, 310 10 C 360 10, 360 40, 390 40' }
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
    await downloadWorksheetPDF(printArea.value, 'Worksheet_GarisZigzag.pdf')
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
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.ws-title-icon { width: 20px; height: 20px; vertical-align: -4px; margin-right: 6px; }
.ws-toolbar-actions { display: flex; gap: 8px; }
.ws-btn { background: white; color: #C2185B; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; }
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
.ws-patterns { display: flex; flex-direction: column; gap: 16px; flex: 1; }
.ws-pattern-item { border: 2px solid #ccc; border-radius: 10px; padding: 12px 16px; }
.ws-pattern-name { font-size: 16px; font-weight: 700; color: #333; margin-bottom: 8px; }
.ws-pattern-svg { width: 100%; height: 40px; }
.ws-practice-line { border-bottom: 2px dashed #ccc; margin-top: 12px; height: 0; }
@media print { html, body { background: white; } .ws-toolbar { display: none; } .ws-wrapper { padding-top: 0; } .ws-print-area { padding: 0; } }
</style>
