<script>
  import { get } from 'svelte/store'
  import { onMount } from 'svelte'
  import { aktivitasData, buildAktivitasDataFromAPI, setAktivitasData } from '../data/activities.js'
  import { activitiesCache, serverCount, localCount, downloading, downloadMessage, loadFromCache, checkServer, downloadActivities } from '../stores/activityStore.js'
  import { isAuthenticated } from '../stores/authStore.js'
  import { switchCounter, activeTab } from '../stores/appStore.js'

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

  $effect(() => {
    const u1 = aktivitasData.subscribe(v => aktData = v)
    const u2 = isAuthenticated.subscribe(v => isAuth = v)
    const u3 = downloading.subscribe(v => dl = v)
    const u4 = downloadMessage.subscribe(v => dlMsg = v)
    const u5 = serverCount.subscribe(v => srvCount = v)
    const u6 = localCount.subscribe(v => locCount = v)
    const u7 = switchCounter.subscribe(v => switchCount = v)
    return () => { u1(); u2(); u3(); u4(); u5(); u6(); u7() }
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
    story: 'stories', roleplay: 'roles', game: 'games',
    monolog: 'scripts', project: 'projects', music: 'songs',
    puzzle: 'puzzles', mindfulness: 'exercises', outdoor: 'activities',
    ilmu_pengetahuan: 'experiments', worksheet: 'worksheets'
  }

  function getItems(type) {
    return type[contentKeyMap[type.feature]] || []
  }

  function getItemCount(type) {
    return getItems(type).length
  }

  const sortedItems = $derived.by(() => {
    if (!selectedType) return []
    const items = getItems(selectedType)
    return [...items].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  })

  onMount(() => {
    loadFromCache()
    checkServer()
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
  {#if isAuth && !selectedType}
    <div class="mb-4 bg-canvas-cream rounded-2xl p-4 border-4 border-[#B7D9BC] shadow-md flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#B7D9BC] shadow-sm shrink-0">
        <span class="material-symbols-outlined text-lg text-primary">cloud_download</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-text-main">
          {locCount > 0 ? `${locCount} aktivitas di perangkat` : 'Belum ada aktivitas'}
        </p>
        <p class="text-[10px] text-on-surface-variant">Download dari server untuk mendapatkan konten terbaru</p>
      </div>
      <button onclick={doDownload} disabled={dl}
        class="px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 transition-all active:scale-95"
        style="background: {(srvCount - locCount) > 0 ? '#176c33' : '#999'}">
        <span class="material-symbols-outlined text-sm align-middle" class:animate-spin={dl}>cloud_download</span>
        {dl ? '...' : ((srvCount - locCount) > 0 ? `+${srvCount - locCount} Baru` : 'Sync')}
      </button>
    </div>
  {/if}

  {#if !selectedType}
    <section class="mb-stack-lg">
      <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight mb-2 flex items-center gap-2">
        <span class="w-10 h-10 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-xl">🎨</span> Semua Aktivitas
      </h2>
      <p class="font-body-md text-body-md text-on-surface-variant">Pilih jenis aktivitas untuk melihat seluruh konten.</p>
    </section>

    <div class="grid grid-cols-2 gap-3">
      {#each aktData as item (item.key)}
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
      <div class="space-y-3">
        {#each sortedItems as item (item.title)}
          <button
            class="bg-white rounded-2xl p-4 border-2 border-[#B7D9BC] shadow-sm flex items-center gap-3 w-full text-left hover:shadow-md transition-shadow"
            onclick={() => handleItemClick(item)}>
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style="background: {selectedType.bg}">
              {item.emoji || selectedType.emoji}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-label-lg text-label-lg text-primary">{item.title}</h3>
              {#if item.desc}
                <p class="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{item.desc}</p>
              {/if}
            </div>
            <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
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
