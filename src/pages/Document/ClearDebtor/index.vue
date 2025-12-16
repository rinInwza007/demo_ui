<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <!-- Header -->
    <div class="bg-white border rounded-2xl p-8 space-y-6 ml-5 mr-5">
      <h1 class="text-3xl font-bold text-gray-800">รายละเอียดหนี้</h1>

      <!-- Debtor Info -->
      <div class="space-y-2">
        <p class="text-xl text-gray-700">
          <span class="font-semibold">หน่วยงาน: </span>
          {{ debtor.fullName }}
        </p>

        <p class="text-xl text-gray-700">
          <span class="font-semibold">ยอดหนี้รวม: </span>
          <span class="text-red-600 font-bold text-2xl">
            {{ formatMoney(debtor.totalDebt) }} บาท
          </span>
        </p>

        <p class="text-lg text-gray-600">
          <span class="font-semibold">จำนวนรายการ: </span>
          {{ debtor.items.length }} รายการ
        </p>
      </div>
    </div>

    <!-- Debt Table -->
    <div class="bg-white border rounded-2xl shadow-lg p-6 mt-6 ml-5 mr-5">
      <h2 class="text-2xl font-semibold pb-4 border-b">รายการหนี้ที่ยังไม่ชำระ</h2>

      <div class="table-responsive overflow-x-auto mt-6">
        <table class="w-full table-fixed">
          <thead>
            <tr>
              <th class="w-[150px] px-2 py-3 bg-primary-50 text-center text-sm">รายการ</th>
              <th class="w-[150px] px-2 py-3 bg-primary-50 text-center text-sm">หน่วยงานย่อย</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50 text-center text-sm">ชื่อผู้ทำรายการ</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50 text-center text-sm">จำนวนเงิน</th>
              <th class="w-[100px] px-2 py-3 bg-primary-50 text-center text-sm">วันที่สร้าง</th>
              <th class="w-[150px] px-2 py-3 bg-primary-50 text-center text-sm">หมายเหตุ</th>
              <th class="w-[100px] px-2 py-3 bg-primary-50 text-center text-sm">สถานะ</th>
              <th class="w-[80px] px-2 py-3 bg-primary-50 text-center text-sm"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in debtor.items"
              :key="item.id"
              class="border-b border-gray-300"
              :class="{ 'bg-green-50': item.selected }"
            >
              <td class="px-2 py-3 text-center text-sm">{{ item.title }}</td>
              <td class="px-2 py-3 text-center text-sm text-gray-600">{{ item.subOrg }}</td>
              <td class="px-2 py-3 text-center text-sm text-gray-600">{{ item.fullName }}</td>
              <td class="px-2 py-3 text-center font-semibold text-red-600">{{ formatMoney(item.amount) }}</td>
              <td class="px-2 py-3 text-center text-sm">{{ item.createdAt }}</td>
              <td class="px-2 py-3 text-center text-sm">{{ item.note }}</td>

              <!-- Status -->
              <td class="px-2 py-3 text-center">
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="{
                    'bg-yellow-100 text-yellow-700': !item.selected,
                    'bg-green-100 text-green-700': item.selected
                  }"
                >
                  {{ item.selected ? 'ชำระแล้ว' : 'ค้างชำระ' }}
                </span>
              </td>

              <td class="px-2 py-3 text-center">
                <button @click="toggleSelect(item)">
                  <i
                    class="material-symbols-outlined"
                    :class="item.selected ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ item.selected ? 'check_circle' : 'cancel' }}
                  </i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Section -->
    <div class="bg-white border rounded-2xl shadow-lg p-6 mt-6 ml-5 mr-5">

      <button
        class="w-full sm:w-32 px-4 py-2 bg-[#7E22CE] text-white rounded-md"
        @click="openModalForRow(0)"
      >
        เพิ่มข้อมูลการชำระเงิน
      </button>

      <Modal
        :show="showModal === 0"
        :items="rowItems[0]"
        :usedAccounts="usedAccounts"
        @close="showModal = null"
        @update:selected="applyPayment"
      />

      <!-- แสดงรายการชำระเงินทั้งหมด -->
      <div v-if="paymentHistory.length > 0" class="bg-white border border-gray-200 rounded-xl p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
          ประวัติการชำระเงิน
        </h3>

        <div class="space-y-4">
          <div
            v-for="payment in paymentHistory"
            :key="payment.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="font-semibold text-gray-700 mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  {{ payment.type }}
                </span>
              </div>
              <span class="text-xs text-gray-500">{{ payment.timestamp }}</span>
            </div>

            <div class="border-t border-gray-200 pt-3 space-y-2">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">เลขที่อ้างอิง:</span>
                <span class="text-gray-700 font-medium">{{ payment.referenceNo }}</span>
              </div>

              <!-- แสดงข้อมูลเพิ่มเติมตามประเภท -->
              <div v-if="payment.AccountName" class="flex justify-between items-center text-sm">
                <span class="text-gray-600">ชื่อบัญชี:</span>
                <span class="text-gray-700">{{ payment.AccountName }}</span>
              </div>

              <div v-if="payment.BankName" class="flex justify-between items-center text-sm">
                <span class="text-gray-600">ธนาคาร:</span>
                <span class="text-gray-700">{{ payment.BankName }}</span>
              </div>

              <div v-if="payment.AccountNum" class="flex justify-between items-center text-sm">
                <span class="text-gray-600">เลขที่บัญชี:</span>
                <span class="text-gray-700">{{ payment.AccountNum }}</span>
              </div>

              <div v-if="payment.NumCheck" class="flex justify-between items-center text-sm">
                <span class="text-gray-600">เลขที่เช็ค:</span>
                <span class="text-gray-700">{{ payment.NumCheck }}</span>
              </div>

              <div class="border-t border-gray-300 my-2"></div>

              <div class="flex justify-between items-center">
                <span class="font-bold text-gray-800">ยอดชำระ:</span>
                <span class="font-bold text-lg text-red-600">
                  - {{ formatNumber(payment.amount) }} ฿
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- สรุปยอดชำระรวม -->
        <div class="mt-4 pt-4 border-t-2 border-gray-300">
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-gray-800">ยอดชำระรวม:</span>
            <span class="text-xl font-bold text-red-600">
              - {{ formatNumber(totalPaid) }} ฿
            </span>
          </div>
        </div>
      </div>

      <!-- กล่องม่วง -->
      <div class="bg-[#7E22CE] border rounded p-6 mb-6 mt-6">
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold text-white">ยอดหนี้คงเหลือ</span>
          <span class="text-3xl font-bold text-white">
            {{ formatNumber(netTotalAmount) }} บาท
          </span>
        </div>
      </div>

      <div class="text-right mt-6">
        <button class="px-6 py-3 bg-green-600 text-white rounded-xl" @click="clearAllDebts">
          ล้างหนี้ทั้งหมด
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import Navbar from "@/components/bar/navbar.vue"
import SecondNavbar from "@/components/bar/secoudnavbar.vue"
import Modal from "@/components/modal/clearmodal.vue"
import { useRowManager2 } from "@/components/Function/FuncClear.js"
import Swal from "sweetalert2"
const { showModal, rowItems, openModalForRow } = useRowManager2()
const route = useRoute()

// ฟังก์ชันโหลดข้อมูลจาก localStorage
const loadReceipts = () => {
  try {
    const raw = localStorage.getItem('fakeApi.receipts')
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data)
      ? data.map(r => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }))
      : []
  } catch {
    return []
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ข้อมูลลูกหนี้
const debtor = reactive({
  fullName: "",
  totalDebt: 0,
  items: []
})

const netTotalAmount = ref(0)
const paymentHistory = ref([])
const usedAccounts = ref([])

// โหลดข้อมูลตอน mounted
onMounted(() => {
  // ดึง affiliationName จาก URL params
  const affiliationName = route.params.id ? decodeURIComponent(route.params.id) : null

  // โหลดข้อมูลจาก localStorage
  const receipts = loadReceipts()

  // กรองเฉพาะ Debtor
  const debtorReceipts = receipts.filter(r => r.moneyTypeNote === 'Debtor')

  // หาหน่วยงานที่ต้องการ
  let targetAffiliation = affiliationName

  // ถ้าไม่มีใน URL ให้ใช้หน่วยงานแรกที่เจอ
  if (!targetAffiliation && debtorReceipts.length > 0) {
    targetAffiliation = debtorReceipts[0].mainAffiliationName
  }

  if (targetAffiliation) {
    // กรองข้อมูลตามหน่วยงาน
    const filteredData = debtorReceipts.filter(
      r => r.mainAffiliationName === targetAffiliation
    )

    // คำนวณยอดหนี้รวม
    const totalDebt = filteredData.reduce((sum, r) => sum + Number(r.netTotalAmount || 0), 0)

    // แปลงข้อมูลเป็น items
    const items = filteredData.map(r => ({
      id: r.projectCode || Math.random().toString(),
      title: r.receiptList?.[0]?.itemName || 'รายการ',
      amount: Number(r.netTotalAmount || 0),
      createdAt: formatDate(r.createdAt),
      note: r.receiptList?.[0]?.note || '-',
      subOrg: r.subAffiliationName || '-',
      fullName: r.fullName || '-',
      selected: false
    }))

    debtor.fullName = targetAffiliation
    debtor.totalDebt = totalDebt
    debtor.items = items
    netTotalAmount.value = totalDebt
  }
})

// คำนวณยอดชำระรวมทั้งหมด
const totalPaid = computed(() => {
  return paymentHistory.value.reduce((sum, payment) => {
    return sum + payment.amount
  }, 0)
})

function applyPayment({ selected, totalFee }) {
  console.log("ค่าที่ส่งกลับจาก Modal:", selected, totalFee)

  if (!totalFee || isNaN(totalFee)) {
    console.warn("totalFee ไม่ใช่ตัวเลข!")
    return
  }

  // หักยอดหนี้
  netTotalAmount.value = Math.max(0, netTotalAmount.value - totalFee)

  // เพิ่มรายการชำระเงินเข้า history (แยกแต่ละ item ที่ checked)
  selected.forEach(item => {
    // เก็บบัญชีที่ถูกใช้ไปแล้ว
    if (item.AccountName && !usedAccounts.value.includes(item.AccountName)) {
      usedAccounts.value.push(item.AccountName)
    }

    paymentHistory.value.push({
      id: Date.now() + Math.random(), // สร้าง unique id
      type: item.type || item.paymentType || 'ไม่ระบุ',
      amount: parseFloat(item.amount) || 0,
      referenceNo: item.referenceNo || '-',
      AccountName: item.AccountName || null,
      AccountNum: item.AccountNum || null,
      BankName: item.BankName || null,
      NumCheck: item.NumCheck || null,
      timestamp: new Date().toLocaleString('th-TH')
    })
  })

  console.log("✅ Payment History:", paymentHistory.value)
  console.log("✅ Used Accounts:", usedAccounts.value)
}

// Toggle select
const toggleSelect = (item) => { item.selected = !item.selected }

// format number
const formatNumber = (num) => Number(num).toLocaleString("th-TH", { minimumFractionDigits: 2 })
const formatMoney = (num) => formatNumber(num)

function clearAllDebts() {
  Swal.fire({
    title: 'ต้องการล้างหนี้ทั้งหมดหรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    cancelButtonText: 'ยกเลิก',
    confirmButtonText: 'ยืนยัน',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      netTotalAmount.value = 0
      paymentHistory.value = []
      usedAccounts.value = []

      Swal.fire({
        title: 'ล้างหนี้สำเร็จ',
        text: 'ข้อมูลทั้งหมดถูกล้างเรียบร้อย',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
    }
  })
}
</script>

<style>
.ts-wrapper { width: 100% !important; margin-top: .5rem; }
.ts-control { height: 42px; border-radius: 8px; padding: 6px 0; border-color: #d1d5db; }
</style>
