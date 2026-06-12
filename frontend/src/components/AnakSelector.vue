<template>
  <div ref="wrapperRef" class="relative inline-block">
    <button @click="open = !open"
      class="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-2.5 soft-shadow border-2 border-outline-variant hover:border-primary transition-colors cursor-pointer min-w-[160px]">
      <span class="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0" :style="{ background: selectedAnak?.bg || '#E3F2FD' }">
        {{ selectedAnak?.emoji || '👶' }}
      </span>
      <span class="flex-1 text-left text-sm font-bold text-text-main truncate">{{ selectedAnak?.nama || 'Pilih Anak' }}</span>
      <span class="material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200"
        :class="{ 'rotate-180': open }">expand_more</span>
    </button>

    <Transition name="dropdown">
      <div v-if="open"
        class="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-outline-variant overflow-hidden z-50 min-w-[180px]">
        <div v-for="anak in anakList" :key="anak.id"
          @click="select(anak.id)"
          class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-surface-container-low"
          :class="{ 'bg-success-soft': anak.id === modelValue }">
          <span class="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0" :style="{ background: anak.bg }">
            {{ anak.emoji }}
          </span>
          <span class="text-sm font-medium text-text-main">{{ anak.nama }}</span>
          <span v-if="anak.id === modelValue" class="material-symbols-outlined text-primary text-lg ml-auto">check</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  anakList: { type: Array, default: () => [] },
  modelValue: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const wrapperRef = ref(null)

const selectedAnak = computed(() => props.anakList.find(a => a.id === props.modelValue))

function select(id) {
  emit('update:modelValue', id)
  open.value = false
}

function handleClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
