<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title"><Icon icon="mdi:pencil-outline" class="ws-toolbar-icon" /> Menebalkan Huruf</div>
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
      <div class="ws-header">
        <div class="ws-header-box title-box">
          <span class="ws-title">Menebalkan Huruf</span>
        </div>
        <div class="ws-header-box name-box">
          <span class="ws-label">Nama:</span>
          <div class="ws-name-line"></div>
        </div>
      </div>
      <div v-for="(page, pi) in pages" :key="pi" data-page>
        <div v-if="pages.length > 1" class="ws-section-title">Hal {{ pi + 1 }}</div>
        <div class="ws-rows" :class="page.length < 6 ? 'ws-rows-tall' : ''">
          <div v-for="(item, i) in page" :key="i" class="ws-row">
            <span class="ws-box ws-box-letter">{{ letterCase === 'both' ? item.display : displayLetter(item) }}</span>
            <span class="ws-box ws-box-trace">{{ letterCase === 'both' ? item.display : displayLetter(item) }}</span>
            <span class="ws-box ws-box-trace">{{ letterCase === 'both' ? item.display : displayLetter(item) }}</span>
            <span class="ws-box ws-box-trace">{{ letterCase === 'both' ? item.display : displayLetter(item) }}</span>
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

const letterPairs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(u => ({ upper: u, lower: u.toLowerCase() }))
const generating = ref(false)
const letterCase = ref('upper')
const printArea = ref(null)

function displayLetter(pair) {
  if (letterCase.value === 'upper') return pair.upper
  if (letterCase.value === 'lower') return pair.lower
  return `${pair.upper}${pair.lower}`
}

const pages = computed(() => {
  const chunk5 = (arr) => {
    const result = []
    for (let i = 0; i < arr.length; i += 5) {
      result.push(arr.slice(i, i + 5))
    }
    if (result.length > 1 && result[result.length - 1].length < 3) {
      const last = result.pop()
      result[result.length - 1] = result[result.length - 1].concat(last)
    }
    return result
  }

  if (letterCase.value === 'both') {
    const expanded = []
    for (const pair of letterPairs) {
      expanded.push({ upper: pair.upper, lower: pair.lower, display: pair.upper })
      expanded.push({ upper: pair.upper, lower: pair.lower, display: pair.lower })
    }
    return chunk5(expanded)
  }
  return chunk5(letterPairs)
})

async function downloadPDF() {
  generating.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    const suffix = letterCase.value === 'upper' ? 'Kapital' : letterCase.value === 'lower' ? 'Kecil' : 'Kapital-Kecil'
    await downloadWorksheetPDF(printArea.value, `Worksheet_MenebalkanHuruf_${suffix}.pdf`)
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
  background: linear-gradient(135deg, #2E7D32, #43A047);
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
.ws-toolbar-options { display: flex; gap: 8px; align-items: center; }
.ws-select {
  background: white; color: #2E7D32; border: none;
  padding: 8px 12px; border-radius: 10px;
  font-weight: 700; font-size: 13px; cursor: pointer;
  font-family: 'helvetica', sans-serif;
}
.ws-toolbar-actions { display: flex; gap: 8px; }

.ws-btn {
  background: white; color: #2E7D32; border: none;
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

.ws-section-title {
  font-size: 12px;
  color: #aaa;
  margin: 10px 0 5px;
  text-align: right;
}

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
  font-size: 80px;
  color: #222;
  background: #f0f0f0;
}
.ws-box-trace {
  font-size: 80px;
  color: #eeeeee;
  background: white;
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
