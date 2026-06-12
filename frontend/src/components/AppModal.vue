<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-end justify-center lg:items-center">
        <div class="absolute inset-0 bg-black/40" @click="closeOnBackdrop && $emit('update:modelValue', false)"></div>
        <div class="relative bg-canvas-cream w-full max-w-md lg:mb-0 border-4 border-[#B7D9BC] overflow-y-auto overscroll-contain"
          :class="fullscreen ? 'h-full lg:h-auto lg:rounded-[32px] rounded-t-[32px] border-b-0 lg:border-b-4' : 'rounded-t-[32px] lg:rounded-[32px] max-h-[85vh] border-b-0 lg:border-b-4'">
          <div class="p-6 pr-4 pb-8">
            <div v-if="!fullscreen" class="w-10 h-1 bg-[#B7D9BC] rounded-full mx-auto mb-5 lg:hidden -mt-2"></div>
            <div v-if="title" class="flex items-center justify-between mb-5">
              <h3 class="font-headline-md text-text-main">{{ title }}</h3>
              <button v-if="closable" @click="$emit('update:modelValue', false)"
                class="w-10 h-10 rounded-full bg-white border-2 border-[#B7D9BC] flex items-center justify-center hover:bg-success-soft transition-colors">
                <span class="material-symbols-outlined text-primary">close</span>
              </button>
            </div>
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  closable: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: true },
  fullscreen: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: translateY(100%);
}
.modal-leave-to .relative {
  transform: translateY(100%);
}
@media (min-width: 1024px) {
  .modal-enter-from .relative,
  .modal-leave-to .relative {
    transform: translateY(16px);
  }
}
.overflow-y-auto { scrollbar-width: thin; scrollbar-color: #B7D9BC transparent; }
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #B7D9BC; border-radius: 4px; }
</style>
