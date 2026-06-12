<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:square-edit-outline" class="ws-toolbar-icon" /> Menulis Angka (1-10)</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
      <div v-for="(num, i) in numbers" :key="num">
        <div class="ws-header">
          <div class="ws-header-box title-box">
            <span class="ws-title">Menulis Angka {{ num }}</span>
          </div>
          <div class="ws-header-box name-box">
            <span class="ws-label">Nama:</span>
            <div class="ws-name-line"></div>
          </div>
        </div>
        <div class="ws-guide-section">
          <div class="ws-guide-label">Contoh:</div>
          <div class="ws-guide-box">
            <span class="ws-guide-letter">{{ num }}</span>
          </div>
        </div>
        <div class="ws-practice-section">
          <div class="ws-practice-label">Latihan:</div>
          <div v-for="n in 5" :key="n" class="ws-practice-row">
            <span class="ws-practice-hint">{{ num }}</span>
            <div class="ws-practice-line"></div>
          </div>
        </div>
        <div class="ws-footer">
          <span class="ws-page-num">{{ i + 1 }} / {{ numbers.length }}</span>
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

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const generating = ref(false)
const printArea = ref(null)

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_MenulisAngka_1-10.pdf')
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
  background: linear-gradient(135deg, #6A1B9A, #8E24AA);
  color: white; padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  font-family: 'helvetica', sans-serif;
}

.ws-btn-close {
  background: rgba(255,255,255,0.2); color: white; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 18px; cursor: pointer; font-weight: 700;
}

.ws-toolbar-title { font-size: 15px; font-weight: 700; flex: 1; }
.ws-toolbar-actions { display: flex; gap: 8px; }

.ws-btn {
  background: white; color: #6A1B9A; border: none;
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

.ws-header { display: flex; gap: 8px; margin-bottom: 6mm; }
.ws-header-box {
  flex: 1; border: 2.5px solid #222; border-radius: 12px;
  padding: 10px 16px; display: flex; align-items: center;
}
.title-box { justify-content: center; }
.ws-title { font-size: 20px; font-weight: 700; color: #222; }
.name-box { gap: 10px; }
.ws-label { font-size: 18px; font-weight: 700; color: #222; white-space: nowrap; }
.ws-name-line { flex: 1; border-bottom: 2.5px dashed #aaa; min-height: 22px; }

.ws-guide-section {
  margin-bottom: 8mm;
  border: 2px solid #222;
  border-radius: 12px;
  padding: 4mm 6mm;
  flex-shrink: 0;
}
.ws-guide-label { font-size: 14px; font-weight: 700; color: #666; margin-bottom: 2mm; }
.ws-guide-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80mm;
  padding-bottom: 3rem;
}
.ws-guide-letter {
  font-weight: 900;
  color: #e6e6e6;
  font-size: 400px;
  line-height: 0;
  user-select: none;
}

.ws-practice-section { flex: 1; display: flex; flex-direction: column; }
.ws-practice-label { font-size: 14px; font-weight: 700; color: #666; margin-bottom: 3mm; }
.ws-practice-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6mm;
  position: relative;
  height: 28mm;
}
.ws-practice-hint {
  font-weight: 900;
  color: #e0e0e0;
  font-size: 100px;
  line-height: 1;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
  user-select: none;
}
.ws-practice-line {
  flex: 1;
  border-top: 2px dotted #ccc;
  border-bottom: 2px solid #ccc;
  height: 70px;
  margin-left: 50px;
}

.ws-footer { text-align: center; padding-top: 4mm; border-top: unset; }
.ws-page-num { font-size: 10px; color: #999; }

.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }

@media print {
  html, body { background: white; }
  .ws-toolbar { display: none; }
  .ws-wrapper { padding-top: 0; }
  .ws-print-area { padding: 0; width: 100%; }
}
</style>
