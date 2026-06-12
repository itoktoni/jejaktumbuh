<template>
  <div>
    <label v-if="label" :for="id" class="text-xs font-bold text-primary uppercase tracking-wider mb-1.5 block">{{ label }}</label>
    <div class="relative">
      <select :id="id" :value="modelValue" :disabled="disabled"
        class="w-full px-3 py-2.5 pr-10 rounded-xl border-2 border-[#B7D9BC] text-sm bg-white transition-colors focus:outline-none focus:border-primary appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        @change="$emit('update:modelValue', $event.target.value)">
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <slot />
      </select>
      <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 text-xl pointer-events-none">expand_more</span>
    </div>
    <p v-if="error" class="text-xs text-error font-medium mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: () => `select-${Math.random().toString(36).slice(2, 8)}` }
})

defineEmits(['update:modelValue'])
</script>
