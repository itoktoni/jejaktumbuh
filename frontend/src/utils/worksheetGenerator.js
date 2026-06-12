// Worksheet Generator Utilities - All code-generated, no storage needed

// ============ WORD SEARCH PUZZLE ============
export function generateWordSearch(words, size = 10) {
  const grid = Array.from({ length: size }, () => Array(size).fill(''))
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
  ]

  const placed = []

  for (const word of words) {
    const upper = word.toUpperCase()
    let attempts = 0
    let success = false

    while (attempts < 50 && !success) {
      const dir = directions[Math.floor(Math.random() * 2)]
      const maxRow = dir[0] === 0 ? size : size - upper.length
      const maxCol = dir[1] === 0 ? size : size - upper.length
      const startRow = Math.floor(Math.random() * maxRow)
      const startCol = Math.floor(Math.random() * maxCol)

      let canPlace = true
      for (let i = 0; i < upper.length; i++) {
        const r = startRow + i * dir[0]
        const c = startCol + i * dir[1]
        if (grid[r][c] !== '' && grid[r][c] !== upper[i]) {
          canPlace = false
          break
        }
      }

      if (canPlace) {
        for (let i = 0; i < upper.length; i++) {
          const r = startRow + i * dir[0]
          const c = startCol + i * dir[1]
          grid[r][c] = upper[i]
        }
        placed.push(upper)
        success = true
      }
      attempts++
    }
  }

  // Fill empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * 26)]
      }
    }
  }

  return { grid, words: placed, size }
}

// ============ MAZE GENERATOR (Recursive Backtracking) ============
export function generateMaze(cols = 10, rows = 10) {
  // Each cell: { top, right, bottom, left } walls (true = wall exists)
  const cells = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ top: true, right: true, bottom: true, left: true, visited: false }))
  )

  const stack = []
  const dirs = [
    { dr: -1, dc: 0, wall: 'top', opposite: 'bottom' },
    { dr: 0, dc: 1, wall: 'right', opposite: 'left' },
    { dr: 1, dc: 0, wall: 'bottom', opposite: 'top' },
    { dr: 0, dc: -1, wall: 'left', opposite: 'right' }
  ]

  cells[0][0].visited = true
  stack.push([0, 0])

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1]
    const neighbors = []

    for (const d of dirs) {
      const nr = r + d.dr
      const nc = c + d.dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !cells[nr][nc].visited) {
        neighbors.push({ nr, nc, wall: d.wall, opposite: d.opposite })
      }
    }

    if (neighbors.length > 0) {
      const { nr, nc, wall, opposite } = neighbors[Math.floor(Math.random() * neighbors.length)]
      cells[r][c][wall] = false
      cells[nr][nc][opposite] = false
      cells[nr][nc].visited = true
      stack.push([nr, nc])
    } else {
      stack.pop()
    }
  }

  // Remove entry and exit walls
  cells[0][0].left = false
  cells[rows - 1][cols - 1].right = false

  // Clean visited flags
  for (const row of cells) {
    for (const cell of row) delete cell.visited
  }

  return { cells, cols, rows }
}

// ============ DOT-TO-DOT ============
export function generateDotToDot() {
  const shapes = [
    { name: 'Bintang', emoji: '⭐', points: [
      [50, 10], [61, 35], [90, 35], [67, 52], [76, 80], [50, 63], [24, 80], [33, 52], [10, 35], [39, 35]
    ]},
    { name: 'Rumah', emoji: '🏠', points: [
      [30, 80], [30, 45], [50, 25], [70, 45], [70, 80]
    ]},
    { name: 'Ikan', emoji: '🐟', points: [
      [20, 50], [35, 35], [55, 40], [70, 35], [85, 50], [70, 65], [55, 60], [35, 65], [20, 50]
    ]},
    { name: 'Pohon', emoji: '🌳', points: [
      [50, 15], [35, 35], [25, 55], [40, 55], [40, 85], [60, 85], [60, 55], [75, 55], [65, 35], [50, 15]
    ]},
    { name: 'Kucing', emoji: '🐱', points: [
      [35, 25], [30, 10], [40, 20], [50, 15], [60, 20], [70, 10], [65, 25], [75, 40], [75, 60], [65, 75], [50, 80], [35, 75], [25, 60], [25, 40], [35, 25]
    ]}
  ]
  return shapes[Math.floor(Math.random() * shapes.length)]
}

// ============ BAR CHART DATA ============
export function generateBarChart() {
  const themes = [
    { title: 'Buah Favorit', categories: ['Apel', 'Pisang', 'Jeruk', 'Anggur', 'Mangga'], emoji: '🍎' },
    { title: 'Hewan Peliharaan', categories: ['Kucing', 'Anjing', 'Ikan', 'Kelinci', 'Burung'], emoji: '🐱' },
    { title: 'Warna Favorit', categories: ['Merah', 'Biru', 'Hijau', 'Kuning', 'Pink'], emoji: '🎨' },
    { title: 'Makanan Favorit', categories: ['Nasi', 'Mie', 'Roti', 'Bubur', 'Kentang'], emoji: '🍚' }
  ]

  const theme = themes[Math.floor(Math.random() * themes.length)]
  const values = theme.categories.map(() => Math.floor(Math.random() * 5) + 1)
  const maxVal = Math.max(...values)
  const maxIdx = values.indexOf(maxVal)
  const total = values.reduce((a, b) => a + b, 0)

  return {
    ...theme,
    values,
    maxCategory: theme.categories[maxIdx],
    maxValue: maxVal,
    total,
    questions: [
      `${theme.title} apa yang paling banyak?`,
      `Berapa jumlah semua ${theme.title.toLowerCase()}?`
    ],
    answers: [
      theme.categories[maxIdx],
      String(total)
    ]
  }
}

// ============ VERTICAL MATH WITH ICONS ============
export function generateVerticalMath(operation = 'addition', difficulty = 'easy') {
  const max = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50
  const items = []

  for (let i = 0; i < 8; i++) {
    let a = Math.floor(Math.random() * max) + 1
    let b = Math.floor(Math.random() * max) + 1
    let op = '+'
    let answer

    if (operation === 'subtraction') {
      op = '-'
      if (a < b) [a, b] = [b, a]
      answer = a - b
    } else if (operation === 'multiplication') {
      a = Math.floor(Math.random() * 5) + 1
      b = Math.floor(Math.random() * 5) + 1
      op = '×'
      answer = a * b
    } else {
      answer = a + b
    }

    items.push({ a, b, op, answer, icon: '⭐' })
  }

  return { items, operation, difficulty }
}

// ============ FILL IN THE BLANKS ============
export function generateFillBlanks() {
  const wordSets = {
    hewan: ['KUCING', 'ANJING', 'GAJAH', 'ULAR', 'IKAN', 'BURUNG', 'KUDA', 'SAPI', 'AYAM', 'KELINCI'],
    buah: ['APEL', 'PISANG', 'JERUK', 'MANGGA', 'ANGGUR', 'SEMANGKA', 'STROBERI', 'MELON', 'PEPAYA', 'KELAPA'],
    benda: ['MEJA', 'KURSI', 'PINTU', 'JENDELA', 'BUKU', 'PENSIL', 'SEPATU', 'TAS', 'JAM', 'KACA'],
    tubuh: ['MATA', 'HIDUNG', 'MULUT', 'TELANGA', 'TANGAN', 'KAKI', 'KEPALA', 'RAMBUT', 'GIGI', 'JARI']
  }

  const themes = Object.keys(wordSets)
  const theme = themes[Math.floor(Math.random() * themes.length)]
  const words = wordSets[theme]
  const selected = words.sort(() => Math.random() - 0.5).slice(0, 6)

  const items = selected.map(word => {
    const blankCount = word.length <= 4 ? 1 : 2
    const indices = []
    while (indices.length < blankCount) {
      const idx = Math.floor(Math.random() * word.length)
      if (!indices.includes(idx) && idx !== 0 && idx !== word.length - 1) {
        indices.push(idx)
      }
    }
    indices.sort()

    const display = word.split('').map((ch, i) => indices.includes(i) ? '_' : ch).join(' ')
    const answer = indices.map(i => word[i]).join(', ')

    return { word, display, answer, blankIndices: indices }
  })

  return { theme, items }
}

// ============ GEOGRAPHY MATCHING ============
export function generateGeography() {
  const regions = [
    { city: 'Jakarta', province: 'DKI Jakarta', island: 'Jawa' },
    { city: 'Surabaya', province: 'Jawa Timur', island: 'Jawa' },
    { city: 'Bandung', province: 'Jawa Barat', island: 'Jawa' },
    { city: 'Medan', province: 'Sumatera Utara', island: 'Sumatera' },
    { city: 'Makassar', province: 'Sulawesi Selatan', island: 'Sulawesi' },
    { city: 'Denpasar', province: 'Bali', island: 'Bali' },
    { city: 'Semarang', province: 'Jawa Tengah', island: 'Jawa' },
    { city: 'Palembang', province: 'Sumatera Selatan', island: 'Sumatera' },
    { city: 'Pontianak', province: 'Kalimantan Barat', island: 'Kalimantan' },
    { city: 'Manado', province: 'Sulawesi Utara', island: 'Sulawesi' },
    { city: 'Padang', province: 'Sumatera Barat', island: 'Sumatera' },
    { city: 'Yogyakarta', province: 'DI Yogyakarta', island: 'Jawa' },
    { city: 'Malang', province: 'Jawa Timur', island: 'Jawa' },
    { city: 'Balikpapan', province: 'Kalimantan Timur', island: 'Kalimantan' },
    { city: 'Ambon', province: 'Maluku', island: 'Maluku' }
  ]

  const selected = regions.sort(() => Math.random() - 0.5).slice(0, 5)
  const cities = selected.map(r => r.city)
  const provinces = selected.map(r => r.province).sort(() => Math.random() - 0.5)

  return { items: selected, cities, provinces }
}
