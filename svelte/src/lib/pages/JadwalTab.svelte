<script>
  import { toolsData, toolsAnakId, anakToolsData, addSchedule, removeSchedule } from '../stores/toolsStore.js'
  import { anakList } from '../stores/anakStore.js'
  import AppModal from '../components/AppModal.svelte'
  import AppInput from '../components/AppInput.svelte'
  import AppButton from '../components/AppButton.svelte'
  import AnakDropdown from '../components/AnakDropdown.svelte'
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  let schedules = $state([])
  let currentAnakId = $state(null)
  let anakListVal = $state([])

  let showForm = $state(false)
  let newLabel = $state('')
  let newTime = $state('')
  let labelError = $state('')
  let timeError = $state('')

  $effect(() => {
    const u1 = toolsData.subscribe(v => { schedules = v.schedules || [] })
    const u2 = toolsAnakId.subscribe(v => { currentAnakId = v })
    const u3 = anakList.subscribe(v => { anakListVal = v })
    return () => { u1(); u2(); u3() }
  })

  function getToday() {
    return new Date().toISOString().slice(0, 10)
  }

  onMount(() => {
    const today = getToday()
    const lastReset = localStorage.getItem('jadwal_last_reset')
    if (lastReset !== today && schedules.length > 0) {
      schedules.forEach(s => { s.done = false })
      anakToolsData.update(map => {
        const id = get(toolsAnakId)
        if (map[id]) map[id].schedules = [...schedules]
        return map
      })
      localStorage.setItem('jadwal_last_reset', today)
    }
  })

  function toggleDone(item) {
    item.done = !item.done
    const map = get(anakToolsData)
    const id = get(toolsAnakId)
    if (map[id]) map[id].schedules = [...schedules]
    anakToolsData.set(map)
  }

  function closeForm() {
    showForm = false
    newLabel = ''
    newTime = ''
    labelError = ''
    timeError = ''
  }

  async function handleAdd() {
    labelError = ''
    timeError = ''
    let valid = true
    if (!newLabel.trim()) {
      labelError = 'Nama aktivitas wajib diisi'
      valid = false
    }
    if (!newTime) {
      timeError = 'Waktu wajib diisi'
      valid = false
    }
    if (!valid) return
    await addSchedule({ time: newTime, label: newLabel.trim(), done: false })
    closeForm()
  }

  async function handleRemove(item) {
    await removeSchedule(item)
  }
</script>

<div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
  <AnakDropdown anakList={anakListVal} value={currentAnakId} onselect={(id) => toolsAnakId.set(id)} />
<div class="space-y-4">
  {#each schedules as s, i (i)}
    <div class="jadwal-card"
      class:jadwal-done={s.done}
      class:jadwal-undone={!s.done}
      onclick={() => toggleDone(s)}
      role="button"
      tabindex="0"
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDone(s) }}>
      <div class="jadwal-icon" class:jadwal-icon-done={s.done}>
        <span class="material-symbols-outlined text-lg">{s.done ? 'check' : 'schedule'}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-label-lg" class:text-main={!s.done} class:text-variant={s.done} class:line-through={s.done}>{s.label}</p>
        <p class="text-xs text-on-surface-variant">{s.time}</p>
      </div>
      <button class="jadwal-remove" onclick={(e) => { e.stopPropagation(); handleRemove(s) }}>
        <span class="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  {/each}

  {#if !schedules.length}
    <div class="jadwal-empty">
      <p class="text-3xl mb-2">📅</p>
      <p class="text-sm text-on-surface-variant font-medium">Belum ada jadwal</p>
    </div>
  {/if}

  <button class="btn-pop-green" onclick={() => { showForm = true }}>
    <span class="material-symbols-outlined text-lg">add</span>
    Tambah Jadwal
  </button>
</div>
</div>

<AppModal show={showForm} title="Tambah Jadwal" onclose={closeForm}>
  <div class="space-y-4">
    <AppInput bind:value={newLabel} label="Nama Aktivitas" placeholder="Contoh: Belajar Membaca" error={labelError} />
    <AppInput bind:value={newTime} label="Waktu" type="time" placeholder="08:00" error={timeError} />
  </div>
  <div class="flex gap-3 mt-6">
    <AppButton variant="outline" onclick={closeForm}>Batal</AppButton>
    <AppButton onclick={handleAdd}>Simpan</AppButton>
  </div>
</AppModal>

<style>
  .jadwal-card {
    background-color: #FFF9F3;
    border-radius: 24px;
    padding: 20px;
    border: 4px solid #B7D9BC;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .jadwal-card:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
  .jadwal-icon {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  }
  .jadwal-undone .jadwal-icon {
    background-color: #E1F2E5;
    color: #176c33;
  }
  .jadwal-done .jadwal-icon {
    background-color: #176c33;
    color: white;
  }
  .text-main {
    color: #1C1B1F;
  }
  .text-variant {
    color: #79747E;
  }
  .line-through {
    text-decoration: line-through;
  }
  .jadwal-remove {
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(186 26 26 / 0.5);
    transition: all 0.15s ease;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .jadwal-remove:hover {
    background-color: rgb(186 26 26 / 0.1);
    color: #BA1A1A;
  }
  .jadwal-empty {
    background-color: #FFF9F3;
    border-radius: 24px;
    padding: 32px;
    text-align: center;
    border: 4px dashed #B7D9BC;
  }
  .btn-pop-green {
    background-color: #6DBE7B;
    box-shadow: 0 4px 0 #176c33;
    transition: all 0.1s ease;
    width: 100%;
    padding: 12px 0;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    cursor: pointer;
  }
  .btn-pop-green:active {
    transform: translateY(4px);
    box-shadow: 0 0px 0 #176c33;
  }
</style>
