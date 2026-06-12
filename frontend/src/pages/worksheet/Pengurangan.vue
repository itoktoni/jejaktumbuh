<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:minus-circle-outline" class="ws-toolbar-icon" /> Pengurangan 1-10</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          <Icon icon="mdi:download" class="ws-dl-icon" /> {{ generating ? 'Membuat PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <div ref="printArea" class="ws-print-area">
        <div class="ws-header">
          <div class="ws-header-box title-box">
            <span class="ws-title"><Icon icon="mdi:minus-circle-outline" class="ws-title-icon" /> Pengurangan 1-10</span>
          </div>
          <div class="ws-header-box name-box">
            <span class="ws-label">Nama: {{ childName }}</span>
          </div>
          <div class="ws-header-box date-box">
            <span class="ws-label">{{ todayStr }}</span>
          </div>
        </div>
        <div class="ws-problems">
          <div v-for="(p, i) in problems" :key="i" class="ws-problem-card">
            <span class="ws-problem-num">{{ i + 1 }}.</span>
            <span class="ws-problem-text">{{ p.a }} − {{ p.b }} = ___</span>
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
  return anak ? anak.nama : '...'
})

const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

function generateProblems() {
  const arr = []
  const used = new Set()
  while (arr.length < 10) {
    const a = Math.floor(Math.random() * 9) + 2
    const b = Math.floor(Math.random() * (a - 1)) + 1
    const key = `${a}-${b}`
    if (a > b && !used.has(key)) {
      used.add(key)
      arr.push({ a, b })
    }
  }
  return arr
}

const problems = ref(generateProblems())

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    await downloadWorksheetPDF(printArea.value, 'Worksheet_Pengurangan_1-10.pdf')
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
  background: linear-gradient(135deg, #90CAF9, #42A5F5);
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
  background: white; color: #1565C0; border: none;
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
.ws-header { display: flex; gap: 8px; margin-bottom: 8mm; }
.ws-header-box {
  border: 2.5px solid #222; border-radius: 12px;
  padding: 10px 16px; display: flex; align-items: center;
}
.title-box { flex: 2; justify-content: center; }
.name-box { flex: 1.5; }
.date-box { flex: 1; }
.ws-title { font-size: 20px; font-weight: 700; color: #222; }
.ws-label { font-size: 14px; font-weight: 700; color: #222; white-space: nowrap; }
.ws-problems {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4mm 0;
}
.ws-problem-card {
  width: calc(50% - 5px);
  border: 2px solid #BBDEFB;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #E3F2FD;
}
.ws-problem-num {
  font-size: 14px;
  font-weight: 700;
  color: #666;
  min-width: 24px;
}
.ws-problem-text {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}
.ws-toolbar-icon { width: 18px; height: 18px; vertical-align: -3px; margin-right: 6px; }
.ws-dl-icon { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.ws-title-icon { width: 20px; height: 20px; vertical-align: -4px; margin-right: 6px; }
@media print {
  html, body { background: white; }
  .ws-toolbar { display: none; }
  .ws-wrapper { padding-top: 0; }
  .ws-print-area { padding: 0; }
}
</style>
