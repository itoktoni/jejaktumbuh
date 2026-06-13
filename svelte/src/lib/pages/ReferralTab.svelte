<script>
  import { get } from 'svelte/store'
  import { user, isAuthenticated } from '../stores/authStore.js'
  import * as api from '../services/api.js'
  import AppButton from '../components/AppButton.svelte'
  import AppModal from '../components/AppModal.svelte'

  let userVal = $state(null)
  let isAuth = $state(false)
  let referrals = $state(null)
  let loading = $state(false)
  let copied = $state(false)
  let showEditModal = $state(false)
  let editCode = $state('')
  let editRekeningNama = $state('')
  let editRekeningBank = $state('')
  let editRekeningNomor = $state('')
  let saving = $state(false)
  let saveError = $state('')

  const banks = [
    { code: 'bca', name: 'BCA' }, { code: 'bni', name: 'BNI' }, { code: 'bri', name: 'BRI' },
    { code: 'mandiri', name: 'Mandiri' }, { code: 'bsi', name: 'BSI' }, { code: 'cimb', name: 'CIMB Niaga' },
    { code: 'danamon', name: 'Danamon' }, { code: 'permata', name: 'Permata' }, { code: 'btn', name: 'BTN' },
    { code: 'gopay', name: 'GoPay' }, { code: 'ovo', name: 'OVO' }, { code: 'dana', name: 'DANA' },
  ]

  $effect(() => {
    const u1 = user.subscribe(v => userVal = v)
    const u2 = isAuthenticated.subscribe(v => isAuth = v)
    return () => { u1(); u2() }
  })

  $effect(() => {
    if (isAuth) fetchReferrals()
  })

  async function fetchReferrals() {
    loading = true
    try {
      referrals = await api.getReferrals()
    } catch (e) { console.warn('Failed to fetch referrals:', e) }
    loading = false
  }

  const referralLink = $derived(
    userVal?.affiliate_code ? `${window?.location?.origin || 'https://langkahkecil.itoktoni.com'}?ref=${userVal.affiliate_code}` : ''
  )

  async function copyLink() {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      copied = true
      setTimeout(() => copied = false, 2000)
    } catch { /* fallback */ }
  }

  function shareLink() {
    if (navigator.share && referralLink) {
      navigator.share({ title: 'Jejak Tumbuh', text: 'Yuk coba Jejak Tumbuh - Pendamping Anak!', url: referralLink })
    }
  }

  function startEditData() {
    editCode = userVal?.affiliate_code || ''
    editRekeningNama = userVal?.rekening_nama || ''
    editRekeningBank = userVal?.rekening_bank || ''
    editRekeningNomor = userVal?.rekening_nomor || ''
    saveError = ''
    showEditModal = true
  }

  async function saveEditData() {
    saving = true; saveError = ''
    try {
      if (editCode !== userVal?.affiliate_code) {
        await api.updateAffiliateCode(editCode)
      }
      await api.updateRekening({
        rekening_nama: editRekeningNama,
        rekening_bank: editRekeningBank,
        rekening_nomor: editRekeningNomor,
      })
      const me = await api.getMe()
      user.set(me.user)
      showEditModal = false
    } catch (e) { saveError = e.message }
    saving = false
  }

  function formatRp(n) {
    return n ? `Rp${Number(n).toLocaleString('id-ID')}` : 'Rp0'
  }
</script>

<div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
  <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-primary shadow-lg mb-5">
    <div class="flex items-start gap-3 mb-5">
      <div class="w-12 h-12 rounded-full bg-success-soft flex items-center justify-center border-2 border-white shadow-sm shrink-0">
        <span class="material-symbols-outlined text-2xl text-primary">group_add</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-lg text-text-main">Ajak Teman</p>
        <p class="text-xs text-on-surface-variant mt-0.5">Bagikan link referral dan dapatkan manfaat bersama</p>
      </div>
    </div>

    <div class="bg-white rounded-xl p-4 border-2 border-primary mb-3">
      <p class="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">Kode Referral Kamu</p>
      <p class="text-2xl font-bold text-primary tracking-widest">{userVal?.affiliate_code || '-'}</p>
    </div>

    <div class="flex items-stretch bg-white rounded-xl border-2 border-primary overflow-hidden mb-3">
      <div class="flex-1 px-3 py-3 min-w-0 flex flex-col justify-center">
        <p class="text-[11px] text-on-surface-variant mb-0.5">Link Referral</p>
        <p class="text-sm font-bold text-primary truncate">{referralLink || '-'}</p>
      </div>
      <button onclick={copyLink}
        class="px-4 bg-primary hover:bg-primary/90 transition-colors text-white font-bold text-sm flex items-center gap-1.5 border-l-2 border-primary">
        <span class="material-symbols-outlined text-base">{copied ? 'check' : 'content_copy'}</span>
        {copied ? 'Tersalin!' : 'Salin'}
      </button>
    </div>

    <div class="flex gap-2">
      <button onclick={startEditData}
        class="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-success-soft transition-colors">
        <span class="material-symbols-outlined text-base">edit</span> Edit Data
      </button>
      <button onclick={shareLink}
        class="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 transition-colors">
        <span class="material-symbols-outlined text-base">share</span> Share Link
      </button>
    </div>
  </div>

  {#if referrals}
    <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md mb-4">
      <h4 class="text-xs font-bold text-primary uppercase tracking-wider mb-3">Ringkasan</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-xl p-3 border-2 border-[#B7D9BC]">
          <p class="text-[10px] text-on-surface-variant mb-0.5">Total Referral</p>
          <p class="text-lg font-bold text-text-main">{referrals.total_referrals || 0}</p>
        </div>
        <div class="bg-white rounded-xl p-3 border-2 border-[#B7D9BC]">
          <p class="text-[10px] text-on-surface-variant mb-0.5">Total Komisi</p>
          <p class="text-lg font-bold text-primary">{formatRp(referrals.total_komisi)}</p>
        </div>
      </div>
    </div>

    {#if referrals.affiliate?.length}
      <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
        <h4 class="text-xs font-bold text-primary uppercase tracking-wider mb-3">Riwayat Referral</h4>
        <div class="space-y-2">
          {#each referrals.affiliate as aff (aff.affiliate_id)}
            <div class="flex items-center gap-3 bg-white rounded-xl p-3 border-2 border-[#B7D9BC]">
              <div class="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-text-main truncate">{aff.affiliate_id_from_user_name || 'User'}</p>
                <p class="text-[10px] text-on-surface-variant">{aff.affiliate_tipe}</p>
              </div>
              <span class="text-xs font-bold text-primary">{formatRp(aff.affiliate_jumlah)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

  {#if loading}
    <div class="text-center py-8">
      <span class="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
    </div>
  {/if}
</div>

<AppModal show={showEditModal} title="Edit Data Rekening" onclose={() => showEditModal = false}>
  {#if saveError}
    <div class="bg-error-container text-on-error-container rounded-xl px-4 py-3 mb-4 text-sm">{saveError}</div>
  {/if}

  <div class="mb-3">
    <label for="edit-referral-code" class="text-xs text-on-surface-variant font-bold mb-1 block">Kode Referral</label>
    <input id="edit-referral-code" bind:value={editCode}
      class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white uppercase tracking-wider font-bold"
      placeholder="KODEUNIK" maxlength="20" />
  </div>

  <div class="mb-3">
    <label for="edit-rekening-nama" class="text-xs text-on-surface-variant font-bold mb-1 block">Nama Pemilik Rekening</label>
    <input id="edit-rekening-nama" bind:value={editRekeningNama}
      class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white"
      placeholder="Nama sesuai rekening" />
  </div>

  <div class="mb-3">
    <label for="edit-rekening-bank" class="text-xs text-on-surface-variant font-bold mb-1 block">Bank</label>
    <select id="edit-rekening-bank" bind:value={editRekeningBank}
      class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white">
      <option value="" disabled>Pilih bank</option>
      {#each banks as b}
        <option value={b.name}>{b.name}</option>
      {/each}
    </select>
  </div>

  <div class="mb-4">
    <label for="edit-rekening-nomor" class="text-xs text-on-surface-variant font-bold mb-1 block">Nomor Rekening</label>
    <input id="edit-rekening-nomor" bind:value={editRekeningNomor}
      class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white"
      placeholder="Nomor rekening" />
  </div>

  <AppButton variant="primary" loading={saving} onclick={saveEditData}>Simpan</AppButton>
</AppModal>
