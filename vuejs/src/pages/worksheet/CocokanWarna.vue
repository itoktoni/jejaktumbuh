<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:target" class="ws-toolbar-icon" /> Cocokan Warna</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
      <div class="ws-header">
        <div class="ws-header-box title-box">
          <span class="ws-title"><Icon icon="mdi:target" class="ws-title-icon" /> Cocokan Warna</span>
        </div>
        <div class="ws-header-box name-box">
          <span class="ws-label">Nama:</span>
          <div class="ws-name-line"></div>
        </div>
      </div>
      <div class="ws-match-list">
        <div v-for="(c, i) in colors" :key="i" class="ws-match-row">
          <div class="ws-match-left">
            <div class="ws-color-circle" :style="{ backgroundColor: c.hex }"></div>
            <span class="ws-color-name">{{ c.name }}</span>
          </div>
          <div class="ws-match-arrow">→</div>
          <div class="ws-match-right">
            <div class="ws-color-circle" :style="{ backgroundColor: shuffled[i].hex }"></div>
            <span class="ws-color-name">{{ shuffled[i].name }}</span>
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
const generating = ref(false)
const printArea = ref(null)

const colors = [
  { name: 'Merah', hex: '#E53935' },
  { name: 'Biru', hex: '#1E88E5' },
  { name: 'Kuning', hex: '#FDD835' },
  { name: 'Hijau', hex: '#43A047' },
  { name: 'Oranye', hex: '#FB8C00' },
  { name: 'Ungu', hex: '#8E24AA' }
]

const shuffled = computed(() => {
  const arr = [...colors]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
})

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_CocokanWarna.pdf')
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
  background: linear-gradient(135deg, #00897B, #E0F2F1);
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
  background: white; color: #00695C; border: none;
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
  flex: 1; border: 2.5px solid #222; border-radius: 12px;
  padding: 10px 16px; display: flex; align-items: center;
}
.title-box { justify-content: center; }
.ws-title { font-size: 20px; font-weight: 700; color: #222; }
.name-box { gap: 10px; }
.ws-label { font-size: 18px; font-weight: 700; color: #222; white-space: nowrap; }
.ws-name-line { flex: 1; border-bottom: 2.5px dashed #aaa; min-height: 22px; }

.ws-match-list { display: flex; flex-direction: column; gap: 14px; }
.ws-match-row { display: flex; align-items: center; gap: 12px; }
.ws-match-left, .ws-match-right {
  display: flex; align-items: center; gap: 10px;
  border: 2px solid #ccc; border-radius: 10px;
  padding: 10px 16px; min-width: 180px;
}
.ws-match-arrow { font-size: 20px; color: #aaa; }
.ws-color-circle { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
.ws-color-name { font-size: 16px; font-weight: 700; color: #333; }

.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.ws-title-icon { width: 20px; height: 20px; vertical-align: -4px; margin-right: 6px; }

@media print {
  html, body { background: white; }
  .ws-toolbar { display: none; }
  .ws-wrapper { padding-top: 0; }
  .ws-print-area { padding: 0; width: 100%; }
}
</style>
