<script>
  import NotificationDropdown from '../components/NotificationDropdown.svelte'

  let { title = '', canInstallProp = false, userName = '', userEmail = '', userGender = '', onsync, oninstall, onprofile, onsettings, onbilling, onreferral, onlogout } = $props()

  let profileOpen = $state(false)
  let profileRef = $state()
  let notifOpen = $state(false)

  function getAvatarEmoji(gender) {
    return gender === 'female' ? '👩' : '👨'
  }

  $effect(() => {
    if (!profileOpen) return
    function handleClick(e) {
      if (profileRef && !profileRef.contains(e.target)) {
        profileOpen = false
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  })
</script>

<header class="hidden lg:flex fixed top-0 right-0 z-40 h-[72px] bg-canvas-cream items-center justify-between px-6 border-b-4 border-[#B7D9BC] shadow-md"
  style="left: 280px;">
  <h1 class="text-headline-md text-text-main">{title}</h1>
  <div class="flex items-center gap-2">
    {#if canInstallProp}
      <button class="w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200"
        onclick={() => oninstall?.()}>
        <span class="material-symbols-outlined text-xl">install_mobile</span>
      </button>
    {/if}
    <button class="w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200"
      onclick={() => onsync?.()}>
      <span class="material-symbols-outlined text-xl">cloud_sync</span>
    </button>
    <div class="relative">
      <button class="w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 border-[#B7D9BC] shadow-sm text-primary hover:opacity-80 transition-opacity duration-200 relative"
        onclick={() => { notifOpen = !notifOpen; profileOpen = false }}>
        <span class="material-symbols-outlined text-xl">notifications</span>
        <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-canvas-cream"></span>
      </button>
      <NotificationDropdown show={notifOpen} onclose={() => notifOpen = false} />
    </div>
    <div class="relative" bind:this={profileRef}>
      <button class="w-9 h-9 flex items-center justify-center rounded-full bg-success-soft border-2 border-[#B7D9BC] shadow-sm text-base hover:opacity-80 transition-opacity duration-200"
        onclick={() => { profileOpen = !profileOpen; notifOpen = false }}>
        {getAvatarEmoji(userGender)}
      </button>
      {#if profileOpen}
        <div class="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-outline-variant py-1 w-56 z-50">
          <div class="px-4 py-2 border-b border-outline-variant">
            <p class="text-sm font-semibold truncate">{userName}</p>
            <p class="text-xs text-on-surface-variant truncate">{userEmail}</p>
          </div>
          <button class="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low flex items-center gap-2" onclick={() => { profileOpen = false; onprofile?.() }}>
            <span class="material-symbols-outlined text-base">person</span> Profile
          </button>
          <button class="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low flex items-center gap-2" onclick={() => { profileOpen = false; onsettings?.() }}>
            <span class="material-symbols-outlined text-base">settings</span> Pengaturan
          </button>
          <button class="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low flex items-center gap-2" onclick={() => { profileOpen = false; onbilling?.() }}>
            <span class="material-symbols-outlined text-base">payments</span> Billing
          </button>
          <button class="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low flex items-center gap-2" onclick={() => { profileOpen = false; onreferral?.() }}>
            <span class="material-symbols-outlined text-base">share</span> Affiliate
          </button>
          <hr class="border-outline-variant" />
          <button class="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low flex items-center gap-2 text-error" onclick={() => { profileOpen = false; onlogout?.() }}>
            <span class="material-symbols-outlined text-base">logout</span> Logout
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
