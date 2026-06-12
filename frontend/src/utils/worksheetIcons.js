import { Icon } from '@iconify/vue'

export const WORKSHEET_ICONS = {
  crayon: 'mdi:crayon-outline',
  numeric: 'mdi:counter',
  pencil: 'mdi:pencil-outline',
  pencilBox: 'mdi:square-edit-outline',
  fileEdit: 'mdi:file-document-edit-outline',
  wave: 'mdi:wave',
  target: 'mdi:target',
  alphabet: 'mdi:alphabet-latin',
  foodApple: 'mdi:food-apple-outline',
  cat: 'mdi:cat',
  dog: 'mdi:dog',
  rabbit: 'mdi:rabbit',
  fish: 'mdi:fish',
  bird: 'mdi:bird',
  butterfly: 'mdi:butterfly-outline',
  palette: 'mdi:palette-outline',
  shape: 'mdi:shape-outline',
  circle: 'mdi:circle-outline',
  square: 'mdi:square-outline',
  triangle: 'mdi:triangle-outline',
  heart: 'mdi:heart-outline',
  plus: 'mdi:plus-circle-outline',
  minus: 'mdi:minus-circle-outline',
  link: 'mdi:link-variant',
  star: 'mdi:star-outline',
  multiplication: 'mdi:multiplication',
  division: 'mdi:division',
  message: 'mdi:message-text-outline',
  chartBar: 'mdi:chart-bar',
  magnify: 'mdi:magnify',
  flag: 'mdi:flag-checkered',
  bookOpen: 'mdi:book-open-outline',
  bookshelf: 'mdi:bookshelf',
  calculator: 'mdi:calculator-variant-outline',
  home: 'mdi:home-outline',
  map: 'mdi:map-outline',
  fruitCherry: 'mdi:fruit-cherries',
  grape: 'mdi:fruit-grapes-outline',
  watermelon: 'mdi:fruit-watermelon',
  citrus: 'mdi:fruit-citrus',
  strawberry: 'mdi:fruit-cherries',
  banana: 'mdi:fruit-cherries',
  abacus: 'mdi:abacus',
  checkBold: 'mdi:check-bold',
  closeThick: 'mdi:close-thick',
  arrowRight: 'mdi:arrow-right',
  grid: 'mdi:grid',
  table: 'mdi:table',
  list: 'mdi:format-list-bulleted',
  shoePrint: 'mdi:shoe-print',
  umbrella: 'mdi:umbrella-outline',
  toothbrush: 'mdi:toothbrush-paste',
  pillow: 'mdi:bed-outline',
  pencilRuler: 'mdi:pencil-ruler',
  backpack: 'mdi:bag-personal-outline',
  clock: 'mdi:clock-outline',
  mirror: 'mdi:mirror',
  lamp: 'mdi:lamp-outline',
  desk: 'mdi:desk-lamp-outline',
  wardrobe: 'mdi:wardrobe-outline',
  shoeSneaker: 'mdi:shoe-sneaker'
}

const iconCache = new Map()

export async function preloadIcon(iconName, size = 48) {
  const cacheKey = `${iconName}:${size}`
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey)

  try {
    const [prefix, name] = iconName.split(':')
    const url = `https://api.iconify.design/${prefix}/${name}.svg?height=${size}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Icon fetch failed: ${res.status}`)
    const svgText = await res.text()

    const dataUri = await svgToPngDataUri(svgText, size)
    iconCache.set(cacheKey, dataUri)
    return dataUri
  } catch (e) {
    console.warn(`Failed to preload icon ${iconName}:`, e)
    iconCache.set(cacheKey, null)
    return null
  }
}

async function svgToPngDataUri(svgString, size) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = 2
      canvas.width = size * scale
      canvas.height = size * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(blobUrl)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      reject(new Error('SVG to PNG conversion failed'))
    }
    img.src = blobUrl
  })
}

export async function preloadIcons(iconNames, size = 48) {
  const unique = [...new Set(iconNames.filter(Boolean))]
  await Promise.all(unique.map(name => preloadIcon(name, size)))
}

export function getIconDataUri(iconName, size = 48) {
  return iconCache.get(`${iconName}:${size}`) || null
}

export function drawIconInPDF(doc, iconName, x, y, size) {
  const dataUri = getIconDataUri(iconName, size)
  if (dataUri) {
    doc.addImage(dataUri, 'PNG', x, y, size, size)
    return true
  }
  return false
}

export { Icon }
