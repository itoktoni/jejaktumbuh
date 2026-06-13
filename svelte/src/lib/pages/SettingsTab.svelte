<script>
  import { appConfig } from '../config/appConfig.js'
  import { isAuthenticated } from '../stores/authStore.js'
  import { activitiesCache, serverCount, localCount, downloading, downloadMessage, loadFromCache, downloadActivities } from '../stores/activityStore.js'
  import { buildAktivitasDataFromAPI, setAktivitasData } from '../data/activities.js'
  import { get } from 'svelte/store'
  import { onMount } from 'svelte'

  let isAuth = $state(false)
  let dl = $state(false)
  let dlMsg = $state('')
  let locCnt = $state(0)

  $effect(() => {
    const u1 = isAuthenticated.subscribe(v => isAuth = v)
    const u2 = downloading.subscribe(v => dl = v)
    const u3 = downloadMessage.subscribe(v => dlMsg = v)
    const u4 = localCount.subscribe(v => locCnt = v)
    return () => { u1(); u2(); u3(); u4() }
  })

  onMount(() => { loadFromCache() })

  async function doDownload() {
    await downloadActivities()
    const cache = get(activitiesCache)
    if (cache) {
      setAktivitasData(buildAktivitasDataFromAPI(cache))
    }
  }
</script>

<div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
  <div class="space-y-6">
    <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-[#B7D9BC] shadow-lg">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#B7D9BC] shadow-sm shrink-0">
          <span class="material-symbols-outlined text-lg text-primary">sync</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-label-lg text-text-main">Sinkronisasi</p>
          <p class="text-xs text-on-surface-variant mt-0.5">Backup & restore data anak ke cloud</p>
        </div>
      </div>
      <p class="text-xs text-on-surface-variant mt-3">
        {isAuth ? 'Anda terhubung ke server. Data akan otomatis tersinkronisasi.' : 'Masuk untuk mengaktifkan sinkronisasi otomatis.'}
      </p>
    </div>

    <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-[#B7D9BC] shadow-lg">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#B7D9BC] shadow-sm shrink-0">
          <span class="material-symbols-outlined text-lg text-primary">notifications</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-label-lg text-text-main">Notifikasi</p>
          <p class="text-xs text-on-surface-variant mt-0.5">Atur pemberitahuan push dari server</p>
        </div>
      </div>
      <p class="text-xs text-on-surface-variant mt-3">Pemberitahuan akan muncul saat ada update atau pengingat dari server.</p>
    </div>

    <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-[#B7D9BC] shadow-lg">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#B7D9BC] shadow-sm shrink-0">
          <span class="material-symbols-outlined text-lg text-primary">download</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-label-lg text-text-main">Download Aktivitas</p>
          <p class="text-xs text-on-surface-variant mt-0.5">
            {locCnt > 0 ? `${locCnt} aktivitas tersimpan di perangkat` : 'Belum ada aktivitas diunduh'}
          </p>
        </div>
      </div>

      <button onclick={doDownload} disabled={dl || !isAuth}
        class="w-full mt-4 py-3 rounded-2xl text-sm font-bold btn-pop-green flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-lg" class:animate-spin={dl}>cloud_download</span>
        {dl ? 'Mengunduh...' : 'Download dari Server'}
      </button>

      {#if !isAuth}
        <p class="text-xs text-warm-bonding mt-2 text-center">Login untuk mengunduh aktivitas dari server</p>
      {/if}
      {#if dlMsg}
        <p class="text-xs text-primary mt-2 text-center font-medium">{dlMsg}</p>
      {/if}
    </div>

    <div class="text-center py-4">
      <p class="text-sm font-bold text-primary">{appConfig.name}</p>
      <p class="text-xs text-on-surface-variant">{appConfig.tagline}</p>
      <p class="text-xs text-on-surface-variant/60 mt-1">v1.0.0</p>
    </div>
  </div>
</div>

<style>
  .btn-pop-green {
    background-color: #6DBE7B;
    box-shadow: 0 4px 0 #176c33;
    transition: all 0.1s ease;
  }
  .btn-pop-green:active {
    transform: translateY(4px);
    box-shadow: 0 0px 0 #176c33;
  }
</style>
