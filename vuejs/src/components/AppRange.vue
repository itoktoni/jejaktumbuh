<template>
  <div>
    <label v-if="label" class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{{ label }}</label>
    <div class="flex items-center gap-3">
      <input type="range" :value="modelValue" :min="min" :max="max" :step="step" :disabled="disabled"
        class="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
        @input="$emit('update:modelValue', Number($event.target.value))" />
      <span v-if="showValue" class="text-sm font-bold text-primary w-10 text-right">{{ modelValue }}{{ suffix }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  label: { type: String, default: '' },
  suffix: { type: String, default: '' },
  showValue: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])
</script>
