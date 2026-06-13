import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAnakList as dbGetAnakList, saveAnak as dbSaveAnak, saveAnakBatch as dbSaveAnakBatch, removeAnak as dbRemoveAnak, clearAllUserData, getSetting } from '../db.js'
import * as api from '../services/api.js'

async function shouldAutoSync() {
  if (!api.isAuthenticated()) return false
  const val = await getSetting('autoSync')
  return val !== false
}

export const useAnakStore = defineStore('anak', () => {
  const cachedAnakList = (() => {
    try {
      const raw = localStorage.getItem('lk_anak_cache')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })()
  const anakList = ref(cachedAnakList)

  const allHistory = computed(() => {
    return anakList.value
      .flatMap(a => (a.history || []).map(h => ({ ...h, anakNama: a.nama, anakEmoji: a.emoji })))
      .sort((a, b) => {
        const parse = s => {
          const [d, m, y] = s.split(' ')
          const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5, Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11 }
          return new Date(y, months[m], d)
        }
        return parse(b.date) - parse(a.date)
      })
  })

  async function loadAnakList() {
    if (api.isAuthenticated()) {
      try {
        const serverList = await api.getAnakList()

        const seen = new Map()
        for (const a of serverList) {
          seen.set(a.id, a)
        }
        const deduped = [...seen.values()]

        const mapped = deduped.map(a => ({
          ...a,
          tanggal: a.tanggal_lahir || a.tanggal,
          bulan: a.bulan_lahir || a.bulan,
          tahun: a.tahun_lahir || a.tahun,
          serverSynced: true,
          skills: (a.skills || []).map(s => ({
            ...s,
            activities: s.activities || [],
          })),
          completedSkills: a.completed_skills || a.completedSkills || [],
        }))

        anakList.value = mapped
        localStorage.setItem('lk_anak_cache', JSON.stringify(mapped))
        await dbSaveAnakBatch(mapped)
        return
      } catch (e) {
        console.warn('Failed to load from server, using local:', e)
      }
    }

    const localList = await dbGetAnakList()
    anakList.value = localList.map(a => ({ ...a, serverSynced: false }))
    localStorage.setItem('lk_anak_cache', JSON.stringify(anakList.value))
  }

  async function validateAndClearIfDifferentUser(userId) {
    const storedUserId = localStorage.getItem('lk_cache_user_id')
    if (storedUserId && String(storedUserId) !== String(userId)) {
      await clearAllUserData()
      anakList.value = []
    }
    localStorage.setItem('lk_cache_user_id', String(userId))
  }

  async function addAnak(anak) {
    if (await shouldAutoSync()) {
      const payload = {
        nama: anak.nama,
        gender: anak.gender,
        umur: anak.umur,
        tanggal_lahir: anak.tanggal || anak.tanggal_lahir,
        bulan_lahir: anak.bulan || anak.bulan_lahir,
        tahun_lahir: anak.tahun || anak.tahun_lahir,
        emoji: anak.emoji,
        settings: anak.settings,
      }
      const saved = await api.addAnak(payload)
      anak.id = saved.id
      anak.serverSynced = true
      anak.skills = anak.skills || []
      anak.completedSkills = anak.completedSkills || []
      anakList.value.push(anak)
      await dbSaveAnak(JSON.parse(JSON.stringify(anak)))
      return saved.id
    }
    const id = await dbSaveAnak(anak)
    anak.id = id
    anak.serverSynced = false
    anakList.value.push(anak)
    return id
  }

  async function updateAnak(anak) {
    if (await shouldAutoSync()) {
      try {
        const payload = {
          nama: anak.nama,
          gender: anak.gender,
          umur: anak.umur,
          tanggal_lahir: anak.tanggal || anak.tanggal_lahir,
          bulan_lahir: anak.bulan || anak.bulan_lahir,
          tahun_lahir: anak.tahun || anak.tahun_lahir,
          emoji: anak.emoji,
          settings: anak.settings,
        }
        await api.updateAnak(anak.id, payload)
        anak.serverSynced = true
      } catch (e) {
        console.warn('Failed to update on server:', e)
      }
    }
    await dbSaveAnak(JSON.parse(JSON.stringify(anak)))
  }

  async function deleteAnak(id) {
    if (await shouldAutoSync()) {
      try {
        await api.deleteAnak(id)
      } catch (e) {
        console.warn('Failed to delete on server:', e)
      }
    }
    await dbRemoveAnak(id)
    const idx = anakList.value.findIndex(a => a.id === id)
    if (idx > -1) anakList.value.splice(idx, 1)
  }

  async function resetSkill({ anak, skill }) {
    const idx = anak.completedSkills.findIndex(s => s.key === skill.key)
    if (idx > -1) {
      anak.completedSkills.splice(idx, 1)
      anak.skills.push({ ...skill, progress: 0, activities: skill.activities || [] })
      if (await shouldAutoSync()) {
        try {
          await api.deleteCompletedSkill(anak.id, skill.key)
          await api.addSkill(anak.id, { key: skill.key, emoji: skill.emoji, title: skill.title, pilar: skill.pilar, color: skill.color })
        } catch (e) { console.warn('Sync resetSkill failed:', e.message) }
      }
      await dbSaveAnak(JSON.parse(JSON.stringify(anak)))
    }
  }

  async function deleteSkill({ anak, skill }) {
    const idx = (anak.skills || []).findIndex(s => s.key === skill.key)
    if (idx > -1) {
      anak.skills.splice(idx, 1)
      if (await shouldAutoSync()) {
        try {
          await api.deleteSkill(anak.id, skill.key)
        } catch (e) {
          console.warn('Failed to delete skill on server:', e)
        }
      }
      await dbSaveAnak(JSON.parse(JSON.stringify(anak)))
    }
  }

  async function addSkill(anakId, skillData) {
    const anak = anakList.value.find(a => a.id === anakId)
    if (!anak) return
    if (!anak.skills) anak.skills = []
    const exists = anak.skills.some(s => s.key === skillData.key)
    if (exists) return
    anak.skills.push({
      key: skillData.key,
      emoji: skillData.emoji,
      title: skillData.title,
      pilar: skillData.pilar,
      progress: 0,
      color: skillData.color,
      activities: []
    })
    if (await shouldAutoSync()) {
      try {
        await api.addSkill(anakId, skillData)
      } catch (e) {
        console.warn('Failed to add skill on server:', e)
      }
    }
    await dbSaveAnak(JSON.parse(JSON.stringify(anak)))
  }

  async function addActivity(anakId, skillKey, activityData) {
    const anak = anakList.value.find(a => a.id === anakId)
    if (!anak) return
    const skill = (anak.skills || []).find(s => s.key === skillKey)
    if (!skill) return
    if (!skill.activities) skill.activities = []
    const exists = skill.activities.some(a => a.title === activityData.title)
    if (exists) return
    skill.activities.push({
      title: activityData.title,
      emoji: activityData.emoji,
      feature: activityData.feature,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    })
    if (await shouldAutoSync()) {
      try {
        await api.addActivity(anakId, {
          skill_key: skillKey,
          title: activityData.title,
          emoji: activityData.emoji,
          feature: activityData.feature,
        })
      } catch (e) {
        console.warn('Failed to add activity on server:', e)
      }
    }
    await dbSaveAnak(JSON.parse(JSON.stringify(anak)))
  }

  return {
    anakList, allHistory,
    loadAnakList, validateAndClearIfDifferentUser, addAnak, updateAnak, deleteAnak, resetSkill, deleteSkill, addSkill, addActivity
  }
})
