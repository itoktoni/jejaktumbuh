<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:chart-bar" class="ws-toolbar-icon" /> Grafik Batang</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box ws-title-box">
            <span class="ws-title"><Icon icon="mdi:chart-bar" class="ws-title-icon" /> Grafik Batang</span>
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
          <div class="ws-chart-title">Jumlah Buah yang Disukai</div>
          <div class="ws-chart-preview">
            <div v-for="(d, i) in chartData" :key="i" class="ws-bar-row">
              <span class="ws-bar-label">{{ d.category }}</span>
              <div class="ws-bar-track">
                <div class="ws-bar-fill" :style="{ width: (d.value * 20) + '%' }"></div>
              </div>
              <span class="ws-bar-value">{{ d.value }}</span>
            </div>
          </div>
          <div class="ws-questions">
            <div v-for="(q, i) in questions" :key="i" class="ws-question">
              {{ i + 1 }}. {{ q }}
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

const categories = ['Apel', 'Pisang', 'Jeruk', 'Mangga']
const chartData = categories.map(c => ({
  category: c,
  value: Math.floor(Math.random() * 5) + 1
}))

const maxVal = Math.max(...chartData.map(d => d.value))
const maxCat = chartData.find(d => d.value === maxVal).category

const questions = [
  'Buah mana yang paling banyak?',
  'Buah mana yang paling sedikit?',
  'Berapa jumlah ' + chartData[0].category + ' dan ' + chartData[1].category + '?'
]

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_GrafikBatang.pdf')
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
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  color: #0D47A1; padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  font-family: 'helvetica', sans-serif;
}
.ws-btn-close {
  background: rgba(13,71,161,0.15); color: #0D47A1; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 18px; cursor: pointer; font-weight: 700;
}
.ws-toolbar-title { font-size: 15px; font-weight: 700; flex: 1; }
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.ws-title-icon { width: 20px; height: 20px; vertical-align: -4px; margin-right: 6px; }
.ws-toolbar-actions { display: flex; gap: 8px; }
.ws-btn {
  background: white; color: #0D47A1; border: none;
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
.ws-content { display: flex; flex-direction: column; gap: 16px; }
.ws-chart-title { font-size: 18px; font-weight: 700; color: #1565C0; text-align: center; }
.ws-chart-preview { display: flex; flex-direction: column; gap: 10px; }
.ws-bar-row { display: flex; align-items: center; gap: 10px; }
.ws-bar-label { font-size: 14px; font-weight: 700; color: #222; min-width: 60px; }
.ws-bar-track { flex: 1; height: 28px; background: #E3F2FD; border-radius: 6px; overflow: hidden; }
.ws-bar-fill { height: 100%; background: linear-gradient(135deg, #1565C0, #42A5F5); border-radius: 6px; transition: width 0.3s; }
.ws-bar-value { font-size: 16px; font-weight: 700; color: #1565C0; min-width: 20px; }
.ws-questions { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.ws-question {
  font-size: 14px; color: #222; padding: 8px 12px;
  background: #E3F2FD; border-radius: 8px;
  border-left: 4px solid #1565C0;
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
