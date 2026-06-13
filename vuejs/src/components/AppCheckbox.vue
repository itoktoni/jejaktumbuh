<template>
  <label class="flex items-start gap-3 cursor-pointer select-none" :class="{ 'opacity-50 pointer-events-none': disabled }">
    <div class="relative mt-0.5 shrink-0">
      <input type="checkbox" :checked="modelValue" :disabled="disabled"
        class="peer sr-only"
        @change="$emit('update:modelValue', $event.target.checked)" />
      <div class="w-5 h-5 rounded-md border-2 border-outline-variant bg-white transition-all peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40">
        <svg v-if="modelValue" class="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <span v-if="label" class="font-body-md text-sm text-text-main block">{{ label }}</span>
      <span v-if="description" class="text-xs text-on-surface-variant block mt-0.5">{{ description }}</span>
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
