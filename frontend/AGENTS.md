# AGENTS.md - Frontend Design System

## Primary Color (Hero Color)

Our primary/hero color is:

```
rgb(23, 108, 51) / #176C33
```

This color is used for:
- Primary buttons (`btn-pop-green` box-shadow)
- Active states, selected states
- Price text, accent icons
- Headers, CTAs, important highlights

Tailwind reference: This maps to `#176C33` which is slightly darker than the default Tailwind `green-700`.

---

## Auth Flow (Login → Add Anak)

### Overview

User **wajib login/daftar** sebelum menggunakan app. Tidak ada skip login. Semua data diambil dari API, tidak ada cache di localStorage (kecuali auth token).

### Step 1: Login / Register

```
LoginPage.vue
  ├─ Login → authStore.login() → POST /api/login
  └─ Register → authStore.register() → POST /api/register
      └─ Ada referral code? → simpan affiliate_reff
```

**File:** `frontend/src/pages/LoginPage.vue`, `frontend/src/stores/authStore.js`

### Step 2: Auto-Subscribe Trial

Saat register, backend otomatis membuat subscription trial:

```
AuthController@register (backend)
  ├─ User dibuat dengan role = 'trial'
  ├─ Cari plan harga=0 (Free Trial 10 Hari)
  ├─ Create Subscribe:
  │   ├─ subscribe_id_plan = plan.plan_id
  │   ├─ subsribe_value = plan.plan_value (misal: 1)
  │   ├─ subscribe_trial_at = now()
  │   ├─ subscribe_start_at = now()
  │   └─ subscribe_end_at = now() + trial_days
  └─ user.plan = subscribe_id
```

**File:** `backend/app/Http/AuthController.php:163-189`

### Step 3: App Load After Login

```
App.vue → onLoginSuccess()
  ├─ syncServerData() — sync data dari server ke IndexedDB
  └─ seedAndLoad()
      ├─ validateAndClearIfDifferentUser(userId) — hapus cache jika user beda
      ├─ loadAnakList() — ambil dari API
      ├─ loadToolsData() — load challenge, checklist, dll
      └─ loadFromCache() — load activities
```

**File:** `frontend/src/App.vue:105-170`

### Step 4: Plan & Max Children

Setiap plan punya `plan_value` yang menentukan maksimal anak:

| plan_id | plan_nama | plan_value | plan_periode | plan_harga |
|---------|-----------|------------|--------------|------------|
| 1 | Free Trial 10 Hari | 1 | 10d | 0 |
| 2 | Member | 1 | 1y | 99000 |
| 3 | Premium | 3 | 1y | 159000 |
| 4 | Family | 3 | 1y | 149000 |

**File:** `backend/database/seeders/PlanSeeder.php`

### Step 5: Tambah Anak (dengan Validasi Limit)

```
ProfileTab.vue → tambahAnak()
  ├─ developer → no limits
  ├─ !userPlan → showUpgradePopup
  ├─ trial? → cek expired
  │   └─ expired → showUpgradePopup
  ├─ anakList.length >= maxChildren → showUpgradePopup
  └─ OK → anakStore.addAnak()
      ├─ POST /api/langkahkecil/anak
      │   └─ Backend cek:
      │       ├─ Subscribe → subsribe_value (max children)
      │       ├─ Count anak di DB
      │       └─ count >= max → 422 error
      └─ Sukses → push ke anakList + simpan ke IndexedDB
```

**File:** `frontend/src/pages/ProfileTab.vue:420-465`, `frontend/src/stores/anakStore.js:81-110`, `backend/app/Http/LangkahKecilController.php:49-85`

### Step 6: Upgrade Popup

Ketika limit tercapai, popup muncul:

```
ProfileTab.vue → showUpgradePopup = true
  ├─ [Nanti Saja] → close popup
  └─ [Lihat Paket] → switchTab('billing') → BillingTab.vue
```

**File:** `frontend/src/pages/ProfileTab.vue:230-260`

### Step 7: Billing & Payment

```
BillingTab.vue
  ├─ Pilih plan → selectPlan()
  ├─ Klik "Pilih Paket Ini" → startPayment()
  │   ├─ Buka checkout modal
  │   ├─ Input discount code (opsional)
  │   │   └─ validateDiscount() → GET /api/payments/validate-discount
  │   └─ Klik "Bayar" → confirmPayment()
  │       └─ POST /api/payments → create payment + QRIS
  ├─ Scan QRIS → polling status
  │   └─ GET /api/payments/{id} → cek status
  └─ Paid → ProcessPaidPayment job
      ├─ Create Subscribe baru
      ├─ Update user.plan + user.role
      └─ Process affiliate commission (jika ada)
```

**File:** `frontend/src/pages/BillingTab.vue`, `backend/app/Http/PaymentController.php`, `backend/app/Jobs/ProcessPaidPayment.php`

---

## Discount & Affiliate System

### Discount Code

Affiliate bisa buat discount code (max 3 per affiliate):

```
DiscountController@store → POST /api/discounts
  ├─ discount_code (uppercase, unique)
  ├─ discount_type (percentage / fixed)
  ├─ discount_value (max: commission_rate%)
  └─ discount_created_by = Auth::id() (via HasUserstamps)
```

**File:** `backend/app/Http/DiscountController.php`

### Discount Usage Flow

```
Customer pakai discount code → PaymentController@create
  ├─ Lookup discount dari tabel discounts (toUpperCase match)
  ├─ Hitung diskon (percentage atau fixed)
  └─ Simpan payment_diskon_code di payment

Payment settle → ProcessPaidPayment
  ├─ Lookup discount creator
  ├─ Komisi = commission_rate - discount_value
  ├─ affiliate_reff customer pindah ke discount creator
  └─ Create Affiliate record + update komisi
```

**File:** `backend/app/Http/PaymentController.php:40-55`, `backend/app/Jobs/ProcessPaidPayment.php:90-165`

### Komisi (Real-time Calculation)

Komisi tidak disimpan di field, tapi dihitung real-time:

```
komisi = SUM(affiliate_jumlah WHERE status != 'rejected')
       - SUM(cashout_jumlah + cashout_admin_fee WHERE status IN ('pending','completed'))
```

**File:** `backend/app/Models/User.php:96-113`

---

## Local Data Management

### Multi-User Protection

```
App.vue → seedAndLoad()
  └─ validateAndClearIfDifferentUser(userId)
      ├─ cek lk_cache_user_id di localStorage
      ├─ beda? → clearAllUserData() (hapus IndexedDB + lk_anak_cache)
      └─ set lk_cache_user_id = userId
```

### What's Stored Locally

| Data | Storage | Purpose |
|------|---------|---------|
| Auth token | localStorage `lk_auth_token` | Autentikasi |
| Cache user ID | localStorage `lk_cache_user_id` | Multi-user protection |
| Anak list | IndexedDB `anak` + localStorage `lk_anak_cache` | Offline-first |
| Challenges | IndexedDB `challenges` | Offline-first |
| Challenge History | IndexedDB `challengeHistory` | Offline-first |
| Checklists | IndexedDB `checklists` | Offline-first |
| Schedules | IndexedDB `schedules` | Offline-first |
| Worksheets | IndexedDB `worksheets` | Offline-first |

### What's NOT Stored Locally

| Data | Always from API |
|------|-----------------|
| User profile | `/me` |
| Plans | `/plans` |
| Discounts | `/discounts` |
| Affiliate/Earnings | `/referrals` |
| Cashouts | `/cashouts` |
| Payments | `/payments` |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `frontend/src/App.vue` | Main app, auth check, seedAndLoad |
| `frontend/src/pages/LoginPage.vue` | Login/Register |
| `frontend/src/pages/ProfileTab.vue` | Profile, tambah anak, upgrade popup |
| `frontend/src/pages/BillingTab.vue` | Plans, checkout, payment |
| `frontend/src/pages/ReferralTab.vue` | Affiliate, discount management, cashout |
| `frontend/src/stores/authStore.js` | Auth state, login/register/logout |
| `frontend/src/stores/anakStore.js` | Anak CRUD, sync with server |
| `frontend/src/stores/toolsStore.js` | Challenge, checklist, schedule |
| `frontend/src/services/api.js` | API client |
| `frontend/src/db.js` | IndexedDB (Dexie) |
| `backend/app/Http/AuthController.php` | Auth, register, me, affiliate |
| `backend/app/Http/PaymentController.php` | Payment, discount validation |
| `backend/app/Http/DiscountController.php` | Discount CRUD |
| `backend/app/Http/LangkahKecilController.php` | Anak CRUD, skills, activities |
| `backend/app/Jobs/ProcessPaidPayment.php` | Post-payment processing |
| `backend/app/Models/User.php` | User model with komisi() |
