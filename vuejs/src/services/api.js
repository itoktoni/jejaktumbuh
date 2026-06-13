/**
 * API Service for Langkah Kecil - Startok Integration
 * Uses native fetch API (no axios dependency needed)
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

let authToken = null
let onVerificationRequired = null

export function setVerificationCallback(cb) {
  onVerificationRequired = cb
}

/**
 * Set auth token (call after login)
 */
export function setAuthToken(token) {
  authToken = token
  localStorage.setItem('lk_auth_token', token)
}

/**
 * Get stored auth token
 */
export function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem('lk_auth_token')
  }
  return authToken
}

/**
 * Clear auth token (logout)
 */
export function clearAuthToken() {
  authToken = null
  localStorage.removeItem('lk_auth_token')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getAuthToken()
}

/**
 * Base fetch wrapper with auth headers
 */
async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken()
  const url = `${API_BASE}${endpoint}`

  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearAuthToken()
    throw new Error('Unauthorized - please login again')
  }

  if (response.status === 403) {
    const body = await response.json().catch(() => ({}))
    if (body.needs_verification) {
      if (onVerificationRequired) {
        onVerificationRequired(body.verification_gateway || 'email')
      }
      const err = new Error(body.message || 'Akun belum terverifikasi')
      err.needs_verification = true
      err.verification_gateway = body.verification_gateway
      throw err
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    const err = new Error(error.message || `HTTP ${response.status}`)
    err.errors = error.errors || error.data || null
    throw err
  }

  return response.json()
}

// ==================== AUTH ====================

/**
 * Get current user profile
 */
export async function getMe() {
  return apiFetch('/me')
}

/**
 * Update user profile
 */
export async function updateProfile(data) {
  return apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Change password
 */
export async function changePassword(currentPassword, newPassword, newPasswordConfirmation) {
  return apiFetch('/password', {
    method: 'PUT',
    body: JSON.stringify({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPasswordConfirmation,
    }),
  })
}

export async function updateAffiliateCode(code) {
  return apiFetch('/affiliate-code', {
    method: 'PUT',
    body: JSON.stringify({ affiliate_code: code }),
  })
}

export async function getReferrals() {
  return apiFetch('/referrals')
}

export async function getMyDiscounts() {
  return apiFetch('/discounts')
}

export async function createDiscount(data) {
  return apiFetch('/discounts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteDiscount(id) {
  return apiFetch(`/discounts/${id}`, {
    method: 'DELETE',
  })
}

export async function updateRekening(data) {
  return apiFetch('/rekening', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function requestCashout(amount) {
  return apiFetch('/cashout', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export async function getCashouts() {
  return apiFetch('/cashouts')
}

/**
 * Purchase a plan
 */
export async function purchasePlan(planId, discountCode = null) {
  const body = { plan_id: planId }
  if (discountCode) body.discount_code = discountCode
  return apiFetch('/purchase-plan', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function createPayment(planId, discountCode = null) {
  const body = { plan_id: planId }
  if (discountCode) body.discount_code = discountCode
  return apiFetch('/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function validateDiscount(code, planId) {
  return apiFetch('/payments/validate-discount', {
    method: 'POST',
    body: JSON.stringify({ code, plan_id: planId }),
  })
}

export async function getPaymentStatus(paymentId) {
  return apiFetch(`/payments/${paymentId}`)
}

export async function settlePayment(paymentId) {
  return apiFetch(`/payments/${paymentId}/settle`, {
    method: 'POST',
  })
}

export async function cancelPayment(paymentId) {
  return apiFetch(`/payments/${paymentId}/cancel`, {
    method: 'POST',
  })
}

export async function getPaymentHistory() {
  return apiFetch('/payments')
}

/**
 * Get plans (public)
 */
export async function getPlans() {
  return apiFetch('/langkahkecil/plans')
}

/**
 * Login to Startok API
 */
export async function login(email, password) {
  const data = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (data.access_token) {
    setAuthToken(data.access_token)
  }

  return data
}

/**
 * Register a new user
 */
export async function register(name, email, phone, password, passwordConfirmation, referralCode) {
  const body = {
    name,
    email,
    phone,
    password,
    password_confirmation: passwordConfirmation,
  }
  if (referralCode) body.ref = referralCode
  const data = await apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (data.access_token) {
    setAuthToken(data.access_token)
  }

  return data
}

/**
 * Logout
 */
export async function logout() {
  try {
    await apiFetch('/logout', { method: 'POST' })
  } catch (e) {
    // Ignore errors on logout
  }
  clearAuthToken()
}

/**
 * Send verification code
 */
export async function sendVerification(channel) {
  return apiFetch('/send-verification', {
    method: 'POST',
    body: JSON.stringify({ channel }),
  })
}

/**
 * Verify code
 */
export async function verifyCode(code) {
  return apiFetch('/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

// ==================== ANAK (Children) ====================

/**
 * Get all children for current user
 */
export async function getAnakList() {
  return apiFetch('/langkahkecil/anak')
}

/**
 * Add a new child
 */
export async function addAnak(anak) {
  return apiFetch('/langkahkecil/anak', {
    method: 'POST',
    body: JSON.stringify(anak),
  })
}

/**
 * Update a child
 */
export async function updateAnak(id, data) {
  return apiFetch(`/langkahkecil/anak/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a child
 */
export async function deleteAnak(id) {
  return apiFetch(`/langkahkecil/anak/${id}`, {
    method: 'DELETE',
  })
}

// ==================== SKILLS ====================

/**
 * Add a skill to a child
 */
export async function addSkill(anakId, skill) {
  return apiFetch(`/langkahkecil/anak/${anakId}/skills`, {
    method: 'POST',
    body: JSON.stringify(skill),
  })
}

/**
 * Update a skill
 */
export async function updateSkill(anakId, skillId, data) {
  return apiFetch(`/langkahkecil/anak/${anakId}/skills/${skillId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a skill
 */
export async function deleteSkill(anakId, skillId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/skills/${skillId}`, {
    method: 'DELETE',
  })
}

// ==================== ACTIVITIES ====================

/**
 * Add an activity to a child
 */
export async function addActivity(anakId, activity) {
  return apiFetch(`/langkahkecil/anak/${anakId}/activities`, {
    method: 'POST',
    body: JSON.stringify(activity),
  })
}

/**
 * Delete an activity
 */
export async function deleteActivity(anakId, activityId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/activities/${activityId}`, {
    method: 'DELETE',
  })
}

export async function toggleActivity(anakId, activityId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/activities/${activityId}/toggle`, {
    method: 'PUT',
  })
}

// ==================== COMPLETED SKILLS ====================

export async function addCompletedSkill(anakId, data) {
  return apiFetch(`/langkahkecil/anak/${anakId}/completed-skills`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteCompletedSkill(anakId, key) {
  return apiFetch(`/langkahkecil/anak/${anakId}/completed-skills/${key}`, {
    method: 'DELETE',
  })
}

// ==================== CHALLENGES ====================

/**
 * Add a challenge
 */
export async function addChallenge(anakId, challenge) {
  return apiFetch(`/langkahkecil/anak/${anakId}/challenges`, {
    method: 'POST',
    body: JSON.stringify(challenge),
  })
}

/**
 * Update a challenge
 */
export async function updateChallenge(anakId, challengeId, data) {
  return apiFetch(`/langkahkecil/anak/${anakId}/challenges/${challengeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a challenge
 */
export async function deleteChallenge(anakId, challengeId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/challenges/${challengeId}`, {
    method: 'DELETE',
  })
}

// ==================== CHALLENGE HISTORY ====================

/**
 * Add challenge history
 */
export async function addChallengeHistory(anakId, history) {
  return apiFetch(`/langkahkecil/anak/${anakId}/challenge-history`, {
    method: 'POST',
    body: JSON.stringify(history),
  })
}

// ==================== CHECKLISTS ====================

/**
 * Add a checklist
 */
export async function addChecklist(anakId, checklist) {
  return apiFetch(`/langkahkecil/anak/${anakId}/checklists`, {
    method: 'POST',
    body: JSON.stringify(checklist),
  })
}

/**
 * Update a checklist
 */
export async function updateChecklist(anakId, checklistId, data) {
  return apiFetch(`/langkahkecil/anak/${anakId}/checklists/${checklistId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a checklist
 */
export async function deleteChecklist(anakId, checklistId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/checklists/${checklistId}`, {
    method: 'DELETE',
  })
}

// ==================== SCHEDULES ====================

/**
 * Add a schedule
 */
export async function addSchedule(anakId, schedule) {
  return apiFetch(`/langkahkecil/anak/${anakId}/schedules`, {
    method: 'POST',
    body: JSON.stringify(schedule),
  })
}

/**
 * Update a schedule
 */
export async function updateSchedule(anakId, scheduleId, data) {
  return apiFetch(`/langkahkecil/anak/${anakId}/schedules/${scheduleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(anakId, scheduleId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/schedules/${scheduleId}`, {
    method: 'DELETE',
  })
}

// ==================== WORKSHEETS ====================

/**
 * Add a worksheet
 */
export async function addWorksheet(anakId, worksheet) {
  return apiFetch(`/langkahkecil/anak/${anakId}/worksheets`, {
    method: 'POST',
    body: JSON.stringify(worksheet),
  })
}

/**
 * Delete a worksheet
 */
export async function deleteWorksheet(anakId, worksheetId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/worksheets/${worksheetId}`, {
    method: 'DELETE',
  })
}

// ==================== FULL SYNC ====================

/**
 * Sync all local data to server
 */
export async function syncToServer(anakList) {
  return apiFetch('/langkahkecil/sync', {
    method: 'POST',
    body: JSON.stringify({ anak_list: anakList }),
  })
}

/**
 * Fetch all data from server
 */
export async function fetchFromServer() {
  return apiFetch('/langkahkecil/anak')
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(limit = 50) {
  return apiFetch(`/notifications?limit=${limit}`)
}

export async function markNotificationRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: 'PUT' })
}

export async function markAllNotificationsRead() {
  return apiFetch('/notifications/read-all', { method: 'PUT' })
}

export async function deleteNotification(id) {
  return apiFetch(`/notifications/${id}`, { method: 'DELETE' })
}

export async function clearAllNotifications() {
  return apiFetch('/notifications', { method: 'DELETE' })
}

// ==================== EVALUATIONS ====================

export async function getEvaluations(anakId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/evaluations`)
}

export async function addEvaluation(anakId, data) {
  return apiFetch(`/langkahkecil/anak/${anakId}/evaluations`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteEvaluation(anakId, evalId) {
  return apiFetch(`/langkahkecil/anak/${anakId}/evaluations/${evalId}`, {
    method: 'DELETE',
  })
}

// ==================== ACTIVITIES (Master Data) ====================

export async function getActivities(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/activities${qs ? '?' + qs : ''}`)
}

export async function getActivitiesGrouped() {
  return apiFetch('/activities?grouped=1')
}

export async function getActivityTypes() {
  return apiFetch('/activities/types')
}
