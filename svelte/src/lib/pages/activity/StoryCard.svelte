<script>
  import { onMount, onDestroy } from 'svelte'
  import { trackActivityView, updateActivity, getActivitiesGrouped } from '../../services/api.js'
  import { resolveCoverImage, resolveStoryImage } from '../../utils/images.js'
  import { userRole } from '../../stores/authStore.js'
  import { activitiesCache } from '../../stores/activityStore.js'
  import { buildAktivitasDataFromAPI, setAktivitasData } from '../../data/activities.js'


  let { item, bg, onclick } = $props()

  let showReader = $state(false)
  let currentPage = $state(0)
  let isFinished = $state(false)
  let isSpeaking = $state(false)
  let isSpeakingMoral = $state(false)
  let autoPlay = $state(false)
  let utterance = null
  let naratorVoice = null
  let userRoleVal = $state('')

  let devStatus = $state('')
  let devCoverFile = $state(null)
  let devSaving = $state(false)
  let devSaveMsg = $state('')
  let devOpen = $state(false)
  let copied = $state(false)

  $effect(() => {
    const unsub = userRole.subscribe(v => userRoleVal = v)
    return unsub
  })

  const statusColors = {
    approved: { bg: '#E1F2E5', text: '#176c33', label: 'Approved' },
    pending: { bg: '#FFF3E0', text: '#E65100', label: 'Pending' },
    review: { bg: '#E3F2FD', text: '#0D47A1', label: 'Review' },
    rejected: { bg: '#FFEBEE', text: '#C62828', label: 'Rejected' },
  }

  const pages = $derived(item.pages || [])
  const totalPages = $derived(pages.length)
  const currentPageData = $derived(pages[currentPage] || {})

  onMount(() => {
    loadVoices()
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
  })

  onDestroy(() => stopSpeech())

  function loadVoices() {
    if (!('speechSynthesis' in window)) return
    const voices = speechSynthesis.getVoices()
    naratorVoice = voices.find(v => v.lang === 'id-ID') || voices.find(v => v.lang.startsWith('id')) || null
  }

  function createUtterance(text) {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'id-ID'
    u.rate = 0.9
    u.pitch = 1.1
    if (naratorVoice) u.voice = naratorVoice
    return u
  }

  function openReader() {
    currentPage = 0
    isFinished = false
    showReader = true
    devStatus = item.status || 'approved'
    devCoverFile = null
    devSaveMsg = ''
    devOpen = false
    if (item.id) trackActivityView(item.id).catch(() => {})
  }

  function closeReader() {
    stopSpeech()
    showReader = false
  }

  function prevPage() {
    if (isFinished) {
      isFinished = false
      stopSpeech()
      return
    }
    if (currentPage > 0) {
      autoPlay = false
      stopSpeech()
      currentPage--
    }
  }

  function nextPage() {
    if (isFinished) {
      closeReader()
      return
    }
    autoPlay = false
    stopSpeech()
    if (currentPage < totalPages - 1) {
      currentPage++
    } else {
      isFinished = true
    }
  }

  function toggleSpeech() {
    if (isSpeaking) {
      autoPlay = false
      stopSpeech()
    } else {
      autoPlay = true
      speak()
    }
  }

  function speak() {
    if (!('speechSynthesis' in window)) return
    stopSpeech()
    utterance = createUtterance(currentPageData.text)
    utterance.onend = () => {
      isSpeaking = false
      if (autoPlay && currentPage < totalPages - 1) {
        currentPage++
        setTimeout(() => speak(), 400)
      } else {
        autoPlay = false
      }
    }
    utterance.onerror = () => { isSpeaking = false; autoPlay = false }
    speechSynthesis.speak(utterance)
    isSpeaking = true
  }

  function speakMoral() {
    if (!('speechSynthesis' in window)) return
    if (isSpeakingMoral) {
      speechSynthesis.cancel()
      isSpeakingMoral = false
      return
    }
    speechSynthesis.cancel()
    const u = createUtterance(item.moral)
    u.onend = () => { isSpeakingMoral = false }
    u.onerror = () => { isSpeakingMoral = false }
    speechSynthesis.speak(u)
    isSpeakingMoral = true
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) speechSynthesis.cancel()
    isSpeaking = false
    isSpeakingMoral = false
  }

  async function saveDevChanges() {
    if (!item.id) return
    devSaving = true
    devSaveMsg = ''
    try {
      const formData = new FormData()
      formData.append('status', devStatus)
      if (devCoverFile) formData.append('image', devCoverFile)
      await updateActivity(item.id, formData)
      item.status = devStatus
      devSaveMsg = 'Berhasil!'
      devCoverFile = null
      const { saveSetting } = await import('$lib/db.js')
      const serverData = await getActivitiesGrouped()
      if (serverData && typeof serverData === 'object') {
        await saveSetting('activities_cache', serverData)
        activitiesCache.set(serverData)
        setAktivitasData(buildAktivitasDataFromAPI(serverData))
      }
    } catch (e) {
      devSaveMsg = 'Gagal: ' + (e.message || 'Error')
    }
    devSaving = false
  }
</script>

<button class="group cursor-pointer w-full text-left"
  onclick={openReader}>
  <div class="relative transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-[-1deg]">
    <div class="bg-white rounded-[24px] overflow-hidden shadow-lg border-4 relative"
      style="border-color: {userRoleVal === 'developer' && item.status && item.status !== 'approved' ? (statusColors[item.status]?.text || '#E65100') + '80' : '#B7D9BC'}">
      <div class="aspect-square p-2 overflow-hidden relative rounded-t-[20px]">
        {#if item.image}
          <img src={resolveCoverImage(item.id, item.image)} alt={item.title} class="w-full h-full object-cover group-hover:scale-110 rounded-2xl transition-transform duration-700" onerror={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
          <div class="w-full h-full flex-col items-center justify-center absolute inset-0 rounded-lg" style="background: {bg}; display: none">
            <span class="text-5xl mb-1">🖼️</span>
            <p class="text-xs font-bold text-on-surface-variant">No Image</p>
          </div>
        {:else}
          <div class="w-full h-full flex flex-col items-center justify-center rounded-lg" style="background: {bg}">
            <span class="text-5xl mb-1">🖼️</span>
            <p class="text-xs font-bold text-on-surface-variant">No Image</p>
          </div>
        {/if}
        <div class="absolute bottom-2 left-2">
          {#if userRoleVal === 'developer' && item.status && item.status !== 'approved'}
            {@const sc = statusColors[item.status] || statusColors.pending}
            <div class="rounded-full ml-1 mb-1 px-2.5 py-1 text-[10px] font-bold shadow-sm" style="background: {sc.bg}; color: {sc.text}">
              {sc.label}
            </div>
          {/if}
        </div>
        <div class="absolute bottom-2 right-2">
          {#if totalPages > 0}
            <div class="bg-white/90 backdrop-blur-sm rounded-full mr-1 mb-1 px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm">
               {totalPages} Halaman
            </div>
          {/if}
        </div>
      </div>
      <div class="px-3 py-2.5 space-y-1">
        <h3 class="text-sm font-semibold text-on-surface line-clamp-2 leading-tight">{item.title}</h3>
        {#if item.moral}
          <p class="text-[10px] text-on-surface-variant line-clamp-1">💬 {item.moral}</p>
        {/if}
      </div>
      <div class="px-3 py-2.5 flex items-center justify-between bg-success-soft">
        <div class="flex items-center gap-1.5 text-xs text-text-secondary">
          <span class="material-symbols-outlined text-sm text-primary">visibility</span>
          <span class="font-medium">{item.views || 0}</span>
        </div>

        {#if totalPages > 0}
          <div class="flex items-center gap-1.5 text-xs text-text-secondary">
            <span class="material-symbols-outlined text-sm text-primary">schedule</span>
            <span class="font-medium">+{Math.ceil(totalPages * 0.5)} menit</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</button>

{#if showReader}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-[100] bg-black/40 flex items-end lg:items-center justify-center lg:p-4" onclick={closeReader}>
    <div class="w-full max-w-md bg-canvas-cream lg:rounded-[40px] lg:shadow-2xl lg:border-8 border-[#B7D9BC] overflow-hidden flex flex-col h-[100dvh] lg:h-[852px] relative" onclick={(e) => e.stopPropagation()}>

      <div class="px-4 pt-4 pb-2 flex items-center gap-3 z-10 shrink-0">
        <div class="bg-primary text-on-primary w-11 h-11 rounded-full border-4 border-white shadow-md flex items-center justify-center text-xs font-bold shrink-0">
          {isFinished ? '✓' : `${currentPage + 1}/${totalPages}`}
        </div>
        <div class="flex-1 min-w-0 bg-primary text-on-primary px-4 py-2 rounded-2xl border-4 border-white shadow-md">
          <p class="text-base font-semibold truncate">{item.title}</p>
        </div>
        {#if userRoleVal === 'developer'}
          <button onclick={(e) => { e.stopPropagation(); devOpen = !devOpen }}
            class="w-11 h-11 border-4 border-white rounded-full flex items-center justify-center text-lg shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
            style="background: {statusColors[item.status]?.bg || '#FFF3E0'}; color: {statusColors[item.status]?.text || '#E65100'}">
            <span class="material-symbols-outlined text-xl">edit</span>
          </button>
        {/if}
        <button onclick={closeReader}
          class="w-11 h-11 bg-error border-4 border-white text-white rounded-full flex items-center justify-center text-xl shadow-md hover:scale-105 active:scale-95 transition-all shrink-0">
          ✕
        </button>
      </div>

      {#if userRoleVal === 'developer' && devOpen}
        <div class="mx-4 mb-2 p-3 rounded-2xl border-2 border-[#B7D9BC] bg-white space-y-2 shrink-0">
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-on-surface-variant shrink-0">Status</label>
            <select bind:value={devStatus}
              class="flex-1 px-3 py-1.5 rounded-xl border-2 border-[#B7D9BC] text-sm font-bold bg-white focus:border-primary outline-none">
              <option value="pending">Pending</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-on-surface-variant shrink-0">Cover</label>
            <label class="flex-1 px-3 py-1.5 rounded-xl border-2 border-dashed border-[#B7D9BC] text-xs text-on-surface-variant bg-white cursor-pointer hover:border-primary transition-colors truncate">
              {devCoverFile ? devCoverFile.name : 'Pilih gambar...'}
              <input type="file" accept="image/*" class="hidden" onchange={(e) => devCoverFile = e.target.files[0] || null} />
            </label>
          </div>
          <div class="flex items-center gap-2">
            <button onclick={() => { if (item.prompt) { navigator.clipboard.writeText(item.prompt); copied = true; setTimeout(() => copied = false, 2000) } }}
              class="py-2 px-3 rounded-xl text-xs font-bold border-2 bg-white text-on-surface-variant hover:border-primary transition-all shrink-0 disabled:opacity-40 flex items-center gap-1"
              style="border-color: {copied ? '#176c33' : '#B7D9BC'}; {copied ? 'background: #E1F2E5; color: #176c33' : ''}"
              disabled={!item.prompt}
              title={item.prompt || 'No prompt'}>
              <span class="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
            <button onclick={saveDevChanges} disabled={devSaving}
              class="flex-1 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50"
              style="background: #176C33; box-shadow: 0 3px 0 #0d4a22;">
              {devSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
            {#if devSaveMsg}
              <p class="text-xs font-bold" class:text-primary={devSaveMsg.includes('!')} class:text-error={devSaveMsg.includes('Gagal')}>{devSaveMsg}</p>
            {/if}
          </div>
        </div>
      {/if}

      {#if !isFinished}
        <div class="flex-1 flex flex-col justify-center px-4 gap-4 overflow-hidden">

          <div class="w-full max-h-[50vh] aspect-[3/4] bg-success-soft rounded-[32px] border-4 border-white shadow-lg overflow-hidden relative floating-illustration">
            {#if currentPageData.num}
              <img src={resolveStoryImage(item.id, currentPageData.num + '.png')} alt={currentPageData.text || item.title}
                class="w-full h-full object-cover" onerror={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
              <div class="w-full h-full flex-col items-center justify-center absolute inset-0" style="background: {bg || '#E8F5E9'}; display: none">
                <span class="text-5xl mb-1">🖼️</span>
                <p class="text-xs font-bold text-on-surface-variant">No Image</p>
              </div>
            {:else}
              <div class="w-full h-full flex flex-col items-center justify-center" style="background: {bg || '#E8F5E9'}">
                <span class="text-5xl mb-1">🖼️</span>
                <p class="text-xs font-bold text-on-surface-variant">No Image</p>
              </div>
            {/if}
          </div>

          <div class="bg-white rounded-[32px] border-4 border-[#B7D9BC] p-5 shadow-md relative">

            <p class="text-text-main text-base lg:text-lg text-center leading-relaxed font-medium">
              {currentPageData.text || 'Konten belum tersedia'}
            </p>
          </div>
        </div>
      {:else}
        <div class="flex-1 flex flex-col justify-center px-5 gap-5 overflow-y-auto py-6">
          <div class="flex flex-col items-center">
            <div class="w-20 h-20 bg-primary rounded-full border-4 border-white flex items-center justify-center text-5xl shadow-lg floating-illustration mb-1">
              🎉
            </div>
            <p class="text-primary text-xs mt-2 font-bold">Cerita Selesai!</p>
          </div>

          {#if item.moral}
            <div class="bg-white rounded-[32px] border-4 border-[#B7D9BC] p-5 shadow-md relative">

              <div class="flex items-center gap-2 mb-3 justify-center">
                <span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-base">💬</span>
                <p class="text-primary text-base font-bold">Pelajaran</p>
              </div>
              <p class="text-text-main text-base text-center leading-relaxed font-medium" style="font-style: italic;">
                {item.moral}
              </p>
            </div>

            <div class="flex justify-center">
              <button onclick={speakMoral}
                class="border-4 border-white px-5 py-2.5 rounded-full flex items-center gap-2 text-base font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
                class:bg-error={isSpeakingMoral}
                class:text-on-error={isSpeakingMoral}
                class:bg-primary={!isSpeakingMoral}
                class:text-on-primary={!isSpeakingMoral}>
                <span class="material-symbols-outlined text-xl">
                  {isSpeakingMoral ? 'stop' : 'volume_up'}
                </span>
                {isSpeakingMoral ? 'Berhenti' : 'Mainkan Pelajaran'}
              </button>
            </div>
          {/if}

          {#if item.creator}
            <div class="bg-white rounded-[24px] border-2 border-[#B7D9BC] p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-sm text-primary">person</span>
                </span>
                <p class="text-xs font-bold text-primary">Dibuat oleh</p>
              </div>
              <p class="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{item.creator}</p>
            </div>
          {/if}
        </div>
      {/if}

      <div class="p-4 bg-success-soft rounded-t-[40px] border-t-4 border-[#B7D9BC] flex flex-col gap-3 items-center shrink-0">
        <div class="w-full flex gap-3">
          <button onclick={prevPage} disabled={!isFinished && currentPage === 0}
            class="flex-1 py-3 px-4 rounded-2xl border border-stone-400 font-semibold text-base flex items-center justify-center gap-2 transition-all
              {!isFinished && currentPage === 0 ? 'text-on-surface-variant btn-pop-gray opacity-60 cursor-not-allowed' : 'text-text-main btn-pop-gray'}">
            <span class="material-symbols-outlined text-xl">arrow_back</span>
            {isFinished ? 'Baca Lagi' : 'Kembali'}
          </button>

          {#if !isFinished}
            <button onclick={toggleSpeech}
              class="py-3 px-4 rounded-2xl border-4 border-white flex items-center justify-center gap-1.5 text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
              class:bg-error={isSpeaking}
              class:text-on-error={isSpeaking}
              class:bg-primary={!isSpeaking}
              class:text-on-primary={!isSpeaking}>
              <span class="material-symbols-outlined text-lg" class:animate-pulse={!isSpeaking}>
                {isSpeaking ? 'stop' : 'volume_up'}
              </span>
              {isSpeaking ? 'Stop' : 'Mainkan'}
            </button>
          {/if}

          <button onclick={nextPage}
            class="flex-1 py-3 px-4 rounded-2xl border border-primary-400 text-white font-semibold text-base flex items-center justify-center gap-2 transition-all btn-pop-green">
            {isFinished ? 'Tutup' : currentPage === totalPages - 1 ? 'Selesai ✨' : 'Lanjut'}
            <span class="material-symbols-outlined text-xl">
              {isFinished ? 'close' : currentPage === totalPages - 1 ? 'check' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>

    </div>
  </div>
{/if}

<style>
  .btn-pop-green {
    background-color: #6DBE7B;
    box-shadow: 0 6px 0 #176c33;
    transition: all 0.1s ease;
  }
  .btn-pop-green:active {
    transform: translateY(6px);
    box-shadow: 0 0px 0 #176c33;
  }
  .btn-pop-gray {
    background-color: #E5E7EB;
    box-shadow: 0 6px 0 #9CA3AF;
    transition: all 0.1s ease;
  }
  .btn-pop-gray:active {
    transform: translateY(6px);
    box-shadow: 0 0px 0 #9CA3AF;
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
    100% { transform: translateY(0px); }
  }
  .floating-illustration {
    animation: float 4s ease-in-out infinite;
  }
</style>
