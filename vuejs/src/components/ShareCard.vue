<template>
  <div id="progress-card">
    <div class="bubble-bg b-1"></div>
    <div class="bubble-bg b-2"></div>
    <div class="bubble-bg b-3"></div>

    <div class="card-header">
      <div class="app-badge">
        <span style="font-size: 18px;">✨</span> {{ appName }} — {{ appTagline }}
      </div>
    </div>

    <div class="main-content-box">
      <h1 class="headline">{{ headline }}</h1>
      <p class="description">
        Selamat untuk <span class="child-name">{{ childName }}</span>
        <template v-if="isComplete">
          Baru saja menyelesaikan
          <span class="highlight">"{{ challengeTitle }}"</span>
          dengan {{ maxPoints }} poin!
        </template>
        <template v-else>
          Progress <span class="highlight">"{{ challengeTitle }}"</span>
          {{ points }}/{{ maxPoints }} poin.
          <template v-if="notes">{{ notes }}</template>
        </template>
      </p>
    </div>

    <div class="card-footer">
      <div class="footer-link-container">
        <span class="link-label">Yuk selesaikan misi lagi</span>
        <a :href="referralUrl" class="footer-center">{{ referralDisplay }}</a>
      </div>
      <div class="footer-trophy">{{ isComplete ? '🏆' : '💪' }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { appConfig } from '../config/appConfig.js'

const props = defineProps({
  emoji: { type: String, default: '🚀' },
  challengeTitle: { type: String, default: '' },
  category: { type: String, default: '' },
  color: { type: String, default: '#2e7d32' },
  points: { type: Number, default: 0 },
  maxPoints: { type: Number, default: 10 },
  notes: { type: String, default: '' },
  isComplete: { type: Boolean, default: false },
  childName: { type: String, default: 'Anak' },
  referralCode: { type: String, default: '' }
})

const headline = computed(() => props.isComplete ? 'YAY! HEBAT MAKSIMAL' : 'TERUS SEMANGAT YA!')
const appName = appConfig.name
const appTagline = appConfig.tagline
const appUrl = import.meta.env.VITE_APP_URL || 'https://halobunda.app'
const referralUrl = computed(() => props.referralCode ? `${appUrl}?ref=${props.referralCode}` : '#')
const referralDisplay = computed(() => props.referralCode ? `${appUrl.replace('https://', '')}?ref=${props.referralCode}` : appUrl.replace('https://', ''))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,700;0,6..12,900;1,6..12,700&display=swap');

#progress-card {
  width: 380px;
  height: 540px;
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
  width: 100px;
  height: 100px;
  background-color: #ffeaa7;
  top: -50px;
  right: -50px;
  opacity: 0.7;
  z-index: 1;
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
  padding: 30px 24px;
  margin-top: 20px;
  box-shadow: 0 12px 0px #ebe9df;
  z-index: 3;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.headline {
  font-size: 34px;
  font-weight: 900;
  line-height: 1.15;
  color: rgb(46 125 50);
  margin: 0 0 14px 0;
  text-transform: uppercase;
  letter-spacing: -0.5px;
}

.description {
  font-size: 15px;
  font-weight: 700;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.child-name {
  color: rgb(46 125 50);
  font-weight: 900;
  display: inline-block;
}

.highlight {
  color: rgb(46 125 50);
  font-weight: 800;
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
