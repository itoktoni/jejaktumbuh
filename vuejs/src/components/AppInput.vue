<template>
  <div>
    <label v-if="label" :for="id" class="text-xs font-bold text-primary uppercase tracking-wider mb-1.5 block">{{ label }}</label>
    <div class="relative">
      <span v-if="icon" class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">{{ icon }}</span>
      <input :id="id" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
        :class="[inputClass, icon ? 'pl-10' : '']"
        class="w-full px-3 py-2.5 rounded-xl border-2 text-sm bg-white transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        @input="$emit('update:modelValue', $event.target.value)" />
    </div>
    <p v-if="error" class="text-xs text-error font-medium mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-on-surface-variant mt-1">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  icon: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: () => `input-${Math.random().toString(36).slice(2, 8)}` }
})

defineEmits(['update:modelValue'])

const inputClass = computed(() =>
  props.error
    ? 'border-error focus:border-error'
    : 'border-[#B7D9BC] focus:border-primary'
)
</script>
