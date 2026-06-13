import { ref, watch } from 'vue'
import db from '../db.js'

const seeded = ref(false)

export function useAppData() {
  async function seedDefaults(anakList, toolsDataByAnak) {
    const count = await db.anak.count()
    if (count > 0) return false

    for (const anak of anakList) {
      await db.anak.add(JSON.parse(JSON.stringify(anak)))
    }

    for (const [anakId, data] of Object.entries(toolsDataByAnak)) {
      const id = Number(anakId)
      for (const c of (data.challenges || [])) {
        await db.challenges.add({ ...c, anakId: id })
      }
      for (const c of (data.challengeHistory || [])) {
        await db.challengeHistory.add({ ...c, anakId: id })
      }
      for (const cl of (data.checklists || [])) {
        await db.checklists.add({ ...cl, anakId: id })
      }
      for (const s of (data.schedules || [])) {
        await db.schedules.add({ ...s, anakId: id })
      }
    }
    return true
  }

  async function loadAnakList() {
    return db.anak.toArray()
  }

  async function loadToolsData(anakId) {
    const challenges = await db.challenges.where('anakId').equals(anakId).toArray()
    const challengeHistory = await db.challengeHistory.where('anakId').equals(anakId).toArray()
    const checklists = await db.checklists.where('anakId').equals(anakId).toArray()
    for (const cl of checklists) cl.items = cl.items || []
    const schedules = await db.schedules.where('anakId').equals(anakId).toArray()
    return { challenges, challengeHistory, checklists, schedules }
  }

  async function saveChallenge(anakId, item) {
    if (item.id) {
      await db.challenges.put({ ...item, anakId })
    } else {
      item.id = Date.now()
      await db.challenges.add({ ...item, anakId })
    }
  }

  async function removeChallenge(id) {
    await db.challenges.delete(id)
  }

  async function saveChallengeHistory(anakId, item) {
    await db.challengeHistory.add({ ...item, anakId })
  }

  async function saveChecklist(anakId, item) {
    if (item.id && await db.checklists.get(item.id)) {
      await db.checklists.put({ ...item, anakId })
    } else {
      item.id = Date.now()
      await db.checklists.add({ ...item, anakId })
    }
  }

  async function removeChecklist(id) {
    await db.checklists.delete(id)
  }

  async function saveSchedule(anakId, item) {
    if (item.id && await db.schedules.get(item.id)) {
      await db.schedules.put({ ...item, anakId })
    } else {
      item.id = Date.now()
      await db.schedules.add({ ...item, anakId })
    }
  }

  async function removeSchedule(id) {
    await db.schedules.delete(id)
  }

  return {
    seedDefaults,
    loadAnakList,
    loadToolsData,
    saveChallenge,
    removeChallenge,
    saveChallengeHistory,
    saveChecklist,
    removeChecklist,
    saveSchedule,
    removeSchedule,
    seeded
  }
}
