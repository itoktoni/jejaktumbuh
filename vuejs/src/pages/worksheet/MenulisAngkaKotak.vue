<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:square-edit-outline" class="ws-toolbar-icon" /> Menulis Angka di Kotak</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
      <div class="ws-header">
        <div class="ws-header-box title-box">
          <span class="ws-title">Menulis Angka di Kotak</span>
        </div>
        <div class="ws-header-box name-box">
          <span class="ws-label">Nama:</span>
          <div class="ws-name-line"></div>
        </div>
      </div>
      <div v-for="(page, pi) in pages" :key="pi" data-page>
        <div class="ws-rows ws-rows-tall">
          <div v-for="(item, i) in page" :key="i" class="ws-row">
            <span class="ws-box ws-box-letter">{{ item }}</span>
            <span class="ws-box"></span>
            <span class="ws-box"></span>
            <span class="ws-box"></span>
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

const emit = defineEmits(['close'])

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const generating = ref(false)
const printArea = ref(null)

const pages = computed(() => {
  const result = []
  for (let i = 0; i < numbers.length; i += 5) {
    result.push(numbers.slice(i, i + 5))
  }
  return result
})

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_MenulisAngkaKotak_1-10.pdf')
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

.ws-wrapper { padding-top: 80px !important; }

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
  padding: 0px 50px 20px;
  background: white;
  font-family: 'helvetica', sans-serif;
}

.ws-header { display: flex; gap: 8px; margin-bottom: 20px; }
.ws-header-box {
  flex: 1; border: 2.5px solid #222; border-radius: 12px;
  padding: 10px 16px; display: flex; align-items: center;
}
.title-box { justify-content: center; }
.ws-title { font-size: 20px; font-weight: 700; color: #222; }
.name-box { gap: 10px; }
.ws-label { font-size: 18px; font-weight: 700; color: #222; white-space: nowrap; }
.ws-name-line { flex: 1; border-bottom: 2.5px dashed #aaa; min-height: 22px; }

.ws-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 10px;
}
.ws-rows-tall .ws-box {
  height: 170px;
}
.ws-row {
  display: flex;
  gap: 10px;
}
.ws-box {
  flex: 1;
  border: 2px solid #ccc;
  border-radius: 6px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 32px;
  color: #e0e0e0;
  user-select: none;
}
.ws-box-letter {
  font-size: 100px;
  color: #222;
  background: #f0f0f0;
}

.ws-footer { text-align: center; padding-top: 10px; border-top: 1px solid #eee; }
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
