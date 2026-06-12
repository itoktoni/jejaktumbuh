<template>
  <div class="px-margin-mobile md:px-margin-desktop pt-5 max-w-6xl mx-auto pb-8">

    <!-- Hero Card -->
    <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-primary shadow-lg mb-5">
      <div class="flex items-start gap-3 mb-5">
        <div class="w-12 h-12 rounded-full bg-success-soft flex items-center justify-center border-2 border-white shadow-sm shrink-0">
          <span class="material-symbols-outlined text-2xl text-primary">group_add</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-lg text-text-main">Ajak Teman</p>
          <p class="text-xs text-on-surface-variant mt-0.5">Bagikan link referral dan dapatkan manfaat bersama</p>
        </div>
      </div>

      <!-- Code -->
      <div class="bg-white rounded-xl p-4 border-2 border-primary mb-3">
        <p class="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">Kode Referral Kamu</p>
        <p class="text-2xl font-bold text-primary tracking-widest">{{ auth.user?.affiliate_code || '-' }}</p>
      </div>

      <!-- Link + Salin -->
      <div class="flex items-stretch bg-white rounded-xl border-2 border-primary overflow-hidden mb-3">
        <div class="flex-1 px-3 py-3 min-w-0 flex flex-col justify-center">
          <p class="text-[11px] text-on-surface-variant mb-0.5">Link Referral</p>
          <p class="text-sm font-bold text-primary truncate">{{ referralLink }}</p>
        </div>
        <button @click="copyLink"
          class="px-4 bg-primary hover:bg-primary/90 transition-colors text-white font-bold text-sm flex items-center gap-1.5 border-l-2 border-primary">
          <span class="material-symbols-outlined text-base">{{ copied ? 'check' : 'content_copy' }}</span>
          {{ copied ? 'Tersalin!' : 'Salin' }}
        </button>
      </div>

      <!-- Edit Data + Share -->
      <div class="flex gap-2">
        <button @click="startEditData"
          class="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-success-soft transition-colors">
          <span class="material-symbols-outlined text-base">edit</span>
          Edit Data
        </button>
        <button @click="shareLink"
          class="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 transition-colors">
          <span class="material-symbols-outlined text-base">share</span>
          Share Link
        </button>
      </div>
    </div>

    <!-- Edit Data Modal -->
    <div v-if="editingData" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @mousedown.self="editingData = false">
      <div class="bg-canvas-cream rounded-[32px] p-6 border-4 border-[#B7D9BC] shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <h3 class="font-bold text-lg text-text-main mb-4">Edit Data Rekening</h3>

        <div class="mb-3">
          <label class="text-xs text-on-surface-variant font-bold mb-1 block">Kode Referral</label>
          <input v-model="editCodeValue"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white uppercase tracking-wider font-bold"
            placeholder="KODEUNIK" maxlength="20" />
          <p class="text-[10px] text-on-surface-variant mt-1">Huruf dan angka saja, 4-20 karakter</p>
        </div>

        <div class="mb-3">
          <label class="text-xs text-on-surface-variant font-bold mb-1 block">Nama Pemilik Rekening</label>
          <input v-model="rekeningForm.rekening_nama"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white"
            placeholder="Nama sesuai rekening" />
        </div>

        <div class="mb-3">
          <label class="text-xs text-on-surface-variant font-bold mb-1 block">Bank</label>
          <select v-model="rekeningForm.rekening_bank"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white">
            <option value="" disabled>Pilih bank</option>
            <option v-for="b in banks" :key="b.code" :value="b.name">{{ b.name }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="text-xs text-on-surface-variant font-bold mb-1 block">Nomor Rekening</label>
          <input v-model="rekeningForm.rekening_nomor"
            class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white"
            placeholder="Nomor rekening" />
        </div>

        <p v-if="editDataError" class="text-xs text-error font-medium mb-3">{{ editDataError }}</p>

        <div class="flex gap-3">
          <button @click="editingData = false"
            class="flex-1 py-3 rounded-2xl text-sm font-bold text-on-surface-variant btn-pop-gray">Batal</button>
          <button @click="saveData" :disabled="savingData"
            class="flex-1 py-3 rounded-2xl text-sm font-bold text-white btn-pop-green disabled:opacity-50">
            {{ savingData ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Cashout Modal -->
    <div v-if="showCashout" class="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" @mousedown.self="showCashout = false">
      <div class="bg-canvas-cream rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 border-4 border-primary shadow-xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <div class="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-4 sm:hidden"></div>
        <h3 class="font-bold text-lg text-text-main mb-2">Cairkan Komisi</h3>
        <p class="text-xs text-on-surface-variant mb-4">Saldo tersedia: <span class="font-bold text-primary">Rp{{ saldoTersedia.toLocaleString('id-ID') }}</span></p>

        <div class="mb-3">
          <label class="text-xs text-on-surface-variant font-bold mb-1 block">Nominal Pencairan</label>
          <div class="bg-white rounded-xl p-4 border-2 border-primary">
            <p class="text-2xl font-bold text-primary text-center mb-3">Rp{{ (cashoutAmount || 0).toLocaleString('id-ID') }}</p>
            <input v-model.number="cashoutAmount" type="range" :min="cashoutConfig.minimum" :max="maxCashout" :step="step"
              class="w-full accent-primary h-2 rounded-full appearance-none cursor-pointer" />
            <div class="flex justify-between text-[10px] text-on-surface-variant mt-1.5">
              <span>Rp{{ cashoutConfig.minimum.toLocaleString('id-ID') }}</span>
              <span>Rp{{ maxCashout.toLocaleString('id-ID') }}</span>
            </div>
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="cashoutAmount = cashoutConfig.minimum" class="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-success-soft text-primary">Min</button>
            <button @click="cashoutAmount = Math.floor(saldoTersedia * 0.25 / 1000) * 1000" class="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-success-soft text-primary">25%</button>
            <button @click="cashoutAmount = Math.floor(saldoTersedia * 0.5 / 1000) * 1000" class="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-success-soft text-primary">50%</button>
            <button @click="cashoutAmount = maxCashout" class="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-success-soft text-primary">Max</button>
          </div>
        </div>

        <div v-if="cashoutAmount >= cashoutConfig.minimum" class="bg-white rounded-xl p-3 border-2 border-[#B7D9BC] mb-3">
          <div class="flex justify-between text-xs text-on-surface-variant mb-1">
            <span>Platform Fee ({{ cashoutConfig.admin_rate }}%)</span>
            <span class="font-bold text-error">-Rp{{ adminFee.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between text-xs text-on-surface-variant mb-1">
            <span>Total Potongan</span>
            <span class="font-bold">Rp{{ (cashoutAmount + adminFee).toLocaleString('id-ID') }}</span>
          </div>
          <div class="border-t my-1.5"></div>
          <div class="flex justify-between text-sm font-bold text-text-main">
            <span>Diterima</span>
            <span class="text-primary">Rp{{ cashoutAmount.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div v-if="!hasRekening" class="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 mb-3">
          <p class="text-xs text-amber-700 font-medium">Lengkapi data rekening terlebih dahulu melalui tombol Edit Data.</p>
        </div>

        <p class="text-[11px] text-on-surface-variant mb-4">Pencairan diproses maksimal <span class="font-bold">1 hari kerja</span>.</p>

        <p v-if="cashoutError" class="text-xs text-error font-medium mb-3">{{ cashoutError }}</p>

        <div class="flex gap-3">
          <button @click="showCashout = false"
            class="flex-1 py-3 rounded-2xl text-sm font-bold text-on-surface-variant btn-pop-gray">Batal</button>
          <button @click="submitCashout" :disabled="cashingOut || !hasRekening"
            class="flex-1 py-3 rounded-2xl text-sm font-bold text-white btn-pop-green disabled:opacity-50">
            {{ cashingOut ? 'Memproses...' : 'Cairkan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b-2 border-[#B7D9BC] mb-5">
      <button @click="activeTab = 'affiliate'"
        class="flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-colors relative"
        :class="activeTab === 'affiliate' ? 'text-primary' : 'text-on-surface-variant'">
        Affiliate
        <div v-if="activeTab === 'affiliate'" class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"></div>
      </button>
      <button @click="activeTab = 'diskon'"
        class="flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-colors relative"
        :class="activeTab === 'diskon' ? 'text-primary' : 'text-on-surface-variant'">
        Diskon
        <div v-if="activeTab === 'diskon'" class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"></div>
      </button>
      <button @click="activeTab = 'pencairan'"
        class="flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-colors relative"
        :class="activeTab === 'pencairan' ? 'text-primary' : 'text-on-surface-variant'">
        Pencairan
        <div v-if="activeTab === 'pencairan'" class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"></div>
      </button>
    </div>

    <!-- Tab: Affiliate -->
    <div v-if="activeTab === 'affiliate'">
      <!-- Referral Stats -->
      <div class="space-y-3 mb-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md text-center">
            <p class="text-xs text-on-surface-variant mb-1">Total Referral</p>
            <p class="font-bold text-2xl text-text-main">{{ referrals.length }}</p>
            <p class="text-xs text-on-surface-variant">Orang bergabung</p>
          </div>
          <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md text-center">
            <p class="text-xs text-on-surface-variant mb-1">Bonus Register</p>
            <p class="font-bold text-2xl text-text-main">Rp{{ bonusRegister.toLocaleString('id-ID') }}</p>
            <p class="text-xs text-on-surface-variant">@{{ rates.register_bonus.toLocaleString('id-ID') }} per referral</p>
          </div>
        </div>
        <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
          <p class="text-xs text-on-surface-variant mb-1">Total Diperoleh</p>
          <p class="font-bold text-2xl text-text-main">Rp{{ totalEarned.toLocaleString('id-ID') }}</p>
          <p class="text-xs text-on-surface-variant">Akumulasi semua komisi + bonus register</p>
        </div>
      </div>

      <!-- Referral List -->
      <div v-if="referrals.length" class="space-y-3">
        <div v-for="r in referrals" :key="r.id"
          class="bg-canvas-cream rounded-2xl p-5 border-2 border-[#B7D9BC] flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-success-soft flex items-center justify-center border-2 border-white shadow-sm text-xl shrink-0">
            👤
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-base text-text-main truncate">{{ r.name }}</p>
            <p class="text-sm text-on-surface-variant truncate">{{ r.email }}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs font-bold px-2.5 py-1 rounded-lg"
              :class="r.role === 'trial' ? 'bg-amber-50 text-amber-600' : 'bg-success-soft text-primary'">
              {{ r.role === 'trial' ? 'Trial' : r.role === 'premium' ? 'Premium' : 'Aktif' }}
            </span>
            <p class="text-xs text-on-surface-variant mt-1.5">{{ formatDate(r.joined_at) }}</p>
          </div>
        </div>
      </div>

      <div v-else class="bg-canvas-cream rounded-[24px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <p class="text-4xl mb-2">🤝</p>
        <p class="text-sm text-on-surface-variant font-medium">Belum ada yang bergabung</p>
        <p class="text-xs text-on-surface-variant/60 mt-1">Bagikan link referral kamu untuk mengundang teman</p>
      </div>
    </div>

    <!-- Tab: Diskon -->
    <div v-if="activeTab === 'diskon'">
      <!-- Create Discount -->
      <div class="mb-5">
        <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-primary">sell</span>
            <p class="font-bold text-sm text-text-main">Buat Kode Diskon</p>
          </div>
          <p class="text-xs text-on-surface-variant mb-3">Maksimal {{ discountConfig.max_discounts }} kode diskon. Nilai maks {{ discountConfig.max_value }}%.</p>

          <div class="space-y-3">
            <div>
              <label class="text-xs text-on-surface-variant font-bold mb-1 block">Kode Promo</label>
              <input v-model="discountForm.discount_code"
                class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white font-bold uppercase tracking-wider"
                placeholder="Contoh: PROMO123" maxlength="20" />
              <p class="text-[10px] text-on-surface-variant mt-1">Huruf, angka, dan dash. 4-20 karakter. Harus unik.</p>
            </div>
            <div>
              <label class="text-xs text-on-surface-variant font-bold mb-1 block">Nama Diskon</label>
              <input v-model="discountForm.discount_nama"
                class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white"
                placeholder="Contoh: Promo Spesial" maxlength="100" />
            </div>
            <div>
              <label class="text-xs text-on-surface-variant font-bold mb-1 block">Diskon (%)</label>
              <input v-model.number="discountForm.discount_value" type="number" min="1"
                class="w-full px-4 py-3 rounded-xl border-2 border-[#B7D9BC] text-sm focus:outline-none focus:border-primary bg-white font-bold"
                :placeholder="`Maks ${discountConfig.max_value}`" />
            </div>
          </div>

          <p v-if="discountError" class="text-xs text-error font-medium mt-2">{{ discountError }}</p>

          <button @click="submitDiscount" :disabled="discountSaving || myDiscounts.length >= discountConfig.max_discounts"
            class="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
            {{ discountSaving ? 'Menyimpan...' : 'Buat Diskon' }}
          </button>
          <p v-if="myDiscounts.length >= discountConfig.max_discounts" class="text-[11px] text-on-surface-variant text-center mt-2">
            Batas maksimal {{ discountConfig.max_discounts }} kode diskon tercapai
          </p>
        </div>
      </div>

      <!-- Discount List -->
      <div v-if="myDiscounts.length" class="space-y-3">
        <div v-for="d in myDiscounts" :key="d.id"
          class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md relative overflow-hidden">
          <div class="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/5"></div>
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-0.5">Kode Promo</p>
              <p class="text-lg font-bold text-primary tracking-widest">{{ d.code }}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <button @click="copyCode(d)"
                class="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors shrink-0"
                :class="copiedId === d.id ? 'border-primary bg-success-soft text-primary' : 'border-[#B7D9BC] text-on-surface-variant hover:bg-success-soft'">
                <span class="material-symbols-outlined text-base">{{ copiedId === d.id ? 'check' : 'content_copy' }}</span>
              </button>
              <button @click="removeDiscount(d.id)"
                class="w-9 h-9 rounded-full flex items-center justify-center border-2 border-error/30 text-error hover:bg-error/10 transition-colors shrink-0">
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-text-main truncate">{{ d.name }}</p>
              <p class="text-xs text-on-surface-variant">Diskon</p>
            </div>
            <div class="bg-primary/10 rounded-xl px-3 py-2 text-center shrink-0">
              <p class="text-lg font-bold text-primary leading-tight">{{ d.value }}%</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-canvas-cream rounded-[24px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <p class="text-4xl mb-2">🏷️</p>
        <p class="text-sm text-on-surface-variant font-medium">Belum ada kode diskon</p>
        <p class="text-xs text-on-surface-variant/60 mt-1">Buat kode diskon untuk dibagikan ke customer</p>
      </div>
    </div>

    <!-- Tab: Pencairan -->
    <div v-if="activeTab === 'pencairan'">
      <!-- Saldo + Cashout Button -->
      <div class="space-y-3 mb-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-[#B7D9BC] shadow-md text-center">
            <p class="text-xs text-on-surface-variant mb-1">Sudah Dicairkan</p>
            <p class="font-bold text-xl text-text-main">Rp{{ totalCashedOut.toLocaleString('id-ID') }}</p>
            <p class="text-xs text-on-surface-variant">{{ cashouts.filter(c => c.cashout_status === 'completed').length }}x pencairan</p>
          </div>
          <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-primary shadow-md text-center">
            <p class="text-xs text-on-surface-variant mb-1">Menunggu Proses</p>
            <p class="font-bold text-xl text-amber-600">Rp{{ totalPendingCashout.toLocaleString('id-ID') }}</p>
            <p class="text-xs text-on-surface-variant">{{ cashouts.filter(c => c.cashout_status === 'pending').length }}x pending</p>
          </div>
        </div>
        <div class="bg-canvas-cream rounded-[24px] p-5 border-4 border-primary shadow-md">
          <p class="text-xs text-on-surface-variant mb-1">Saldo Tersedia</p>
          <p class="font-bold text-3xl text-primary">Rp{{ saldoTersedia.toLocaleString('id-ID') }}</p>
          <p class="text-xs text-on-surface-variant">Komisi bersih {{ rates.commission_rate }}% · Bisa dicairkan sekarang</p>
        </div>
        <p class="text-[11px] text-on-surface-variant text-center px-4">
          Saldo outstanding baru bisa dicairkan jika terdapat komisi dari upgrade referral.
          Bonus register akan masuk ke saldo setelah referral kamu melakukan upgrade.
        </p>
        <button @click="openCashout"
          class="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 transition-colors"
          :disabled="maxCashout < cashoutConfig.minimum">
          <span class="material-symbols-outlined text-base">payments</span>
          Cairkan Komisi Rp{{ saldoTersedia.toLocaleString('id-ID') }}
        </button>
      </div>

      <!-- Cashout History -->
      <div v-if="cashouts.length">
        <p class="text-sm font-bold text-text-main mb-3">Riwayat Pencairan</p>
        <div class="space-y-2">
          <div v-for="c in cashouts" :key="c.cashout_id"
            class="bg-canvas-cream rounded-2xl p-4 border-2 border-[#B7D9BC]">
            <div class="flex items-center justify-between mb-1">
              <p class="font-bold text-sm text-text-main">Rp{{ c.cashout_jumlah.toLocaleString('id-ID') }}</p>
              <span class="text-xs font-bold px-2.5 py-1 rounded-lg"
                :class="{
                  'bg-amber-50 text-amber-600': c.cashout_status === 'pending',
                  'bg-blue-50 text-blue-600': c.cashout_status === 'processing',
                  'bg-success-soft text-primary': c.cashout_status === 'completed',
                  'bg-red-50 text-red-600': c.cashout_status === 'rejected',
                }">
                {{ c.cashout_status === 'pending' ? 'Menunggu' : c.cashout_status === 'processing' ? 'Diproses' : c.cashout_status === 'completed' ? 'Selesai' : 'Ditolak' }}
              </span>
            </div>
            <div class="flex justify-between text-xs text-on-surface-variant">
              <span>Fee: Rp{{ c.cashout_admin_fee.toLocaleString('id-ID') }} · Diterima: Rp{{ c.cashout_diterima.toLocaleString('id-ID') }}</span>
              <span>{{ formatDate(c.cashout_created_at) }}</span>
            </div>
            <p class="text-[11px] text-on-surface-variant mt-1">{{ c.cashout_rekening_bank }} - {{ c.cashout_rekening_nomor }} a/n {{ c.cashout_rekening_nama }}</p>
          </div>
        </div>
      </div>

      <div v-else class="bg-canvas-cream rounded-[24px] p-8 text-center border-4 border-dashed border-[#B7D9BC]">
        <p class="text-4xl mb-2">💸</p>
        <p class="text-sm text-on-surface-variant font-medium">Belum ada riwayat pencairan</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { appConfig } from '../config/appConfig.js'
import * as api from '../services/api.js'

const auth = useAuthStore()

const activeTab = ref('affiliate')
const copied = ref(false)
const referrals = ref([])
const earnings = ref({ total: 0, register: 0, upgrade: 0, pending: 0 })
const rates = ref({ register_bonus: 500, commission_rate: 15 })
const cashoutConfig = ref({ minimum: 50000, admin_rate: 3 })
const banks = ref([])
const cashouts = ref([])

const editingData = ref(false)
const editCodeValue = ref('')
const editDataError = ref('')
const savingData = ref(false)
const rekeningForm = ref({ rekening_nama: '', rekening_bank: '', rekening_nomor: '' })

const showCashout = ref(false)
const cashoutAmount = ref(null)
const cashoutError = ref('')
const cashingOut = ref(false)

const myDiscounts = ref([])
const discountConfig = ref({ max_discounts: 3, max_value: 15, max_nominal: 10000 })
const discountForm = ref({ discount_code: '', discount_nama: '', discount_value: null })
const discountError = ref('')
const discountSaving = ref(false)
const copiedId = ref(null)

const appUrl = import.meta.env.VITE_APP_URL || 'https://halobunda.app'
const referralLink = computed(() => {
  const code = auth.user?.affiliate_code || ''
  return code ? `${appUrl}?ref=${code}` : ''
})

const bonusRegister = computed(() => referrals.value.length * rates.value.register_bonus)
const totalKomisi = computed(() => auth.user?.komisi ?? 0)
const totalEarned = computed(() => earnings.value.upgrade + bonusRegister.value)
const totalCashedOut = computed(() => cashouts.value.filter(c => c.cashout_status === 'completed').reduce((sum, c) => sum + c.cashout_jumlah, 0))
const totalPendingCashout = computed(() => cashouts.value.filter(c => c.cashout_status === 'pending').reduce((sum, c) => sum + c.cashout_jumlah, 0))
const saldoTersedia = computed(() => auth.user?.komisi ?? 0)
const maxCashout = computed(() => {
  const saldo = saldoTersedia.value
  const rate = cashoutConfig.value.admin_rate / 100
  return Math.floor(saldo / (1 + rate) / 1000) * 1000
})
const step = computed(() => {
  const saldo = saldoTersedia.value
  if (saldo >= 100000) return 5000
  if (saldo >= 50000) return 2000
  return 1000
})
const hasRekening = computed(() => auth.user?.rekening_nama && auth.user?.rekening_bank && auth.user?.rekening_nomor)
const adminFee = computed(() => Math.round((cashoutAmount.value || 0) * cashoutConfig.value.admin_rate / 100))
const received = computed(() => cashoutAmount.value || 0)

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) { console.warn('Copy failed:', e) }
}

async function shareLink() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Undangan ${appConfig.name}`,
        text: `Yuk coba ${appConfig.name} — ${appConfig.tagline}`,
        url: referralLink.value,
      })
    } catch (e) {
      if (e.name !== 'AbortError') copyLink()
    }
  } else {
    copyLink()
  }
}

function startEditData() {
  editCodeValue.value = auth.user?.affiliate_code || ''
  rekeningForm.value = {
    rekening_nama: auth.user?.rekening_nama || '',
    rekening_bank: auth.user?.rekening_bank || '',
    rekening_nomor: auth.user?.rekening_nomor || '',
  }
  editDataError.value = ''
  editingData.value = true
}

async function saveData() {
  editDataError.value = ''
  savingData.value = true
  try {
    const code = editCodeValue.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (code && code.length >= 4) {
      const codeRes = await api.updateAffiliateCode(code)
      if (codeRes.user) {
        auth.user = codeRes.user
      }
    }

    const rekRes = await api.updateRekening({ ...rekeningForm.value })
    if (rekRes.user) {
      auth.user = rekRes.user
    }

    editingData.value = false
  } catch (e) {
    editDataError.value = e.message || 'Gagal menyimpan data'
  } finally {
    savingData.value = false
  }
}

function openCashout() {
  cashoutAmount.value = maxCashout.value
  cashoutError.value = ''
  showCashout.value = true
}

async function submitCashout() {
  cashoutError.value = ''
  if (!cashoutAmount.value || cashoutAmount.value < cashoutConfig.value.minimum) {
    cashoutError.value = `Minimal pencairan Rp${cashoutConfig.value.minimum.toLocaleString('id-ID')}`
    return
  }
  if (cashoutAmount.value + adminFee.value > saldoTersedia.value) {
    cashoutError.value = 'Saldo komisi tidak mencukupi (termasuk platform fee)'
    return
  }
  cashingOut.value = true
  try {
    const res = await api.requestCashout(cashoutAmount.value)
    if (res.komisi !== undefined) {
      auth.user.komisi = res.komisi
    }
    if (res.cashout) {
      cashouts.value.unshift(res.cashout)
    }
    showCashout.value = false
  } catch (e) {
    cashoutError.value = e.message || 'Gagal memproses pencairan'
  } finally {
    cashingOut.value = false
  }
}

async function loadDiscounts() {
  try {
    const res = await api.getMyDiscounts()
    myDiscounts.value = res.discounts || []
    if (res.config) discountConfig.value = res.config
  } catch (e) { console.warn('Failed to load discounts:', e) }
}

async function submitDiscount() {
  discountError.value = ''
  const code = discountForm.value.discount_code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  if (!code || code.length < 4) {
    discountError.value = 'Kode promo minimal 4 karakter'
    return
  }
  if (!discountForm.value.discount_nama.trim()) {
    discountError.value = 'Nama diskon wajib diisi'
    return
  }
  if (!discountForm.value.discount_value || discountForm.value.discount_value < 1) {
    discountError.value = 'Nilai diskon minimal 1'
    return
  }
  if (discountForm.value.discount_type === 'percentage' && discountForm.value.discount_value > discountConfig.value.max_value) {
    discountError.value = `Maksimal ${discountConfig.value.max_value}%`
    return
  }
  discountSaving.value = true
  try {
    const res = await api.createDiscount({
      discount_code: code,
      discount_nama: discountForm.value.discount_nama.trim(),
      discount_type: 'percentage',
      discount_value: discountForm.value.discount_value,
    })
    if (res.discount) myDiscounts.value.unshift(res.discount)
    discountForm.value = { discount_code: '', discount_nama: '', discount_value: null }
  } catch (e) {
    discountError.value = e.errors ? Object.values(e.errors).flat()[0] : (e.message || 'Gagal membuat diskon')
  } finally {
    discountSaving.value = false
  }
}

async function removeDiscount(id) {
  try {
    await api.deleteDiscount(id)
    myDiscounts.value = myDiscounts.value.filter(d => d.id !== id)
  } catch (e) { console.warn('Failed to delete discount:', e) }
}

async function copyCode(d) {
  try {
    await navigator.clipboard.writeText(d.code)
    copiedId.value = d.id
    setTimeout(() => { copiedId.value = null }, 2000)
  } catch (e) { console.warn('Copy failed:', e) }
}

async function loadReferrals() {
  try {
    const res = await api.getReferrals()
    referrals.value = res.referrals || []
    if (res.earnings) earnings.value = res.earnings
    if (res.rates) rates.value = res.rates
    if (res.cashout) cashoutConfig.value = res.cashout
    if (res.banks) banks.value = res.banks
    if (res.komisi !== undefined && auth.user) {
      auth.user.komisi = res.komisi
    }
  } catch (e) { console.warn('Failed to load referrals:', e) }
}

async function loadCashouts() {
  try {
    const res = await api.getCashouts()
    cashouts.value = res.cashouts || []
  } catch (e) { console.warn('Failed to load cashouts:', e) }
}

async function refreshUser() {
  try {
    const me = await api.getMe()
    auth.applyServerData(me)
  } catch (e) { console.warn('Failed to refresh user:', e) }
}

onMounted(() => {
  refreshUser()
  loadReferrals()
  loadCashouts()
  loadDiscounts()
})
</script>

<style scoped>
.btn-pop-green { background-color: #6DBE7B; box-shadow: 0 4px 0 #176c33; transition: all 0.1s ease; }
.btn-pop-green:active { transform: translateY(4px); box-shadow: 0 0px 0 #176c33; }
.btn-pop-gray { background-color: #E5E7EB; box-shadow: 0 4px 0 #9CA3AF; transition: all 0.1s ease; }
.btn-pop-gray:active { transform: translateY(4px); box-shadow: 0 0px 0 #9CA3AF; }
input[type="range"] { -webkit-appearance: none; background: transparent; }
input[type="range"]::-webkit-slider-runnable-track { height: 8px; border-radius: 4px; background: #B7D9BC; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #176C33; margin-top: -8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
input[type="range"]::-moz-range-track { height: 8px; border-radius: 4px; background: #B7D9BC; }
input[type="range"]::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: #176C33; border: none; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
</style>
