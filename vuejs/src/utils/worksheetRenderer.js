import { createApp } from 'vue'

export function renderWorksheet(component, props = {}) {
  const printWindow = window.open('', '_blank', 'width=800,height=1000')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Worksheet</title>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Fredoka', sans-serif; }
        #app { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px; }
        .worksheet-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        @media print {
          body { background: white; }
          #app { padding: 0; gap: 0; }
          .worksheet-page { box-shadow: none; }
        }
        .print-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #176c33;
          color: white;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          font-family: 'Fredoka', sans-serif;
        }
        .print-bar button {
          background: white;
          color: #176c33;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          font-family: 'Fredoka', sans-serif;
        }
        .print-bar button:hover { opacity: 0.9; }
        @media print { .print-bar { display: none; } }
      </style>
    </head>
    <body>
      <div class="print-bar">
        <span>📝 Worksheet Preview</span>
        <div style="display:flex;gap:8px;">
          <button onclick="window.print()">🖨️ Print / Save PDF</button>
          <button onclick="window.close()">✕ Tutup</button>
        </div>
      </div>
      <div id="app" style="margin-top: 60px;"></div>
      <script type="module">
        import { createApp, h } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

        // Component will be injected
        const Component = window.__WORKSHEET_COMPONENT__
        const Props = window.__WORKSHEET_PROPS__

        createApp({
          render() {
            return h(Component, Props)
          }
        }).mount('#app')
      <\/script>
    </body>
    </html>
  `)

  printWindow.document.close()
}

export async function renderWorksheetFromTemplate(templatePath, props = {}) {
  const mod = await import(/* @vite-ignore */ templatePath)
  const component = mod.default || mod
  renderWorksheet(component, props)
}
