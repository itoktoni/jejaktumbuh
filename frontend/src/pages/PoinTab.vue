<template>
  <div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">
    <h2 class="font-headline-md text-headline-md mb-4 flex items-center gap-2 justify-center">
      <span class="w-8 h-8 rounded-full bg-success-soft border-2 border-[#B7D9BC] flex items-center justify-center text-base">⭐</span> Point
    </h2>
    <div class="relative bg-canvas-cream rounded-[32px] border-4 border-[#B7D9BC] p-6 md:p-8 shadow-lg flex flex-col items-center overflow-hidden min-h-[360px] justify-center">
      <div class="absolute top-0 w-full h-32 bg-gradient-to-b from-success-soft to-transparent"></div>
      <div class="relative z-10 flex flex-col items-center mt-auto">
        <div class="text-7xl md:text-8xl mb-2 animate-bounce">🌱</div>
        <div class="w-32 h-4 bg-primary/10 rounded-full blur-md"></div>
        <div class="mt-8 text-center">
          <h3 class="font-headline-md text-primary mb-2">Benih Kebaikan</h3>
          <p class="text-on-surface-variant font-body-md max-w-[240px] mx-auto">
            Lakukan tantangan hari ini untuk menyiram bungamu hingga mekar!
          </p>
        </div>
      </div>
      <div class="mt-8 flex gap-3">
        <div class="flex flex-col items-center">
          <div class="w-14 h-14 rounded-full border-4 border-primary flex items-center justify-center text-primary font-bold text-lg bg-white shadow-sm">120</div>
          <span class="text-xs font-bold text-on-surface-variant mt-1 uppercase tracking-wider">Total Poin</span>
        </div>
      </div>
    </div>
    <div class="mt-stack-lg grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
      <div class="bg-canvas-cream p-6 rounded-[24px] border-4 border-[#B7D9BC] shadow-md text-center">
        <p class="text-sm text-on-surface-variant mb-1">Misi Selesai</p>
        <p class="font-headline-md text-primary">8</p>
      </div>
      <div class="bg-canvas-cream p-6 rounded-[24px] border-4 border-[#B7D9BC] shadow-md text-center">
        <p class="text-sm text-on-surface-variant mb-1">Level</p>
        <p class="font-headline-md text-warm-bonding">Tunas</p>
      </div>
    </div>
  </div>
