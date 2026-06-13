<template>
  <div id="checklist-card">
    <div class="bubble-bg b-1"></div>
    <div class="bubble-bg b-2"></div>
    <div class="bubble-bg b-3"></div>

    <div class="card-header">
      <div class="app-badge">
        <span style="font-size: 18px;">✨</span> {{ appName }} — {{ appTagline }}
      </div>
    </div>

    <div class="main-content-box">
      <h1 class="headline">{{ title }}</h1>
      <p class="description">
        <span class="child-name">{{ checkedCount }}/{{ items.length }} selesai</span>
        — Sudah menyelesaikan {{ checkedCount }} dari {{ items.length }} tugas hari ini!
      </p>

      <div class="items-list">
        <div v-for="(item, i) in items" :key="i" class="checklist-item" :class="{ done: item.done }">
          <span class="check-circle" :class="{ checked: item.done }">
            <span v-if="item.done">✓</span>
          </span>
          <span class="item-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="footer-link-container">
        <span class="link-label">Yuk selesaikan checklist</span>
        <a :href="referralUrl" class="footer-center">{{ referralDisplay }}</a>
      </div>
      <div class="footer-trophy">{{ percent >= 100 ? '🏆' : '💪' }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { appConfig } from '../config/appConfig.js'

const props = defineProps({
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  checkedCount: { type: Number, default: 0 },
  percent: { type: Number, default: 0 },
  referralCode: { type: String, default: '' }
})

const appName = appConfig.name
const appTagline = appConfig.tagline
const appUrl = import.meta.env.VITE_APP_URL || 'https://halobunda.app'

const referralUrl = computed(() => props.referralCode ? `${appUrl}?ref=${props.referralCode}` : '#')
const referralDisplay = computed(() => props.referralCode ? `${appUrl.replace('https://', '')}?ref=${props.referralCode}` : appUrl.replace('https://', ''))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,700;0,6..12,900;1,6..12,700&display=swap');

#checklist-card {
  width: 380px;
  min-height: 540px;
  background-color: rgb(46 125 50);
  border-radius: 60px;
  padding: 30px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 0px #1b4d1f, 0 30px 50px rgba(27, 77, 31, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Nunito Sans', sans-serif;
}

.bubble-bg {
  position: absolute;
  border-radius: 50%;
  z-index: 1;
}

.b-1 {
  width: 130px;
  height: 130px;
  background-color: #ffeaa7;
  top: -40px;
  right: -40px;
  opacity: 0.8;
}

.b-2 {
  width: 160px;
  height: 160px;
  background-color: #a1d2ff;
  bottom: -80px;
  left: -80px;
  opacity: 0.7;
}

.b-3 {
  width: 60px;
  height: 60px;
  background-color: #a3e6b9;
  top: 18%;
  left: -30px;
  opacity: 0.3;
}

.card-header {
  display: flex;
  align-items: center;
  z-index: 3;
}

.app-badge {
  background-color: #fffef9;
  color: rgb(46 125 50);
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 900;
  font-size: 14px;
  box-shadow: 0 6px 0px #e6e4dc;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.main-content-box {
  background-color: #fffef9;
  border-radius: 44px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 12px 0px #ebe9df;
  z-index: 3;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.headline {
  font-size: 28px;
  font-weight: 900;
  line-height: 1.15;
  color: rgb(46 125 50);
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: -0.5px;
}

.description {
  font-size: 14px;
  font-weight: 700;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.child-name {
  color: #ff6b81;
  font-weight: 900;
  padding: 4px 14px;
  border-radius: 16px;
  display: inline-block;
  box-shadow: 0 3px 0px #ffccd5;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.check-circle.checked {
  background: #2e7d32;
}

.item-label {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 600;
}

.checklist-item.done .item-label {
  color: #1f2937;
  font-weight: 800;
  text-decoration: line-through;
  text-decoration-color: #2e7d32;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  margin-top: 15px;
  z-index: 3;
  border-top: 4px dotted rgba(255, 255, 255, 0.4);
  position: relative;
}

.footer-link-container {
  background-color: rgba(255, 255, 255, 0.9);
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  padding: 10px 22px;
  border-radius: 20px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  max-width: 75%;
  box-shadow: 0 4px 0px rgba(27, 77, 31, 0.2);
}

.link-label {
  font-size: 10px;
  font-weight: 900;
  color: rgb(46 125 50);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.footer-center {
  text-decoration: none;
  color: rgb(46 125 50);
  font-size: 13px;
  font-weight: 900;
  word-break: break-all;
}

.footer-trophy {
  font-size: 46px;
  filter: drop-shadow(0px 5px 0px rgba(0, 0, 0, 0.1));
  margin-right: 5px;
}
</style>
