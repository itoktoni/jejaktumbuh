<script>
  let { anakList = [], value = null, onselect = () => {} } = $props()

  const selected = $derived(anakList.find(a => a.id === value))
  const hasMultiple = $derived(anakList.length > 1)

  function handleChange(e) {
    onselect(Number(e.target.value))
  }
</script>

{#if hasMultiple}
  <div class="relative inline-block mb-4">
    <div class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
      <span class="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
        style="background: {selected?.bg || '#E3F2FD'}">{selected?.emoji || '👶'}</span>
    </div>
    <select value={value} onchange={handleChange}
      class="appearance-none bg-white rounded-2xl pl-16 pr-12 py-2.5 border-2 border-outline-variant hover:border-primary transition-colors cursor-pointer min-w-[180px] text-sm font-bold text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
      {#each anakList as anak}
        <option value={anak.id}>{anak.emoji || '👶'} {anak.nama}</option>
      {/each}
    </select>
    <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">expand_more</span>
  </div>
{:else if anakList.length === 1}
  <div class="flex items-center gap-2.5 mb-4">
    <span class="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
      style="background: {selected?.bg || '#E3F2FD'}">{selected?.emoji || '👶'}</span>
    <span class="text-sm font-bold text-text-main">{selected?.nama}</span>
  </div>
{/if}
