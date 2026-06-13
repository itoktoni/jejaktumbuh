<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar" style="background: linear-gradient(135deg, #1565C0, #E3F2FD);">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:map-outline" class="ws-toolbar-icon" /> Geografi Indonesia</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" style="color: #0D47A1;" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box title-box">
            <span class="ws-title"><Icon icon="mdi:map-outline" class="ws-title-icon" /> Geografi Indonesia</span>
          </div>
          <div class="ws-header-box name-box">
            <span class="ws-label">Nama:</span>
            <div class="ws-name-line"></div>
          </div>
        </div>
        <div class="ws-geo-list">
          <div v-for="(item, i) in items" :key="i" class="ws-geo-row">
            <div class="ws-geo-box ws-geo-city">{{ item.city }}</div>
            <div class="ws-geo-arrow"><Icon icon="mdi:arrow-right" class="ws-geo-arrow-icon" /></div>
            <div class="ws-geo-box ws-geo-prov">{{ item.prov }}</div>
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

const items = [
  { city: 'Jakarta', prov: 'DKI Jakarta' },
  { city: 'Surabaya', prov: 'Jawa Timur' },
  { city: 'Bandung', prov: 'Jawa Barat' },
  { city: 'Medan', prov: 'Sumatera Utara' },
  { city: 'Makassar', prov: 'Sulawesi Selatan' },
  { city: 'Denpasar', prov: 'Bali' }
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
    await downloadWorksheetPDF(printArea.value, 'Worksheet_GeografiWs.pdf')
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
.ws-btn { background: white; color: #0D47A1; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; }
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
.ws-geo-list { display: flex; flex-direction: column; gap: 16px; flex: 1; }
.ws-geo-row { display: flex; align-items: center; gap: 12px; }
.ws-geo-box { border: 2px solid #ccc; border-radius: 10px; padding: 12px 20px; min-width: 200px; text-align: center; font-size: 16px; font-weight: 700; color: #333; }
.ws-geo-arrow { font-size: 20px; color: #aaa; }
.ws-geo-arrow-icon { width: 24px; height: 24px; color: #aaa; }
@media print { html, body { background: white; } .ws-toolbar { display: none; } .ws-wrapper { padding-top: 0; } .ws-print-area { padding: 0; } }
</style>
