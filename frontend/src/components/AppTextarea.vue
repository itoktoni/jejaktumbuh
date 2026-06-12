<template>
  <div>
    <label v-if="label" :for="id" class="text-xs font-bold text-primary uppercase tracking-wider mb-1.5 block">{{ label }}</label>
    <textarea :id="id" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :rows="rows"
      class="w-full px-3 py-2.5 rounded-xl border-2 border-[#B7D9BC] text-sm bg-white transition-colors focus:outline-none focus:border-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      @input="$emit('update:modelValue', $event.target.value)"></textarea>
    <p v-if="error" class="text-xs text-error font-medium mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-on-surface-variant mt-1">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: () => `textarea-${Math.random().toString(36).slice(2, 8)}` }
})

defineEmits(['update:modelValue'])
</script>
