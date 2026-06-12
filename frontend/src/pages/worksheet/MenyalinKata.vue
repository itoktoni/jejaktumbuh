<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:square-edit-outline" class="ws-toolbar-icon" /> Menyalin Kata</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box ws-title-box">
            <span class="ws-title">Menyalin Kata</span>
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
          <div v-for="(item, i) in items" :key="i" class="ws-word-item">
            <div class="ws-word-row">
              <span class="ws-word-num">{{ i + 1 }}.</span>
              <span class="ws-word-text">{{ item }}</span>
            </div>
            <div class="ws-dashed-line"></div>
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

const items = ['Ibu', 'Ayah', 'Rumah', 'Buku', 'Kucing', 'Bunga', 'Matahari', 'Bintang', 'Gajah', 'Pohon']

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
    await downloadWorksheetPDF(printArea.value, 'Worksheet_MenyalinKata.pdf')
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
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  color: #E65100; padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  font-family: 'helvetica', sans-serif;
}
.ws-btn-close {
  background: rgba(230,81,0,0.15); color: #E65100; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 18px; cursor: pointer; font-weight: 700;
}
.ws-toolbar-title { font-size: 15px; font-weight: 700; flex: 1; }
.ws-toolbar-actions { display: flex; gap: 8px; }
.ws-btn {
  background: white; color: #E65100; border: none;
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
.ws-content { display: flex; flex-direction: column; gap: 8px; }
.ws-word-item { display: flex; flex-direction: column; }
.ws-word-row { display: flex; align-items: baseline; gap: 8px; padding: 4px 0; }
.ws-word-num { font-size: 16px; font-weight: 700; color: #E65100; min-width: 24px; }
.ws-word-text { font-size: 18px; font-weight: 700; color: #222; }
.ws-dashed-line {
  border-bottom: 2px dashed #ccc;
  margin: 2px 0 6px 32px;
  min-height: 10px;
}
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
@media print {
  html, body { background: white; }
  .ws-toolbar { display: none; }
  .ws-wrapper { padding-top: 0; }
  .ws-print-area { padding: 0; width: 100%; }
}
</style>
