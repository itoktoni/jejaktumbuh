import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getChallenges, saveChallenge as dbSaveChallenge, removeChallenge as dbRemoveChallenge,
  getChallengeHistory, saveChallengeHistory as dbSaveChallengeHistory,
  getChecklists, saveChecklist as dbSaveChecklist, removeChecklist as dbRemoveChecklist,
  getSchedules, saveSchedule as dbSaveSchedule, removeSchedule as dbRemoveSchedule,
  getWorksheets, saveWorksheet as dbSaveWorksheet, removeWorksheet as dbRemoveWorksheet,
  getSetting
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
    const localList = await import('../db.js').then(m => m.getAnakList())
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

export const useToolsStore = defineStore('tools', () => {
  const anakToolsData = ref({})
  const toolsAnakId = ref(null)

  const emptyToolsData = { challenges: [], challengeHistory: [], checklists: [], schedules: [], worksheets: [] }

  function getAnakToolsData(anakId) {
    if (!anakToolsData.value[anakId]) {
      anakToolsData.value[anakId] = JSON.parse(JSON.stringify(emptyToolsData))
    }
    return anakToolsData.value[anakId]
  }

  const toolsData = computed(() => getAnakToolsData(toolsAnakId.value))

  async function loadToolsData(anakList) {
    for (const anak of anakList) {
      const challenges = await getChallenges(anak.id)
      const challengeHistory = await getChallengeHistory(anak.id)
      const checklists = await getChecklists(anak.id)
      const schedules = await getSchedules(anak.id)
      const worksheets = await getWorksheets(anak.id)
      anakToolsData.value[anak.id] = { challenges, challengeHistory, checklists, schedules, worksheets }
    }
    if (anakList.length && !toolsAnakId.value) {
      toolsAnakId.value = anakList[0].id
    }
  }

  // Challenge
  async function addChallenge(item) {
    toolsData.value.challenges.push(item)
    dbSaveChallenge({ ...item, anakId: toolsAnakId.value })
    if (await shouldAutoSync()) {
      try {
        const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
        if (!serverAnakId) { console.warn('[Challenge] Anak not on server'); return }
        const saved = await api.addChallenge(serverAnakId, item)
        if (saved?.id) item.serverId = saved.id
      } catch (e) { console.warn('[Challenge] Sync FAILED:', e.message) }
    }
  }

  async function addPoint({ id, amount }) {
    const c = toolsData.value.challenges.find(c => c.id === id)
    if (c) {
      c.points = Math.min(c.maxPoints, c.points + amount)
      dbSaveChallenge({ ...c, anakId: toolsAnakId.value })
      if (await shouldAutoSync() && c.serverId) {
        try { await api.updateChallenge(toolsAnakId.value, c.serverId, { points: c.points }) } catch (e) { console.warn('Sync addPoint failed:', e) }
      }
    }
  }

  async function removePoint({ id }) {
    const c = toolsData.value.challenges.find(c => c.id === id)
    if (c) {
      c.points = Math.max(0, c.points - 1)
      dbSaveChallenge({ ...c, anakId: toolsAnakId.value })
      if (await shouldAutoSync() && c.serverId) {
        try { await api.updateChallenge(toolsAnakId.value, c.serverId, { points: c.points }) } catch (e) { console.warn('Sync removePoint failed:', e) }
      }
    }
  }

  async function editChallenge(data) {
    const c = toolsData.value.challenges.find(c => c.id === data.id)
    if (c) {
      Object.assign(c, data)
      dbSaveChallenge({ ...c, anakId: toolsAnakId.value })
      if (await shouldAutoSync() && c.serverId) {
        try { await api.updateChallenge(toolsAnakId.value, c.serverId, data) } catch (e) { console.warn('Sync editChallenge failed:', e) }
      }
    }
  }

  async function deleteChallenge({ id }) {
    const idx = toolsData.value.challenges.findIndex(c => c.id === id)
    if (idx > -1) {
      const removed = toolsData.value.challenges.splice(idx, 1)[0]
      dbRemoveChallenge(id)
      if (await shouldAutoSync() && removed?.serverId) {
        try { await api.deleteChallenge(toolsAnakId.value, removed.serverId) } catch (e) { console.warn('Sync deleteChallenge failed:', e) }
      }
    }
  }

  // Challenge History
  async function addChallengeHistory(item) {
    toolsData.value.challengeHistory.push(item)
    dbSaveChallengeHistory({ ...item, anakId: toolsAnakId.value })
  }

  // Checklist
  async function addChecklist(item) {
    toolsData.value.checklists.push(item)
    dbSaveChecklist({ ...item, anakId: toolsAnakId.value })
    if (await shouldAutoSync()) {
      try {
        const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
        if (!serverAnakId) return
        const saved = await api.addChecklist(serverAnakId, item)
        if (saved?.id) item.serverId = saved.id
      } catch (e) { console.warn('[Checklist] Sync FAILED:', e.message) }
    }
  }

  async function removeChecklist(index) {
    const removed = toolsData.value.checklists.splice(index, 1)[0]
    if (removed?.id) dbRemoveChecklist(removed.id)
    if (await shouldAutoSync() && removed?.serverId) {
      try {
        const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
        if (serverAnakId) await api.deleteChecklist(serverAnakId, removed.serverId)
      } catch (e) { console.warn('[Checklist] Sync delete FAILED:', e.message) }
    }
  }

  async function addChecklistItem({ checklistId, item }) {
    const cl = toolsData.value.checklists.find(c => c.id === checklistId)
    if (cl) {
      cl.items.push(item)
      dbSaveChecklist({ ...cl, anakId: toolsAnakId.value })
      if (await shouldAutoSync() && cl.serverId) {
        try {
          const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
          if (serverAnakId) await api.updateChecklist(serverAnakId, cl.serverId, { items: cl.items })
        } catch (e) { console.warn('[Checklist] Sync item add FAILED:', e.message) }
      }
    }
  }

  async function removeChecklistItem({ checklistId, itemIndex }) {
    const cl = toolsData.value.checklists.find(c => c.id === checklistId)
    if (cl) {
      cl.items.splice(itemIndex, 1)
      dbSaveChecklist({ ...cl, anakId: toolsAnakId.value })
      if (await shouldAutoSync() && cl.serverId) {
        try {
          const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
          if (serverAnakId) await api.updateChecklist(serverAnakId, cl.serverId, { items: cl.items })
        } catch (e) { console.warn('[Checklist] Sync item remove FAILED:', e.message) }
      }
    }
  }

  // Schedule
  async function addSchedule(item) {
    toolsData.value.schedules.push(item)
    dbSaveSchedule({ ...item, anakId: toolsAnakId.value })
    if (await shouldAutoSync()) {
      try {
        const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
        if (!serverAnakId) return
        const saved = await api.addSchedule(serverAnakId, item)
        if (saved?.id) item.serverId = saved.id
      } catch (e) { console.warn('[Schedule] Sync FAILED:', e.message) }
    }
  }

  async function removeSchedule(item) {
    const idx = toolsData.value.schedules.indexOf(item)
    if (idx > -1) {
      toolsData.value.schedules.splice(idx, 1)
      if (item.id) dbRemoveSchedule(item.id)
      if (await shouldAutoSync() && item?.serverId) {
        try {
          const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
          if (serverAnakId) await api.deleteSchedule(serverAnakId, item.serverId)
        } catch (e) { console.warn('[Schedule] Sync delete FAILED:', e.message) }
      }
    }
  }

  // Worksheet
  async function addWorksheet(item) {
    const id = await dbSaveWorksheet({ ...item, anakId: toolsAnakId.value })
    item.id = id
    toolsData.value.worksheets.push(item)
    if (await shouldAutoSync()) {
      try {
        const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
        if (!serverAnakId) return id
        const saved = await api.addWorksheet(serverAnakId, item)
        if (saved?.id) item.serverId = saved.id
      } catch (e) { console.warn('[Worksheet] Sync FAILED:', e.message) }
    }
    return id
  }

  async function removeWorksheetItem(id) {
    const idx = toolsData.value.worksheets.findIndex(w => w.id === id)
    if (idx > -1) {
      const removed = toolsData.value.worksheets.splice(idx, 1)[0]
      dbRemoveWorksheet(id)
      if (await shouldAutoSync() && removed?.serverId) {
        try {
          const serverAnakId = await ensureAnakOnServer(toolsAnakId.value)
          if (serverAnakId) await api.deleteWorksheet(serverAnakId, removed.serverId)
        } catch (e) { console.warn('[Worksheet] Sync delete FAILED:', e.message) }
      }
    }
  }

  return {
    toolsAnakId, toolsData, anakToolsData,
    loadToolsData,
    addChallenge, addPoint, removePoint, editChallenge, deleteChallenge, addChallengeHistory,
    addChecklist, removeChecklist, addChecklistItem, removeChecklistItem,
    addSchedule, removeSchedule,
    addWorksheet, removeWorksheetItem
  }
})
