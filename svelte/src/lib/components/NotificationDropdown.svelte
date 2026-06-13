<script>
  import { notifications } from '../data/notifications.js'

  let { show = false, onclose } = $props()

  let notifRef = $state()
  let items = $state(notifications.map(n => ({ ...n })))
  let unreadCount = $derived(items.filter(n => !n.read).length)

  function markRead(id) {
    const item = items.find(n => n.id === id)
    if (item) item.read = true
  }

  function markAllRead() {
    items = items.map(n => ({ ...n, read: true }))
  }

  $effect(() => {
    if (!show) return
    function handleClick(e) {
      if (notifRef && !notifRef.contains(e.target)) {
        onclose?.()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  })
</script>

{#if show}
  <div bind:this={notifRef}
    class="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border-2 border-[#B7D9BC] w-80 sm:w-96 z-50 overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-success-soft/30">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-lg text-primary">notifications</span>
        <h3 class="text-sm font-bold text-text-main">Notifikasi</h3>
        {#if unreadCount > 0}
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-error text-white">{unreadCount}</span>
        {/if}
      </div>
      {#if unreadCount > 0}
        <button class="text-xs font-semibold text-primary hover:underline" onclick={markAllRead}>
          Tandai dibaca
        </button>
      {/if}
    </div>

    <div class="max-h-80 overflow-y-auto">
      {#each items as notif (notif.id)}
        <button class="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/50 last:border-b-0
          {!notif.read ? 'bg-success-soft/20' : ''}"
          onclick={() => markRead(notif.id)}>
          <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style="background: {notif.iconColor}15; color: {notif.iconColor}">
            <span class="material-symbols-outlined text-lg">{notif.icon}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-text-main truncate">{notif.title}</p>
              {#if !notif.read}
                <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
              {/if}
            </div>
            <p class="text-xs text-on-surface-variant leading-snug mt-0.5 line-clamp-2">{notif.message}</p>
            <p class="text-[10px] text-on-surface-variant/60 mt-1">{notif.time}</p>
          </div>
        </button>
      {/each}
    </div>

    <div class="px-4 py-2.5 border-t border-outline-variant bg-surface-container-low/50 text-center">
      <button class="text-xs font-semibold text-primary hover:underline">Lihat Semua Notifikasi</button>
    </div>
  </div>
{/if}
