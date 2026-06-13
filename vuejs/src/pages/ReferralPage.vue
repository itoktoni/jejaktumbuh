<template>
  <div class="referral-page">
    <div class="ref-card">
      <div class="bubble-bg b-1"></div>
      <div class="bubble-bg b-2"></div>
      <div class="bubble-bg b-3"></div>

      <div class="ref-header">
        <span class="ref-logo">🌸</span>
        <h1 class="ref-title">{{ appName }}</h1>
      </div>

      <div class="ref-body">
        <div class="ref-emoji">🎉</div>
        <h2 class="ref-headline">KAMU DIUNDANG!</h2>
        <p class="ref-desc">
          Temanmu membagikan progress anaknya dari aplikasi <strong>{{ appName }}</strong>.
          Yuk ikutan bantu perkembangan anakmu juga!
        </p>
        <div class="ref-code-box">
          <span class="ref-code-label">Kode Referral</span>
          <span class="ref-code">{{ refCode }}</span>
        </div>
      </div>

      <div class="ref-footer">
        <button @click="goRegister" class="ref-cta">
          Daftar {{ appName }} 🚀
        </button>
        <p class="ref-small">{{ appTagline }} #1 di Indonesia</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { appConfig } from '../config/appConfig.js'

const appName = appConfig.name
const appTagline = appConfig.tagline

const refCode = ref('')

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  refCode.value = params.get('ref') || 'UNKNOWN'
})

function goRegister() {
  if (refCode.value && refCode.value !== 'UNKNOWN') {
    localStorage.setItem('lk_ref_code', refCode.value)
  }
  localStorage.setItem('lk_auth_mode', 'register')
  window.location.href = '/'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,700;0,6..12,900;1,6..12,700&display=swap');

.referral-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9, #fff8e1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Nunito Sans', sans-serif;
}

.ref-card {
  width: 100%;
  max-width: 420px;
  background-color: rgb(46 125 50);
  border-radius: 60px;
  padding: 30px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 0px #1b4d1f, 0 30px 50px rgba(27, 77, 31, 0.35);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.bubble-bg {
  position: absolute;
  border-radius: 50%;
  z-index: 1;
}

.b-1 {
  width: 150px;
  height: 150px;
  background-color: #ffeaa7;
  top: -35px;
  right: -35px;
  opacity: 0.9;
}

.b-2 {
  width: 190px;
  height: 190px;
  background-color: #a1d2ff;
  bottom: -50px;
  left: -50px;
  opacity: 0.9;
}

.b-3 {
  width: 80px;
  height: 80px;
  background-color: #a3e6b9;
  top: 32%;
  left: -25px;
  opacity: 0.4;
}

.ref-header {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
}

.ref-logo {
  font-size: 28px;
}

.ref-title {
  font-size: 22px;
  font-weight: 900;
  color: #fffef9;
  margin: 0;
}

.ref-body {
  background-color: #fffef9;
  border-radius: 44px;
  padding: 30px 24px;
  box-shadow: 0 12px 0px #ebe9df;
  z-index: 2;
  text-align: center;
}

.ref-emoji {
  font-size: 64px;
  margin-bottom: 12px;
}

.ref-headline {
  font-size: 32px;
  font-weight: 900;
  color: rgb(46 125 50);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: -0.5px;
}

.ref-desc {
  font-size: 15px;
  font-weight: 700;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.ref-code-box {
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
  border: 3px dashed rgb(46 125 50);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ref-code-label {
  font-size: 11px;
  font-weight: 900;
  color: #2e7d32;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ref-code {
  font-size: 36px;
  font-weight: 900;
  color: rgb(46 125 50);
  letter-spacing: 4px;
}

.ref-footer {
  z-index: 2;
  text-align: center;
}

.ref-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
  background-color: #fffef9;
  color: rgb(46 125 50);
  padding: 18px 24px;
  border-radius: 24px;
  font-weight: 900;
  font-size: 18px;
  text-decoration: none;
  box-shadow: 0 8px 0px #e6e4dc;
  transition: transform 0.15s;
  box-sizing: border-box;
}

.ref-cta-url {
  font-size: 12px;
  font-weight: 700;
  color: #2e7d32;
  opacity: 0.7;
  word-break: break-all;
  text-align: center;
}

.ref-cta:active {
  transform: translateY(4px);
  box-shadow: 0 4px 0px #e6e4dc;
}

.ref-small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 12px 0 0 0;
  font-weight: 700;
}
</style>
