import { writable, derived, get } from 'svelte/store'
import {
  getChallenges, saveChallenge as dbSaveChallenge, removeChallenge as dbRemoveChallenge,
  getChallengeHistory, saveChallengeHistory as dbSaveChallengeHistory,
  getChecklists, saveChecklist as dbSaveChecklist, removeChecklist as dbRemoveChecklist,
  getSchedules, saveSchedule as dbSaveSchedule, removeSchedule as dbRemoveSchedule,
  getWorksheets, saveWorksheet as dbSaveWorksheet, removeWorksheet as dbRemoveWorksheet,
  getSetting, getAnakList as dbGetAnakList
} from '../db.js'
import * as api from '../services/api.js'

async function shouldAutoSync() {
  if (!api.isAuthenticated()) return false
  const val = await getSetting('autoSync')
  return val !== false
}

async function ensureAnakOnServer(anakId) {
  if (!anakId) return null
  try {
    const serverList = await api.getAnakList()
    const found = serverList.find(a => a.id === anakId)
    if (found) return found.id
    const localList = await dbGetAnakList()
    const local = localList.find(a => a.id === anakId)
    if (local) {
      const saved = await api.addAnak({
        nama: local.nama,
        gender: local.gender,
        umur: local.umur,
        tanggal_lahir: local.tanggal_lahir || local.tanggal,
        bulan_lahir: local.bulan_lahir || local.bulan,
        tahun_lahir: local.tahun_lahir || local.tahun,
        emoji: local.emoji,
        skills: local.skills || [],
        history: local.history || [],
        completed_skills: local.completed_skills || [],
        settings: local.settings || [],
      })
      return saved.id
    }
  } catch (e) {
    console.warn('[ensureAnakOnServer] Failed:', e.message)
  }
  return null
}

const emptyToolsData = { challenges: [], challengeHistory: [], checklists: [], schedules: [], worksheets: [] }

export const anakToolsData = writable({})
export const toolsAnakId = writable(null)

function getAnakToolsData(toolsMap, anakId) {
  if (!toolsMap[anakId]) {
    toolsMap[anakId] = JSON.parse(JSON.stringify(emptyToolsData))
  }
  return toolsMap[anakId]
}

export const toolsData = derived(
  [anakToolsData, toolsAnakId],
  ([$anakToolsData, $toolsAnakId]) => getAnakToolsData($anakToolsData, $toolsAnakId)
)

export async function loadToolsData(anakListArr) {
  const toolsMap = {}
  for (const anak of anakListArr) {
    const challenges = await getChallenges(anak.id)
    const challengeHistory = await getChallengeHistory(anak.id)
    const checklists = await getChecklists(anak.id)
    const schedules = await getSchedules(anak.id)
    const worksheets = await getWorksheets(anak.id)
    toolsMap[anak.id] = { challenges, challengeHistory, checklists, schedules, worksheets }
  }
  anakToolsData.set(toolsMap)
  if (anakListArr.length) {
    const currentId = get(toolsAnakId)
    if (!currentId) toolsAnakId.set(anakListArr[0].id)
  }
}

export async function addChallenge(item) {
  const currentId = get(toolsAnakId)
  anakToolsData.update(map => {
    getAnakToolsData(map, currentId).challenges.push(item)
    return map
  })
  dbSaveChallenge({ ...item, anakId: currentId })
  if (await shouldAutoSync()) {
    try {
      const serverAnakId = await ensureAnakOnServer(currentId)
      if (!serverAnakId) return
      const saved = await api.addChallenge(serverAnakId, item)
      if (saved?.id) item.serverId = saved.id
    } catch (e) { console.warn('[Challenge] Sync FAILED:', e.message) }
  }
}

export async function addPoint({ id, amount }) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const c = getAnakToolsData(map, currentId).challenges.find(c => c.id === id)
  if (c) {
    c.points = Math.min(c.maxPoints, c.points + amount)
    anakToolsData.set(map)
    dbSaveChallenge({ ...c, anakId: currentId })
    if (await shouldAutoSync() && c.serverId) {
      try { await api.updateChallenge(currentId, c.serverId, { points: c.points }) } catch (e) { console.warn('Sync addPoint failed:', e) }
    }
  }
}

export async function removePoint({ id }) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const c = getAnakToolsData(map, currentId).challenges.find(c => c.id === id)
  if (c) {
    c.points = Math.max(0, c.points - 1)
    anakToolsData.set(map)
    dbSaveChallenge({ ...c, anakId: currentId })
    if (await shouldAutoSync() && c.serverId) {
      try { await api.updateChallenge(currentId, c.serverId, { points: c.points }) } catch (e) { console.warn('Sync removePoint failed:', e) }
    }
  }
}

export async function editChallenge(data) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const c = getAnakToolsData(map, currentId).challenges.find(c => c.id === data.id)
  if (c) {
    Object.assign(c, data)
    anakToolsData.set(map)
    dbSaveChallenge({ ...c, anakId: currentId })
    if (await shouldAutoSync() && c.serverId) {
      try { await api.updateChallenge(currentId, c.serverId, data) } catch (e) { console.warn('Sync editChallenge failed:', e) }
    }
  }
}

export async function deleteChallenge({ id }) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const challenges = getAnakToolsData(map, currentId).challenges
  const idx = challenges.findIndex(c => c.id === id)
  if (idx > -1) {
    const removed = challenges.splice(idx, 1)[0]
    anakToolsData.set(map)
    dbRemoveChallenge(id)
    if (await shouldAutoSync() && removed?.serverId) {
      try { await api.deleteChallenge(currentId, removed.serverId) } catch (e) { console.warn('Sync deleteChallenge failed:', e) }
    }
  }
}

export async function addChallengeHistory(item) {
  const currentId = get(toolsAnakId)
  anakToolsData.update(map => {
    getAnakToolsData(map, currentId).challengeHistory.push(item)
    return map
  })
  dbSaveChallengeHistory({ ...item, anakId: currentId })
}

export async function addChecklist(item) {
  const currentId = get(toolsAnakId)
  anakToolsData.update(map => {
    const list = getAnakToolsData(map, currentId).checklists
    const idx = list.findIndex(c => c.id === item.id)
    if (idx >= 0) {
      list[idx] = item
    } else {
      list.push(item)
    }
    return map
  })
  const plain = JSON.parse(JSON.stringify(item))
  dbSaveChecklist({ ...plain, anakId: currentId })
  if (await shouldAutoSync()) {
    try {
      const serverAnakId = await ensureAnakOnServer(currentId)
      if (!serverAnakId) return
      const saved = await api.addChecklist(serverAnakId, item)
      if (saved?.id) item.serverId = saved.id
    } catch (e) { console.warn('[Checklist] Sync FAILED:', e.message) }
  }
}

export async function removeChecklist(index) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const removed = getAnakToolsData(map, currentId).checklists.splice(index, 1)[0]
  anakToolsData.set(map)
  if (removed?.id) dbRemoveChecklist(removed.id)
  if (await shouldAutoSync() && removed?.serverId) {
    try {
      const serverAnakId = await ensureAnakOnServer(currentId)
      if (serverAnakId) await api.deleteChecklist(serverAnakId, removed.serverId)
    } catch (e) { console.warn('[Checklist] Sync delete FAILED:', e.message) }
  }
}

export async function addChecklistItem({ checklistId, item }) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const cl = getAnakToolsData(map, currentId).checklists.find(c => c.id === checklistId)
  if (cl) {
    cl.items.push(item)
    anakToolsData.set(map)
    const plain = JSON.parse(JSON.stringify(cl))
    dbSaveChecklist({ ...plain, anakId: currentId })
    if (await shouldAutoSync() && cl.serverId) {
      try {
        const serverAnakId = await ensureAnakOnServer(currentId)
        if (serverAnakId) await api.updateChecklist(serverAnakId, cl.serverId, { items: cl.items })
      } catch (e) { console.warn('[Checklist] Sync item add FAILED:', e.message) }
    }
  }
}

export async function removeChecklistItem({ checklistId, itemIndex }) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const cl = getAnakToolsData(map, currentId).checklists.find(c => c.id === checklistId)
  if (cl) {
    cl.items.splice(itemIndex, 1)
    anakToolsData.set(map)
    const plain = JSON.parse(JSON.stringify(cl))
    dbSaveChecklist({ ...plain, anakId: currentId })
    if (await shouldAutoSync() && cl.serverId) {
      try {
        const serverAnakId = await ensureAnakOnServer(currentId)
        if (serverAnakId) await api.updateChecklist(serverAnakId, cl.serverId, { items: cl.items })
      } catch (e) { console.warn('[Checklist] Sync item remove FAILED:', e.message) }
    }
  }
}

export async function addSchedule(item) {
  const currentId = get(toolsAnakId)
  anakToolsData.update(map => {
    getAnakToolsData(map, currentId).schedules.push(item)
    return map
  })
  dbSaveSchedule({ ...item, anakId: currentId })
  if (await shouldAutoSync()) {
    try {
      const serverAnakId = await ensureAnakOnServer(currentId)
      if (!serverAnakId) return
      const saved = await api.addSchedule(serverAnakId, item)
      if (saved?.id) item.serverId = saved.id
    } catch (e) { console.warn('[Schedule] Sync FAILED:', e.message) }
  }
}

export async function removeSchedule(item) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const schedules = getAnakToolsData(map, currentId).schedules
  const idx = schedules.indexOf(item)
  if (idx > -1) {
    schedules.splice(idx, 1)
    anakToolsData.set(map)
    if (item.id) dbRemoveSchedule(item.id)
    if (await shouldAutoSync() && item?.serverId) {
      try {
        const serverAnakId = await ensureAnakOnServer(currentId)
        if (serverAnakId) await api.deleteSchedule(serverAnakId, item.serverId)
      } catch (e) { console.warn('[Schedule] Sync delete FAILED:', e.message) }
    }
  }
}

export async function addWorksheet(item) {
  const currentId = get(toolsAnakId)
  const id = await dbSaveWorksheet({ ...item, anakId: currentId })
  item.id = id
  anakToolsData.update(map => {
    getAnakToolsData(map, currentId).worksheets.push(item)
    return map
  })
  if (await shouldAutoSync()) {
    try {
      const serverAnakId = await ensureAnakOnServer(currentId)
      if (!serverAnakId) return id
      const saved = await api.addWorksheet(serverAnakId, item)
      if (saved?.id) item.serverId = saved.id
    } catch (e) { console.warn('[Worksheet] Sync FAILED:', e.message) }
  }
  return id
}

export async function removeWorksheetItem(id) {
  const currentId = get(toolsAnakId)
  const map = get(anakToolsData)
  const worksheets = getAnakToolsData(map, currentId).worksheets
  const idx = worksheets.findIndex(w => w.id === id)
  if (idx > -1) {
    const removed = worksheets.splice(idx, 1)[0]
    anakToolsData.set(map)
    dbRemoveWorksheet(id)
    if (await shouldAutoSync() && removed?.serverId) {
      try {
        const serverAnakId = await ensureAnakOnServer(currentId)
        if (serverAnakId) await api.deleteWorksheet(serverAnakId, removed.serverId)
      } catch (e) { console.warn('[Worksheet] Sync delete FAILED:', e.message) }
    }
  }
}
