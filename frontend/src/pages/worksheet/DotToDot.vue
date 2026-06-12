<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:link-variant" class="ws-toolbar-icon" /> Hubungkan Titik</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box ws-title-box">
            <span class="ws-title"><Icon icon="mdi:link-variant" class="ws-title-icon" /> Hubungkan Titik</span>
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
          <div class="ws-dot-area">
            <div v-for="(p, i) in points" :key="i" class="ws-dot" :style="{ left: p.x + '%', top: p.y + '%' }">
              <span class="ws-dot-num">{{ i + 1 }}</span>
            </div>
          </div>
          <div class="ws-hint">Gambar apa yang terbentuk? <Icon icon="mdi:star" class="ws-hint-icon" /></div>
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

const points = [
  { x: 50, y: 5 },
  { x: 62, y: 35 },
  { x: 95, y: 38 },
  { x: 70, y: 58 },
  { x: 80, y: 90 },
  { x: 50, y: 72 },
  { x: 20, y: 90 },
  { x: 30, y: 58 },
  { x: 5, y: 38 },
  { x: 38, y: 35 }
]

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_HubungkanTitik.pdf')
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
  background: linear-gradient(135deg, #E0F2F1, #B2DFDB);
  color: #00695C; padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  font-family: 'helvetica', sans-serif;
}
.ws-btn-close {
  background: rgba(0,105,92,0.15); color: #00695C; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 18px; cursor: pointer; font-weight: 700;
}
.ws-toolbar-title { font-size: 15px; font-weight: 700; flex: 1; }
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.ws-title-icon { width: 20px; height: 20px; vertical-align: -4px; margin-right: 6px; }
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
.ws-dot-area {
  position: relative; width: 100%; max-width: 400px; height: 350px;
  background: #E0F2F1; border: 2px solid #00897B; border-radius: 12px;
}
.ws-dot {
  position: absolute; transform: translate(-50%, -50%);
  display: flex; align-items: center; justify-content: center;
}
.ws-dot-num {
  font-size: 14px; font-weight: 700; color: #00695C;
  background: white; border: 2px solid #00897B;
  border-radius: 50%; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
}
.ws-hint {
  font-size: 18px; font-weight: 700; color: #00695C;
  text-align: center; padding: 8px 16px;
  background: #E0F2F1; border-radius: 8px;
}
.ws-hint-icon { width: 20px; height: 20px; vertical-align: -4px; color: #00695C; }
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
