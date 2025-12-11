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
          <span>ชื่อลูกหนี้:</span>
          {{ debtor.fullName }}
        </p>

        <p class="text-xl text-gray-700">
          <span>ยอดหนี้รวม: </span>
          <span class="text-red-600 font-bold">
            {{ formatMoney(debtor.totalDebt) }} บาท
          </span>
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
              <th class="w-[200px] px-2 py-3 bg-primary-50 text-center">รายการ</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50 text-center">จำนวนเงิน</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50 text-center">วันที่สร้าง</th>
              <th class="w-[150px] px-2 py-3 bg-primary-50 text-center">หมายเหตุ</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50 text-center">สถานะ</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50 text-center"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in debtor.items"
              :key="item.id"
              class="border-b border-gray-300"
              :class="{ 'bg-green-50': item.selected }"
            >
              <td class="px-2 py-3 text-center">{{ item.title }}</td>
              <td class="px-2 py-3 text-center font-semibold">{{ formatMoney(item.amount) }}</td>
              <td class="px-2 py-3 text-center">{{ item.createdAt }}</td>
              <td class="px-2 py-3 text-center">{{ item.note }}</td>

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
  @close="showModal = null"
  @update:selected="applyPayment"
/>



      <!-- รายการที่เลือก -->
      <div class="mt-6" v-if="selectedDebtItems.length > 0">
        <div class="bg-white border rounded-xl p-6">
          <h3 class="text-lg font-semibold mb-4">รายละเอียดการชำระเงิน</h3>

          <div v-for="item in selectedDebtItems" :key="item.id" class="border p-4 rounded-lg">
            <div class="flex justify-between">
              <span class="font-medium">{{ item.title }}</span>
              <span class="font-bold">{{ formatNumber(item.amount) }} ฿</span>
            </div>
          </div>
        </div>
      </div>

      <!-- กล่องม่วง -->
      <div class="bg-[#7E22CE] border rounded p-6 mb-6 mt-6">
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold text-white">ยอดหนี้ที่ต้องชำระ</span>
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
import { reactive, computed, ref } from "vue"
import Navbar from "@/components/bar/navbar.vue"
import SecondNavbar from "@/components/bar/secoudnavbar.vue"
import Modal from "@/components/modal/modalclear.vue"
import { useRowManager2 } from "@/components/Function/FuncClear.js"

const { showModal, rowItems, openModalForRow } = useRowManager2()

// ข้อมูลลูกหนี้
const debtor = reactive({
  fullName: "สมชาย ใจดี",
  totalDebt: 36250,
  items: [
    { id: "1", title: "ค่าธรรมเนียมธนาคาร", amount: 50, selected: false, createdAt: "2024-01-01", note: "-" },
    { id: "2", title: "ค่าเอกสาร", amount: 1200, selected: false, createdAt: "2024-01-02", note: "-" },
    { id: "3", title: "ค่าวัสดุงานวิจัย", amount: 35000, selected: false, createdAt: "2024-01-03", note: "-" }
  ]
})


const netTotalAmount = ref(debtor.totalDebt)


function applyPayment({ selected, totalFee }) {
  console.log("ค่าที่ส่งกลับจาก Modal:", selected, totalFee)

  if (!totalFee || isNaN(totalFee)) {
    console.warn("totalFee ไม่ใช่ตัวเลข!")
    return
  }

  netTotalAmount.value = Math.max(0, netTotalAmount.value - totalFee)
}


// รายการที่เลือก
const selectedDebtItems = computed(() => debtor.items.filter(item => item.selected))

// Toggle select
const toggleSelect = (item) => { item.selected = !item.selected }

// format number
const formatNumber = (num) => Number(num).toLocaleString("th-TH", { minimumFractionDigits: 2 })
const formatMoney = (num) => formatNumber(num)
</script>


<style>
.ts-wrapper { width: 100% !important; margin-top: .5rem; }
.ts-control { height: 42px; border-radius: 8px; padding: 6px 0; border-color: #d1d5db; }
</style>
