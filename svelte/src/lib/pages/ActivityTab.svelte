<script>
  import { get } from 'svelte/store'
  import { onMount } from 'svelte'
  import { aktivitasData, buildAktivitasDataFromAPI, setAktivitasData, filterActivities } from '../data/activities.js'
  import { activitiesCache, serverCount, localCount, downloading, downloadMessage, loadFromCache, checkServer, downloadActivities } from '../stores/activityStore.js'
  import { isAuthenticated, userPlan, plans as planList } from '../stores/authStore.js'
  import { switchCounter, activeTab, selectedAnakId, selectedSkillKey, selectedAge, selectedAgama, selectedPlanId } from '../stores/appStore.js'
  import * as api from '../services/api.js'
  import { anakList } from '../stores/anakStore.js'
  import { calcAge } from '../utils/age.js'
  import AnakDropdown from '../components/AnakDropdown.svelte'
  import { StoryCard, RoleplayCard, GameCard, ScriptCard, ProjectCard, SongCard, PuzzleCard, ExerciseCard, OutdoorCard, ExperimentCard, WorksheetCard } from './activity/index.js'

  const cardMap = {
    storytelling: StoryCard,
    bermain_peran: RoleplayCard,
    permainan: GameCard,
    monolog: ScriptCard,
    proyek_kreatif: ProjectCard,
    musik_gerak: SongCard,
    puzzle: PuzzleCard,
    mindfulness: ExerciseCard,
    outdoor: OutdoorCard,
    ilmu_pengetahuan: ExperimentCard,
    worksheet: WorksheetCard,
  }

  let aktData = $state([])
  let isAuth = $state(false)
  let dl = $state(false)
  let dlMsg = $state('')
  let srvCount = $state(0)
  let locCount = $state(0)
  let selectedType = $state(null)
  let activeStory = $state(null)
  let activeRoleplay = $state(null)
  let activeProject = $state(null)
  let activePuzzle = $state(null)
  let switchCount = $state(0)
  let anakListVal = $state([])
  let selectedAnakIdVal = $state(null)
  let selectedSkillKeyVal = $state(null)
  let selectedAgeVal = $state(null)
  let selectedAgamaVal = $state(null)
  let selectedPlanIdVal = $state(null)
  let searchQuery = $state('')

  $effect(() => {
    const u1 = aktivitasData.subscribe(v => aktData = v)
    const u2 = isAuthenticated.subscribe(v => isAuth = v)
    const u3 = downloading.subscribe(v => dl = v)
    const u4 = downloadMessage.subscribe(v => dlMsg = v)
    const u5 = serverCount.subscribe(v => srvCount = v)
    const u6 = localCount.subscribe(v => locCount = v)
    const u7 = switchCounter.subscribe(v => switchCount = v)
    const u8 = anakList.subscribe(v => anakListVal = v)
    const u9 = selectedAnakId.subscribe(v => selectedAnakIdVal = v)
    const u10 = selectedSkillKey.subscribe(v => selectedSkillKeyVal = v)
    const u11 = selectedAge.subscribe(v => selectedAgeVal = v)
    const u12 = selectedAgama.subscribe(v => selectedAgamaVal = v)
    const u13 = selectedPlanId.subscribe(v => selectedPlanIdVal = v)
    return () => { u1(); u2(); u3(); u4(); u5(); u6(); u7(); u8(); u9(); u10(); u11(); u12(); u13() }
  })

  $effect(() => {
    if (switchCount > 0 && $state.snapshot(activeTab) === 'activity') {
      selectedType = null
      activeStory = null
      activeRoleplay = null
      activeProject = null
      activePuzzle = null
    }
  })

  const contentKeyMap = {
    storytelling: 'stories', bermain_peran: 'roles', permainan: 'games',
    monolog: 'scripts', proyek_kreatif: 'projects', musik_gerak: 'songs',
    puzzle: 'puzzles', mindfulness: 'exercises', outdoor: 'activities',
    ilmu_pengetahuan: 'experiments', worksheet: 'worksheets'
  }

  const selectedChild = $derived(anakListVal.find(a => a.id === selectedAnakIdVal))
  const childAge = $derived(selectedChild ? calcAge(selectedChild.tahun, selectedChild.bulan, selectedChild.tanggal) : null)
  const childAgama = $derived(selectedChild?.agama || null)

  $effect(() => {
    if (childAge != null) selectedAge.set(childAge)
    else selectedAge.set(null)
  })

  $effect(() => {
    if (childAgama) selectedAgama.set(childAgama)
    else selectedAgama.set(null)
  })

  let userPlanVal = $state(null)
  let planListVal = $state([])

  $effect(() => {
    const u14 = userPlan.subscribe(v => userPlanVal = v)
    const u15 = planList.subscribe(v => planListVal = v)
    return () => { u14(); u15() }
  })

  $effect(() => {
    if (userPlanVal?.plan_id) selectedPlanId.set(userPlanVal.plan_id)
    else selectedPlanId.set(null)
  })

  const planName = $derived(() => {
    if (!selectedPlanIdVal) return null
    const found = planListVal.find(p => p.id === selectedPlanIdVal)
    return found?.name || null
  })

  const filteredAktData = $derived.by(() => {
    const data = aktData
    if (!data || !data.length) return []

    let result = data

    if (selectedAnakIdVal) {
      result = result.map(a => {
        const contentKey = contentKeyMap[a.key]
        const items = (a[contentKey] || []).filter(item => {
          const ageOk = selectedAgeVal == null || (item.ages && item.ages.includes(selectedAgeVal))
          const agamaOk = !selectedAgamaVal || !item.agama || !item.agama.length || item.agama.includes(selectedAgamaVal)
          const skillOk = !selectedSkillKeyVal || !item.skills || !item.skills.length || item.skills.includes(selectedSkillKeyVal)
          const planOk = !selectedPlanIdVal || !item.plans || !item.plans.length || item.plans.includes(selectedPlanIdVal)
          return ageOk && agamaOk && skillOk && planOk
        })
        return { ...a, [contentKey]: items }
      })

      const hasFilter = selectedAgeVal != null || selectedAgamaVal || selectedSkillKeyVal || selectedPlanIdVal
      if (hasFilter) {
        result = result.filter(a => {
          if (a.key === 'worksheet') return true
          const contentKey = contentKeyMap[a.key]
          return (a[contentKey] || []).length > 0
        })
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a => {
        if (a.title?.toLowerCase().includes(q) || a.desc?.toLowerCase().includes(q)) return true
        if (a.key === 'worksheet') return true
        const contentKey = contentKeyMap[a.key]
        return (a[contentKey] || []).some(item =>
          item.title?.toLowerCase().includes(q) || item.desc?.toLowerCase().includes(q)
        )
      }).map(a => {
        if (a.title?.toLowerCase().includes(q) || a.desc?.toLowerCase().includes(q)) return a
        if (a.key === 'worksheet') return a
        const contentKey = contentKeyMap[a.key]
        const items = (a[contentKey] || []).filter(item =>
          item.title?.toLowerCase().includes(q) || item.desc?.toLowerCase().includes(q)
        )
        return { ...a, [contentKey]: items }
      })
    }

    return result
  })

  function getItems(type) {
    return type[contentKeyMap[type.key]] || []
  }

  function getItemCount(type) {
    return getItems(type).length
  }

  const sortedItems = $derived.by(() => {
    if (!selectedType) return []
    const items = getItems(selectedType)
    return [...items].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  })

  onMount(async () => {
    loadFromCache()
    checkServer()

    try {
      const { saveSetting } = await import('$lib/db.js')
      const serverData = await api.getActivitiesGrouped()
      if (serverData && typeof serverData === 'object') {
        const count = Object.values(serverData).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
        serverCount.set(count)
        await saveSetting('activities_cache', serverData)
        activitiesCache.set(serverData)
        setAktivitasData(buildAktivitasDataFromAPI(serverData))
      }
    } catch (e) { console.warn('Failed to refresh activities from server:', e) }
  })

  async function doDownload() {
    await downloadActivities()
    const cache = get(activitiesCache)
    if (cache) {
      const aktivitas = buildAktivitasDataFromAPI(cache)
      setAktivitasData(aktivitas)
    }
  }

  function openStory(story) { activeStory = story }
  function openRoleplay(rp) { activeRoleplay = rp }
  function openProject(proj) { activeProject = proj }
  function openPuzzle(pz) { activePuzzle = pz }

  function handleItemClick(item) {
    const feature = selectedType?.feature
    if (feature === 'story') openStory(item)
    else if (feature === 'roleplay') openRoleplay(item)
    else if (feature === 'project') openProject(item)
    else if (feature === 'puzzle') openPuzzle(item)
  }

  function goBack() {
    if (activeStory) { activeStory = null; return }
    if (activeRoleplay) { activeRoleplay = null; return }
    if (activeProject) { activeProject = null; return }
    if (activePuzzle) { activePuzzle = null; return }
    if (selectedType) { selectedType = null; return }
  }
</script>

<div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
  {#if !selectedType}
    <section class="mb-stack-lg">
      <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight mb-2 flex items-center gap-2">
        <span class="w-10 h-10 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-xl">🎨</span> Semua Aktivitas
      </h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-3">
        Pilih jenis aktivitas untuk melihat seluruh konten.
        {#if isAuth}
          <span class="text-xs text-on-surface-variant/70">Download dari server untuk mendapatkan konten terbaru.</span>
        {/if}
      </p>
      <div class="flex items-center gap-2 mb-3">
        <div class="flex-1 min-w-0">
          <AnakDropdown anakList={anakListVal} value={selectedAnakIdVal} onselect={(id) => selectedAnakId.set(id)} />
        </div>
        {#if isAuth}
          <button onclick={doDownload} disabled={dl}
            class="flex items-center gap-2 py-3 rounded-2xl text-sm text-white shrink-0 transition-all active:scale-95 soft-shadow border-2 border-white bg-primary px-4 lg:px-5">
            <span class="material-symbols-outlined text-lg" class:animate-spin={dl}>cloud_download</span>
            <span class="hidden lg:inline">{dl ? '...' : 'Download Content'}</span>
          </button>
        {/if}
      </div>
      <div class="relative mt-3">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input
          type="text"
          placeholder="Cari aktivitas..."
          bind:value={searchQuery}
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#B7D9BC] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white text-sm"
        />
      </div>
      {#if selectedAgeVal != null || selectedAgamaVal || selectedSkillKeyVal || selectedPlanIdVal}
        <div class="mt-3">
          <p class="text-xs font-bold text-primary uppercase tracking-wider mb-2">Filter Aktif</p>
          <div class="bg-white rounded-2xl p-3 border-2 border-[#B7D9BC] flex flex-wrap gap-2">
            {#if selectedAgeVal != null}
              <button onclick={() => selectedAge.set(null)}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-soft text-primary text-xs font-bold hover:bg-primary/10 transition-colors border border-[#B7D9BC]/50">
                <span class="material-symbols-outlined text-sm">cake</span>
                Umur {selectedAgeVal} th
                <span class="material-symbols-outlined text-sm text-primary/60">close</span>
              </button>
            {/if}
            {#if selectedAgamaVal}
              <button onclick={() => selectedAgama.set(null)}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-soft text-primary text-xs font-bold hover:bg-primary/10 transition-colors border border-[#B7D9BC]/50">
                <span class="material-symbols-outlined text-sm">diversity_3</span>
                {selectedAgamaVal}
                <span class="material-symbols-outlined text-sm text-primary/60">close</span>
              </button>
            {/if}
            {#if selectedSkillKeyVal}
              <button onclick={() => selectedSkillKey.set(null)}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-soft text-primary text-xs font-bold hover:bg-primary/10 transition-colors border border-[#B7D9BC]/50">
                <span class="material-symbols-outlined text-sm">psychology</span>
                {selectedSkillKeyVal.replace(/_/g, ' ')}
                <span class="material-symbols-outlined text-sm text-primary/60">close</span>
              </button>
            {/if}
            {#if selectedPlanIdVal}
              <button onclick={() => selectedPlanId.set(null)}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-soft text-primary text-xs font-bold hover:bg-primary/10 transition-colors border border-[#B7D9BC]/50">
                <span class="material-symbols-outlined text-sm">workspace_premium</span>
                {planName() || 'Plan'}
                <span class="material-symbols-outlined text-sm text-primary/60">close</span>
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </section>

    <div class="grid grid-cols-2 gap-3">
      {#each filteredAktData as item (item.key)}
        <button
          class="bento-card group bg-canvas-cream rounded-[24px] overflow-hidden cursor-pointer transition-all hover:shadow-lg flex flex-col border-4 border-[#B7D9BC] shadow-md text-left"
          onclick={() => { selectedType = item }}>
          <div class="p-4 flex flex-col flex-1">
            <div class="flex items-start justify-between mb-3">
              <div class="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl border-2 border-white shadow-sm"
                style="background: {item.bg}">
                {item.emoji}
              </div>
              <span class="text-xs font-bold px-2 py-1 rounded-full"
                style="background: {item.bg}; color: {item.color}">
                {getItemCount(item)}
              </span>
            </div>
            <h3 class="font-label-lg text-label-lg text-text-main mb-1">{item.title}</h3>
            <p class="text-xs leading-snug text-on-surface-variant line-clamp-2 mt-auto">{item.desc}</p>
          </div>
        </button>
      {/each}
    </div>
  {:else}
    <button onclick={() => selectedType = null}
      class="flex items-center gap-2 text-primary font-label-lg mb-stack-md hover:opacity-80 transition-opacity bg-success-soft px-4 py-2 rounded-full border-2 border-[#B7D9BC]">
      <span class="material-symbols-outlined text-xl">arrow_back</span>
      Kembali
    </button>

    <section class="mb-stack-lg">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 border-white shadow-sm" style="background: {selectedType.bg}">{selectedType.emoji}</div>
        <div>
          <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight">{selectedType.title}</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">{sortedItems.length} aktivitas</p>
        </div>
      </div>

      {#if isAuth}
        <div class="bg-white rounded-xl p-3 border-2 border-[#B7D9BC] flex items-center gap-2 mt-2">
          <span class="material-symbols-outlined text-primary text-sm">sync</span>
          <p class="text-xs text-on-surface-variant flex-1">
            {(srvCount - locCount) > 0 ? `${srvCount - locCount} aktivitas baru di server` : 'Semua sudah terunduh'}
          </p>
          <button onclick={doDownload} disabled={dl}
            class="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
            style="background: {(srvCount - locCount) > 0 ? '#176c33' : '#999'}">
            {dl ? '...' : ((srvCount - locCount) > 0 ? `+${srvCount - locCount} Baru` : 'Sync')}
          </button>
        </div>
      {/if}
    </section>

    {#if sortedItems.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each sortedItems as item (item.title)}
          {@const Card = cardMap[selectedType?.key]}
          {#if Card}
            <Card {item} bg={selectedType.bg} onclick={() => handleItemClick(item)} />
          {:else}
            <button class="bento-card group bg-canvas-cream rounded-[24px] overflow-hidden border-4 border-[#B7D9BC] shadow-md cursor-pointer transition-all hover:shadow-lg flex flex-col text-left w-full"
              onclick={() => handleItemClick(item)}>
              <div class="p-5 flex flex-col flex-1">
                <div class="flex items-start justify-between mb-3">
                  <div class="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl border-2 border-white shadow-sm" style="background: {selectedType.bg}">
                    {item.emoji || selectedType.emoji}
                  </div>
                </div>
                <h3 class="font-headline-md text-headline-md mb-2">{item.title}</h3>
                {#if item.desc}
                  <p class="text-sm text-on-surface-variant mb-3 line-clamp-2">{item.desc}</p>
                {/if}
                <div class="flex items-center gap-2 text-primary font-label-lg mt-auto pt-3 border-t-2 border-[#B7D9BC]/50">
                  <span class="material-symbols-outlined text-xl">chevron_right</span>
                  Lihat Detail
                  <span class="material-symbols-outlined text-xl ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            </button>
          {/if}
        {/each}
      </div>
    {:else}
      <div class="bg-canvas-cream rounded-[32px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <div class="text-5xl mb-3">📭</div>
        <p class="font-label-lg text-text-main mb-1">Belum Ada Konten</p>
        <p class="text-sm text-on-surface-variant">Download aktivitas dari server terlebih dahulu.</p>
      </div>
    {/if}
  {/if}

  {#if dlMsg}
    <p class="text-xs text-primary mt-4 text-center font-medium">{dlMsg}</p>
  {/if}
</div>

<!-- Simple Item Reader Modal -->
{#if activeStory || activeRoleplay || activeProject || activePuzzle}
  {@const item = activeStory || activeRoleplay || activeProject || activePuzzle}
  <div class="fixed inset-0 z-[100] bg-black/40 flex items-end lg:items-center justify-center lg:p-4">
    <div class="w-full max-w-md bg-canvas-cream rounded-t-[32px] lg:rounded-[32px] shadow-2xl border-4 border-[#B7D9BC] overflow-hidden max-h-[85vh] flex flex-col">
      <div class="p-5 flex items-center justify-between border-b-2 border-[#B7D9BC]/50 shrink-0">
        <h3 class="font-bold text-lg text-text-main truncate flex-1 mr-3">{item.title}</h3>
        <button onclick={() => { activeStory = null; activeRoleplay = null; activeProject = null; activePuzzle = null }}
          class="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center text-lg shrink-0 shadow-md">
          ✕
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-5 space-y-4">
        {#if item.emoji}
          <div class="w-full aspect-video rounded-2xl flex items-center justify-center text-6xl border-2 border-white shadow-md"
            style="background: {selectedType?.bg || '#E8F5E9'}">
            {item.emoji}
          </div>
        {/if}
        {#if item.desc}
          <p class="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
        {/if}
        {#if item.pages}
          {#each item.pages as page, i}
            <div class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm">
              <p class="text-xs font-bold text-primary mb-2">Halaman {i + 1}</p>
              {#if page.text}
                <p class="text-sm text-text-main leading-relaxed">{page.text}</p>
              {/if}
            </div>
          {/each}
        {/if}
        {#if item.steps}
          {#each item.steps as step, i}
            <div class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm">
              <p class="text-xs font-bold text-primary mb-1">Langkah {i + 1}</p>
              <p class="text-sm text-text-main">{step}</p>
            </div>
          {/each}
        {/if}
        {#if !item.pages && !item.steps && !item.desc}
          <p class="text-sm text-on-surface-variant text-center py-4">Konten belum tersedia</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
