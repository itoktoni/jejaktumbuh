<template>
  <label class="flex items-start gap-3 cursor-pointer select-none" :class="{ 'opacity-50 pointer-events-none': disabled }">
    <div class="relative mt-0.5 shrink-0">
      <input type="radio" :name="name" :value="value" :checked="modelValue === value" :disabled="disabled"
        class="peer sr-only"
        @change="$emit('update:modelValue', value)" />
      <div class="w-5 h-5 rounded-full border-2 border-outline-variant bg-white transition-all peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
        <div v-if="modelValue === value" class="w-2.5 h-2.5 rounded-full bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
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
  modelValue: { type: [String, Number, Boolean], default: null },
  value: { type: [String, Number, Boolean], required: true },
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])
</script>
