import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref('')
  const validationErrors = ref(null)
  const serverAnakList = ref([])
  const serverDate = ref(null)
  const trialDays = ref(10)
  const plans = ref([])
  const discounts = ref([])
  const affiliateConfig = ref({})
  const needsVerification = ref(false)
  const verificationGateway = ref('email')

  const isAuthenticated = computed(() => !!token.value)

  const userPlan = computed(() => user.value?.plan || null)
  const userRole = computed(() => user.value?.role || '')

  function init() {
    const storedToken = api.getAuthToken()
    if (storedToken) {
      token.value = storedToken
    }

    api.setVerificationCallback((gateway) => {
      needsVerification.value = true
      verificationGateway.value = gateway
    })
  }

  function applyServerData(data) {
    if (data.needs_verification) {
      needsVerification.value = true
      verificationGateway.value = data.verification_gateway || 'email'
    } else {
      needsVerification.value = false
    }
    if (data.user) {
      user.value = data.user
    }
    if (data.anak_list) {
      serverAnakList.value = data.anak_list
    }
    if (data.server_date) {
      serverDate.value = data.server_date
    }
    if (data.trial_days) {
      trialDays.value = data.trial_days
    }
    if (data.plans) {
      plans.value = data.plans
    }
    if (data.discounts) {
      discounts.value = data.discounts
    }
    if (data.affiliate_config) {
      affiliateConfig.value = data.affiliate_config
    }
  }

  async function login(email, password) {
    loading.value = true
    error.value = ''
    validationErrors.value = null

    try {
      const data = await api.login(email, password)
      token.value = data.access_token
      applyServerData(data)
      return data
    } catch (err) {
      error.value = err.message || 'Login gagal'
      validationErrors.value = err.errors || null
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(name, email, phone, password, passwordConfirmation, referralCode) {
    loading.value = true
    error.value = ''
    validationErrors.value = null

    try {
      const data = await api.register(name, email, phone, password, passwordConfirmation, referralCode)
      token.value = data.access_token
      applyServerData(data)
      return data
    } catch (err) {
      error.value = err.message || 'Registrasi gagal'
      validationErrors.value = err.errors || null
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    api.logout()
    token.value = null
    user.value = null
    serverAnakList.value = []
    serverDate.value = null
    needsVerification.value = false
    verificationGateway.value = 'email'
    localStorage.removeItem('lk_cache_user_id')
  }

  // Auto-init on store creation
  init()

  return {
    user,
    token,
    loading,
    error,
    validationErrors,
    isAuthenticated,
    serverAnakList,
    serverDate,
    trialDays,
    plans,
    discounts,
    affiliateConfig,
    needsVerification,
    verificationGateway,
    userPlan,
    userRole,
    login,
    register,
    logout,
    init,
    applyServerData
  }
})
