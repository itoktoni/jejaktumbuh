<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:file-document-edit-outline" class="ws-toolbar-icon" /> Mewarnai Alfabet (A-Z)</div>
      <div class="ws-toolbar-options">
        <select v-model="letterCase" class="ws-select">
          <option value="upper">Huruf Besar (A)</option>
          <option value="lower">Huruf Kecil (a)</option>
          <option value="both">Keduanya (A a)</option>
        </select>
      </div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
      <div v-for="(pair, i) in letterPairs" :key="pair.upper" data-page class="ws-page">
        <div class="ws-container">
          <table class="ws-header-table">
            <tbody><tr>
              <td class="ws-header-title">Mewarnai Huruf</td>
              <td class="ws-header-name">Nama: _________________________</td>
            </tr></tbody>
          </table>
          <div class="ws-letter-area">
            <span v-if="letterCase === 'upper' || letterCase === 'both'" class="ws-letter">{{ pair.upper }}</span>
            <span v-if="letterCase === 'lower' || letterCase === 'both'" class="ws-letter ws-letter-sm">{{ pair.lower }}</span>
          </div>
          <div class="ws-footer">
            <span class="ws-page-num">{{ i + 1 }} / {{ letterPairs.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { downloadWorksheetPDF } from '../../utils/worksheetPdf.js'

const emit = defineEmits(['close'])
const letterPairs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(u => ({ upper: u, lower: u.toLowerCase() }))
const generating = ref(false)
const printArea = ref(null)
const letterCase = ref('upper')

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    const suffix = letterCase.value === 'upper' ? 'Kapital' : letterCase.value === 'lower' ? 'Kecil' : 'Kapital-Kecil'
    await downloadWorksheetPDF(printArea.value, `Worksheet_MewarnaiAlfabet_${suffix}.pdf`)
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
.ws-toolbar {
  position: fixed; top: 0; left: 0; right: 0;
  background: linear-gradient(135deg, #176c33, #2E7D32);
  color: white; padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.ws-btn-close {
  background: rgba(255,255,255,0.2); color: white; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 18px; cursor: pointer; font-weight: 700;
}
.ws-toolbar-title { font-size: 15px; font-weight: 700; flex: 1; }
.ws-toolbar-options { display: flex; gap: 8px; align-items: center; }
.ws-select {
  background: white; color: #176c33; border: none;
  padding: 8px 12px; border-radius: 10px;
  font-weight: 700; font-size: 13px; cursor: pointer;
}
.ws-toolbar-actions { display: flex; gap: 8px; }
.ws-btn {
  background: white; color: #176c33; border: none;
  padding: 8px 16px; border-radius: 10px;
  font-weight: 700; font-size: 13px; cursor: pointer;
}
.ws-btn:hover { transform: scale(1.03); }
.ws-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }

.ws-print-area {
  width: 794px;
  margin: 0 auto;
  padding: 20px 30px;
}

.ws-page {
  width: 794px;
  display: flex;
  flex-direction: row;
  height: 1123px;
  background: #176c33;
  margin-bottom: 30px;
  padding: 30px 47px;
  page-break-after: always;
}

.ws-container {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 30px;
}

.ws-header-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px 0;
  margin-bottom: 30px;
}
.ws-header-table td {
  width: 50%;
  border: 2.5px solid #222;
  border-radius: 12px;
  padding: 10px 16px;
  vertical-align: middle;
  font-size: 20px;
  font-weight: 700;
  color: #222;
  font-family: 'helvetica', sans-serif;
}
.ws-header-title { text-align: center; }
.ws-header-name { font-size: 18px; }

.ws-letter-area {
  text-align: center;
  padding-top: 60px;
}
.ws-letter {
  display: block;
  font-weight: 900;
  font-size: 500px;
  line-height: 1;
  color: white;
  -webkit-text-stroke: 3px #222;
  paint-order: stroke fill;
  user-select: none;
}
.ws-letter-sm {
  font-size: 400px;
}

.ws-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1.5px solid #ddd;
}
.ws-page-num { font-size: 10px; color: #999; }

@media print {
  html, body { background: white; }
  .ws-toolbar { display: none; }
  .ws-wrapper { padding-top: 0; }
  .ws-print-area { padding: 0; width: 100%; }
  .ws-page { width: 100%; height: 297mm; margin-bottom: 0; }
  .ws-container { width: calc(100% - 60px); height: calc(100% - 60px); }
}
</style>
