<template>
  <nav class="mobile-nav fixed bottom-0 w-full z-50 rounded-t-[32px] bg-canvas-cream border-t-4 border-[#B7D9BC] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] flex justify-around items-center h-20 px-2 pb-safe">
    <button v-for="tab in mainTabs" :key="tab.id"
      class="flex flex-col items-center justify-center rounded-2xl px-5 py-2 active:scale-95 transition-all duration-150"
      :class="activeTab === tab.id ? 'bg-success-soft text-primary border-2 border-[#B7D9BC]' : 'text-on-surface-variant'"
      @click="$emit('switch', tab.id)">
      <span class="material-symbols-outlined" :style="iconStyle(tab.id)">
        {{ tab.icon }}
      </span>
      <span class="font-label-sm text-label-sm mt-0.5">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { bottomNav } from '../data/bottomNav.js'

const props = defineProps({
  activeTab: { type: String, required: true }
})

defineEmits(['switch'])

const mainTabs = computed(() => bottomNav)

function iconStyle(tabId) {
  return { fontVariationSettings: props.activeTab === tabId ? "'FILL' 1" : "'FILL' 0" }
}
</script>
