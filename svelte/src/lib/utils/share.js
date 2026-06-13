function generateRefCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function shareProgress(data) {
  const { title, category, emoji, color, points, maxPoints, notes, childName, isComplete } = data
  const refCode = generateRefCode()
  const text = isComplete
    ? `🏆 ${childName} menyelesaikan "${title}" dengan ${maxPoints} poin!\n\nKategori: ${category}\nReferral: ${refCode}`
    : `💪 Progress "${title}": ${points}/${maxPoints} poin\n\nAnak: ${childName}\nKategori: ${category}\nReferral: ${refCode}`

  if (navigator.share) {
    navigator.share({ title: `Progress: ${title}`, text }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(text)
  }
}

export function shareChallenge(data) {
  const { title, category, emoji, maxPoints, childName } = data
  const refCode = generateRefCode()
  const text = `🏆 ${childName} menyelesaikan challenge "${title}" dengan ${maxPoints} poin!\n\nKategori: ${category}\nReferral: ${refCode}`

  if (navigator.share) {
    navigator.share({ title: `Challenge: ${title}`, text }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(text)
  }
}

export function shareChecklistImage(title, items, checkedCount, percent, options = {}) {
  const refCode = options.referralCode || generateRefCode()
  const text = `✅ Checklist "${title}": ${checkedCount}/${items.length} selesai\n\nReferral: ${refCode}`

  if (navigator.share) {
    navigator.share({ title: `Checklist: ${title}`, text }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(text)
  }
}
