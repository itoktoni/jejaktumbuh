import dompdf from 'dompdf.js'
import html2canvas from 'html2canvas'

export async function downloadWorksheetPDF(el, filename) {
  if (!el) return

  const pageEls = el.querySelectorAll('[data-page]')
  if (pageEls.length > 1) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    for (let i = 0; i < pageEls.length; i++) {
      if (i > 0) doc.addPage()
      const canvas = await html2canvas(pageEls[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297)
    }
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    const blob = await dompdf(el, {
      pagination: true,
      format: 'a4',
      backgroundColor: '#ffffff',
      compress: true
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
