<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:calculator-variant-outline" class="ws-toolbar-icon" /> Soal Cerita Matematika</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box ws-title-box">
            <span class="ws-title">Soal Cerita Matematika</span>
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
          <div v-for="(item, i) in items" :key="i" class="ws-story-item">
            <div class="ws-story-header">Soal {{ i + 1 }}</div>
            <div class="ws-story-text">{{ item.cerita }}</div>
            <div class="ws-answer-line">
              <span class="ws-answer-label">Jawaban:</span>
              <div class="ws-answer-dash"></div>
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

const items = [
  { cerita: 'Andi punya 5 permen. Ibu memberinya 3 lagi. Berapa permen Andi sekarang?', jawaban: '8 permen (5 + 3 = 8)' },
  { cerita: 'Siti punya 10 kelereng. Ia memberikan 4 ke temannya. Berapa sisa kelereng Siti?', jawaban: '6 kelereng (10 - 4 = 6)' },
  { cerita: 'Ada 3 kotak. Setiap kotak berisi 4 buah apel. Berapa jumlah apel semuanya?', jawaban: '12 apel (3 × 4 = 12)' }
]

const childName = computed(() => {
  const anak = anakStore.anakList.find(a => a.id === toolsStore.toolsAnakId)
  return anak ? anak.nama : ''
})

function todayStr() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_SoalCerita.pdf')
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
  background: linear-gradient(135deg, #F3E5F5, #E1BEE7);
  color: #6A1B9A; padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  font-family: 'helvetica', sans-serif;
}
.ws-btn-close {
  background: rgba(106,27,154,0.15); color: #6A1B9A; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 18px; cursor: pointer; font-weight: 700;
}
.ws-toolbar-title { font-size: 15px; font-weight: 700; flex: 1; }
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.ws-toolbar-actions { display: flex; gap: 8px; }
.ws-btn {
  background: white; color: #6A1B9A; border: none;
  padding: 8px 16px; border-radius: 10px;
  font-weight: 700; font-size: 13px; cursor: pointer;
  font-family: 'helvetica', sans-serif;
}
.ws-btn:hover { transform: scale(1.03); }
.ws-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ws-print-area { width: 794px; margin: 0px auto; padding: 20px 50px; background: white; font-family: 'helvetica', sans-serif; }
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
.ws-content { display: flex; flex-direction: column; gap: 18px; }
.ws-story-item {
  border: 2.5px solid #6A1B9A; border-radius: 12px;
  padding: 16px 20px; background: #F3E5F5;
}
.ws-story-header {
  font-size: 16px; font-weight: 700; color: #6A1B9A;
  margin-bottom: 8px;
}
.ws-story-text {
  font-size: 14px; color: #333; line-height: 1.6;
  margin-bottom: 12px;
}
.ws-answer-line { display: flex; align-items: center; gap: 8px; }
.ws-answer-label { font-size: 14px; font-weight: 700; color: #6A1B9A; white-space: nowrap; }
.ws-answer-dash {
  flex: 1; border-bottom: 2px dashed #aaa;
  min-height: 20px;
}
@media print {
  html, body { background: white; }
  .ws-toolbar { display: none; }
  .ws-wrapper { padding-top: 0; }
  .ws-print-area { padding: 0; width: 100%; }
}
</style>
