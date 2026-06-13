# Cara Menambahkan Feature Worksheet di WorksheetPage.vue

Dokumen ini menjelaskan cara menambahkan worksheet baru ke sistem. Ada **3 tipe** worksheet yang didukung.

---

## Ringkasan Arsitektur

```
src/pages/WorksheetPage.vue          ← Halaman utama, daftar semua worksheet
src/pages/worksheet/                  ← Folder komponen template full-page
  ├── MewarnaiAlfabet.vue             ← Contoh: mewarnai huruf (jsPDF)
  ├── MewarnaiAngka.vue               ← Contoh: mewarnai angka (jsPDF)
  ├── MenulisHuruf.vue                ← Contoh: menulis huruf (jsPDF)
  ├── MenulisAngka.vue                ← Contoh: menulis angka (jsPDF)
  └── MenulisKotak.vue                ← Contoh: menulis di kotak (dompdf.js)
src/utils/worksheetGenerator.js       ← Generator helper (word search, maze, dll)
```

Library PDF yang digunakan:
- **jsPDF** — untuk worksheet per-halaman (satu page = satu item besar). Digunakan di MewarnaiAlfabet, MewarnaiAngka, MenulisHuruf, MenulisAngka.
- **dompdf.js** — untuk worksheet dengan banyak item per halaman + auto pagination. Digunakan di MenulisKotak.

Setiap worksheet punya 3 bagian:
1. **Card entry** — tombol di grid worksheet (data di `worksheetTypes[]`)
2. **Generator function** — fungsi yang menghasilkan data worksheet
3. **Renderer** — cara menampilkan output (PDF inline, full-page template, atau API)

---

## TIPE 1: Worksheet dengan PDF Inline (Paling Umum)

Worksheet yang langsung generate PDF dari data. Cocok untuk worksheet sederhana.

### Langkah 1: Tambah Generator Function

Di `WorksheetPage.vue`, tambahkan fungsi generator di section `GENERATOR FUNCTIONS`:

```js
// -- NAMA WORKSHEET (usia) --
function generateNamaWorksheet() {
  // Buat data worksheet
  const items = [
    { soal: '...', jawaban: '...' },
    // ... lebih banyak item
  ]
  return {
    type: 'nama_worksheet',    // ← HARUS unik, dipakai untuk routing
    title: 'Judul Worksheet',
    emoji: '🔢',               // ← Emoji untuk card
    bg: '#F3E5F5',             // ← Warna background card
    items: items               // ← Data soal/item
  }
}
```

**Penting:** `type` harus unik karena dipakai untuk:
- Routing di `generateLocal()` → memutuskan buka template atau PDF
- Routing di `downloadPDF()` → memutuskan renderer mana yang dipakai

### Langkah 2: Tambah Card Entry

Tambahkan object di array `worksheetTypes[]`:

```js
{
  id: 'nama_worksheet',           // ← Unik, untuk key Vue
  emoji: '🔢',                    // ← Emoji card
  title: 'Judul Worksheet',       // ← Judul di card
  desc: 'Deskripsi singkat',      // ← Deskripsi 1-2 baris
  age: '4-7',                     // ← Filter usia: '1-3', '3-5', '4-7', '6-9', '7+'
  ageLabel: '4-7 thn',           // ← Label usia di card
  bg: '#F3E5F5',                 // ← Warna background card
  generate: generateNamaWorksheet // ← Reference ke generator function
}
```

**Pilihan `age` yang tersedia:**
- `'1-3'` — filter "1-3 tahun"
- `'3-5'` — filter "3-5 tahun"
- `'4-7'` — filter "4-7 tahun"
- `'6-9'` — filter "6-9 tahun"
- `'7+'` — filter "7+ tahun"

### Langkah 3: Tambah PDF Renderer

Di fungsi `downloadPDF()`, tambahkan block rendering sebelum comment `// ============ END ============`:

```js
// ============ NAMA WORKSHEET (usia) ============
if (data.type === 'nama_worksheet') {
  drawBorder()
  let y = drawHeader(30)

  // Judul instruksi
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)
  doc.text('Instruksi untuk anak:', M, y)
  y += 12

  // Render item per baris
  for (let i = 0; i < data.items.length; i++) {
    // Auto page break
    if (y > H - 40) { doc.addPage(); drawBorder(); y = 30 }

    // Box container
    doc.setDrawColor(183, 217, 188)
    doc.setLineWidth(0.3)
    doc.roundedRect(M, y - 3, CW, 18, 2, 2)

    // Konten
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(60, 60, 60)
    doc.text(`${i + 1}. ${data.items[i].soal}`, M + 5, y + 7)

    // Garis jawaban
    doc.setLineDashPattern([2, 2], 0)
    doc.line(M + 5, y + 12, M + CW - 5, y + 12)
    doc.setLineDashPattern([], 0)

    y += 22
  }

  // Save PDF
  doc.save(`Worksheet_${childName.value.replace(/\s+/g, '_')}_NamaWorksheet.pdf`)
  return
}
```

### Helper yang Tersedia di `downloadPDF()`

| Fungsi/Variable | Keterangan |
|---|---|
| `drawBorder()` | Gambar border double di setiap halaman |
| `drawHeader(y)` | Gambar header (judul + nama + tanggal), return y baru |
| `W` | Lebar A4 = 210mm |
| `H` | Tinggi A4 = 297mm` |
| `M` | Margin = 20mm |
| `CW` | Content width = W - 2*M = 170mm |
| `childName.value` | Nama anak yang dipilih |
| `doc` | Instance jsPDF |

### Pola Auto Page Break

```js
if (y > H - 40) {
  doc.addPage()
  drawBorder()
  y = 30
}
```

---

## TIPE 2: Worksheet Full-Page Template

Worksheet yang membuka halaman penuh dengan preview + PDF generation sendiri. Cocok untuk worksheet yang butuh layout khusus (satu halaman per item).

### Langkah 1: Buat Komponen Vue

Buat file baru di `src/pages/worksheet/NamaWorksheet.vue`:

```vue
<template>
  <div class="ws-wrapper">
    <!-- Toolbar -->
    <div class="ws-toolbar">
      <button class="ws-btn-close" @click="$emit('close')">✕</button>
      <div class="ws-toolbar-title">🔢 Judul Worksheet</div>
      <div class="ws-toolbar-actions">
        <button class="ws-btn" @click="downloadPDF" :disabled="generating">
          {{ generating ? 'Membuat PDF...' : '⬇️ Download PDF' }}
        </button>
      </div>
    </div>

    <!-- Preview Pages -->
    <div class="ws-container">
      <div v-for="(item, i) in items" :key="i" class="ws-page">
        <div class="ws-header">
          <div class="ws-header-box title-box">
            <span class="ws-title">Judul</span>
          </div>
          <div class="ws-header-box name-box">
            <span class="ws-label">Nama:</span>
            <div class="ws-name-line"></div>
          </div>
        </div>
        <div class="ws-letter-area">
          <!-- Konten per halaman -->
          <span class="ws-letter">{{ item }}</span>
        </div>
        <div class="ws-footer">
          <span class="ws-page-num">{{ i + 1 }} / {{ items.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { jsPDF } from 'jspdf'

const emit = defineEmits(['close'])
const generating = ref(false)
const items = [/* data */]

function downloadPDF() {
  generating.value = true
  setTimeout(() => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const W = 210, H = 297, M = 15, CW = W - M * 2

    for (let i = 0; i < items.length; i++) {
      if (i > 0) doc.addPage()

      // Border
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(1.5)
      doc.roundedRect(10, 10, W - 20, H - 20, 4, 4)

      // Header boxes
      doc.setDrawColor(34, 34, 34)
      doc.setLineWidth(0.8)
      doc.roundedRect(M, 16, CW / 2 - 3, 18, 3, 3)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(34, 34, 34)
      doc.text('Judul', M + CW / 4 - 1.5, 28, { align: 'center' })

      doc.roundedRect(M + CW / 2 + 3, 16, CW / 2 - 3, 18, 3, 3)
      doc.setFontSize(16)
      doc.text('Nama:', M + CW / 2 + 9, 28)

      // Giant content centered
      const centerX = W / 2
      const centerY = H / 2
      doc.setFontSize(650)
      doc.setTextColor(255, 255, 255)
      doc.setDrawColor(34, 34, 34)
      doc.setLineWidth(2)
      doc.text(String(items[i]), centerX, centerY + 90, {
        align: 'center',
        renderingMode: 1  // ← Outline only (untuk diwarnai)
      })

      // Page number
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(M, H - 20, M + CW, H - 20)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text(`${i + 1} / ${items.length}`, W / 2, H - 14, { align: 'center' })
    }

    doc.save('Worksheet_NamaWorksheet.pdf')
    generating.value = false
  }, 100)
}
</script>

<style>
/* Copy style dari MewarnaiAlfabet.vue atau MewarnaiAngka.vue */
/* Ganti warna toolbar sesuai tema */
.ws-toolbar {
  background: linear-gradient(135deg, #warna1, #warna2);
}
</style>
```

**Penting untuk PDF:**
- `renderingMode: 1` = outline only (untuk mewarnai)
- `renderingMode: 0` = fill normal
- Font size besar (500-650) untuk huruf/angka yang bisa diwarnai

### Langkah 2: Register Komponen di WorksheetPage.vue

**Import** (di bagian import):
```js
import NamaWorksheet from './worksheet/NamaWorksheet.vue'
```

**Template** (di bagian overlay):
```vue
<div v-if="activeTemplate" class="fixed inset-0 z-[100] bg-white overflow-y-auto">
  <MewarnaiAlfabet v-if="activeTemplate === 'mewarnai_alfabet'" @close="activeTemplate = null" />
  <MewarnaiAngka v-if="activeTemplate === 'mewarnai_angka'" @close="activeTemplate = null" />
  <NamaWorksheet v-if="activeTemplate === 'nama_worksheet'" @close="activeTemplate = null" />
</div>
```

**Ref** (opsional, jika perlu akses dari parent):
```js
const namaWorksheetRef = ref(null)
```

### Langkah 3: Tambah Routing di `generateLocal()`

```js
async function generateLocal(ws) {
  generating.value = true
  try {
    const data = ws.generate()
    if (data.type === 'mewarnai_alfabet') {
      activeTemplate.value = 'mewarnai_alfabet'
    } else if (data.type === 'mewarnai_angka') {
      activeTemplate.value = 'mewarnai_angka'
    } else if (data.type === 'nama_worksheet') {      // ← TAMBAH INI
      activeTemplate.value = 'nama_worksheet'
    } else if (data.pdf) {
      data.pdf()
    } else {
      saveAndDownload(ws, data)
      downloadPDF(data, ws.title)
    }
  } catch (e) {
    console.error(e)
    alert('Gagal membuat worksheet.')
  } finally {
    generating.value = false
  }
}
```

### Langkah 4: Tambah Card Entry

Sama seperti Tipe 1 Langkah 2.

---

## TIPE 2b: Worksheet Full-Page dengan dompdf.js

Untuk worksheet yang butuh banyak item per halaman + auto pagination, gunakan **dompdf.js**. Contoh: `MenulisKotak.vue`.

### Kelebihan dompdf.js vs jsPDF
- **Auto pagination** — tidak perlu hitung page break manual
- **Vector PDF** — bukan image, bisa diedit, file lebih kecil
- **`pageBreak` attribute** — kontrol page break dari HTML

### Template Structure

```vue
<template>
  <div class="ws-wrapper">
    <div class="ws-toolbar">...</div>

    <!-- 1 container, bukan multiple ws-page -->
    <div ref="printArea" class="ws-print-area">
      <div class="ws-header">...</div>

      <template v-for="(page, pi) in pages" :key="pi">
        <!-- Page break sebelum halaman ke-2 dst -->
        <div v-if="pi > 0" pageBreak></div>

        <div class="ws-rows">
          <div v-for="(item, i) in page" :key="i" class="ws-row">
            <!-- Konten per baris -->
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
```

### Script

```js
import dompdf from 'dompdf.js'

async function downloadPDF() {
  const el = printArea.value
  const blob = await dompdf(el, {
    pagination: true,       // ← Auto pagination
    format: 'a4',
    backgroundColor: '#ffffff',
    compress: true
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Worksheet_Nama.pdf'
  a.click()
  URL.revokeObjectURL(url)
}
```

### CSS Penting untuk dompdf

```css
.ws-print-area {
  width: 794px;           /* ← A4 dalam pixel (210mm × 3.78) */
  margin: 0px auto;
  padding: 0px 50px 20px;
  background: white;
}
```

**Penting:**
- Width harus **794px** (bukan 210mm) — dompdf lebih akurat dengan pixel
- Gunakan `pageBreak` attribute di HTML untuk page break, bukan CSS `page-break-after`
- `pageBreak` di halaman pertama **tidak perlu** (`v-if="pi > 0"`)

---

## TIPE 3: Worksheet dari API

Worksheet yang mengambil data dari server. Cocok untuk konten dinamis.

### Langkah 1: Buat Generator Async

```js
async function generateNamaApi() {
  const res = await fetch('/api/endpoint')
  const data = await res.json()
  if (!data || !data.items) return null
  return {
    type: 'nama_api',
    title: 'Judul dari API',
    emoji: '📝',
    bg: '#FFF3E0',
    items: data.items
  }
}
```

### Langkah 2: Tambah Card dengan `isApi: true`

```js
{
  id: 'nama_api',
  emoji: '📝',
  title: 'Judul dari API',
  desc: 'Deskripsi',
  age: '6-9',
  ageLabel: '6-9 thn',
  bg: '#FFF3E0',
  isApi: true,                    // ← PENTING: flag ini memanggil generateFromApi()
  generate: generateNamaApi       // ← Fungsi async
}
```

### Langkah 3: Routing di `generateFromApi()`

```js
async function generateFromApi(ws) {
  generating.value = true
  try {
    const data = await ws.generate()
    if (data && data.items) {
      saveAndDownload(ws, data)
      downloadPDF(data, ws.title)
    }
  } catch (e) {
    alert('Gagal mengambil data dari server.')
  } finally {
    generating.value = false
  }
}
```

---

## Contoh Lengkap: Menambah Worksheet "Mewarnai Bentuk"

### Generator:
```js
function generateMewarnaiBentuk() {
  const bentuk = ['Lingkaran', 'Persegi', 'Segitiga', 'Bintang', 'Hati']
  return {
    type: 'mewarnai_bentuk',
    title: 'Mewarnai Bentuk',
    emoji: '⭐',
    bg: '#E0F2F1',
    items: bentuk.map(b => ({ name: b }))
  }
}
```

### Card Entry (di `worksheetTypes[]`):
```js
{
  id: 'mewarnai_bentuk',
  emoji: '⭐',
  title: 'Mewarnai Bentuk',
  desc: 'Mewarnai bentuk geometri dasar',
  age: '1-3',
  ageLabel: '1-3 thn',
  bg: '#E0F2F1',
  generate: generateMewarnaiBentuk
}
```

### PDF Renderer (di `downloadPDF()`):
```js
if (data.type === 'mewarnai_bentuk') {
  drawBorder()
  let y = drawHeader(30)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)
  doc.text('Warnai bentuk-bentuk berikut:', M, y)
  y += 12

  const shapes = {
    'Lingkaran': (cx, cy) => doc.circle(cx, cy, 15, 'S'),
    'Persegi': (cx, cy) => doc.rect(cx - 12, cy - 12, 24, 24, 'S'),
    'Segitiga': (cx, cy) => doc.lines([[0, -15], [15, 15], [-15, 15], [0, -15]], cx, cy + 5, [1, 1], 'S'),
    'Bintang': (cx, cy) => doc.text('⭐', cx, cy + 3, { align: 'center' }),
    'Hati': (cx, cy) => doc.text('❤️', cx, cy + 3, { align: 'center' })
  }

  const cols = 3
  const cellW = CW / cols - 5
  for (let i = 0; i < data.items.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = M + col * (cellW + 8)
    const ly = y + row * 50

    if (ly > H - 60) { doc.addPage(); drawBorder(); y = 30 }

    doc.setDrawColor(183, 217, 188)
    doc.setLineWidth(0.5)
    doc.roundedRect(x, ly, cellW, 40, 3, 3)

    const cx = x + cellW / 2
    const cy = ly + 18
    doc.setDrawColor(60, 60, 60)
    doc.setLineWidth(1)
    if (shapes[data.items[i].name]) shapes[data.items[i].name](cx, cy)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    doc.text(data.items[i].name, cx, ly + 37, { align: 'center' })
  }

  doc.save(`Worksheet_${childName.value.replace(/\s+/g, '_')}_MewarnaiBentuk.pdf`)
  return
}
```

---

## Checklist Saat Menambah Worksheet Baru

- [ ] Generator function ditambahkan (dengan `type` unik)
- [ ] Card entry ditambahkan di `worksheetTypes[]`
- [ ] Jika full-page template: komponen `.vue` dibuat, di-import, dan di-register di overlay
- [ ] Routing ditambahkan di `generateLocal()` (atau `generateFromApi()` jika API)
- [ ] PDF renderer ditambahkan di `downloadPDF()` (jika tipe inline)
- [ ] `type` konsisten antara generator, routing, dan renderer
- [ ] `age` sesuai target usia
- [ ] Test: klik card → preview muncul → download PDF berhasil

---

## Referensi Warna Card yang Sering Dipakai

| Warna | Hex | Keterangan |
|---|---|---|
| Biru Muda | `#E3F2FD` | Alfabet, huruf |
| Ungu Muda | `#F3E5F5` | Angka, matematika |
| Hijau Muda | `#E8F5E9` | Menulis, cerita |
| Oranye Muda | `#FFF3E0` | Mewarnai, kata |
| Pink Muda | `#FCE4EC` | Warna, lengkapi |
| Teal Muda | `#E0F2F1` | Bentuk, logika |
