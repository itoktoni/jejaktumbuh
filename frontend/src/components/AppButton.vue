<template>
  <button :type="type" :disabled="disabled || loading"
    :class="[sizeClass, variantClass, block ? 'w-full' : '', 'inline-flex items-center justify-center gap-2 font-label-lg transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100']">
    <span v-if="loading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
    <span v-else-if="icon" class="material-symbols-outlined text-lg">{{ icon }}</span>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary', validator: v => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(v) },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg'].includes(v) },
  type: { type: String, default: 'button' },
  icon: { type: String, default: '' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const sizeClass = computed(() => ({
  sm: 'px-3 py-1.5 rounded-xl text-sm',
  md: 'px-4 py-2.5 rounded-xl text-sm',
  lg: 'px-6 py-3 rounded-2xl text-base'
}[props.size]))

const variantClass = computed(() => ({
  primary: 'bg-primary text-on-primary hover:bg-primary/90 shadow-md',
  secondary: 'bg-success-soft text-primary hover:bg-success-soft/80 border-2 border-[#B7D9BC]',
  outline: 'border-2 border-[#B7D9BC] text-on-surface-variant hover:bg-success-soft/50',
  ghost: 'text-on-surface-variant hover:bg-success-soft/50',
  danger: 'bg-error text-on-error hover:bg-error/90'
}[props.variant]))
</script>
