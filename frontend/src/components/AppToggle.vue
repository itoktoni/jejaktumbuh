<template>
  <label class="flex items-center gap-3 cursor-pointer select-none" :class="{ 'opacity-50 pointer-events-none': disabled }">
    <button type="button" role="switch" :aria-checked="modelValue"
      class="relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      :class="modelValue ? 'bg-primary border-primary' : 'bg-surface-container-high border-outline-variant'"
      @click="!disabled && $emit('update:modelValue', !modelValue)">
      <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"></span>
    </button>
    <div v-if="label || description" class="flex-1 min-w-0">
      <span v-if="label" class="font-label-lg text-text-main block">{{ label }}</span>
      <span v-if="description" class="text-xs text-on-surface-variant block">{{ description }}</span>
    </div>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])
</script>
