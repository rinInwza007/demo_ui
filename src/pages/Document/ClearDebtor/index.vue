<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <!-- Header -->
    <div class="bg-white border rounded-2xl  p-8 space-y-6 ml-5 mr-5">
      <h1 class="text-3xl font-bold text-gray-800 ">รายละเอียดหนี้รายบุคคล</h1>

      <!-- Debtor Info -->
      <div class="space-y-2">
        <p class="text-xl text-gray-700">
          <span >ชื่อลูกหนี้:</span>
          {{ debtor.fullName }}
        </p>

        <p class="text-xl text-gray-700">
          <span >ยอดหนี้รวม: </span>
          <span class="text-red-600 font-bold">
            {{ formatMoney(debtor.totalDebt) }} บาท
          </span>
        </p>
      </div>
    </div>

    <!-- Debt Items Table -->
    <div class="bg-white border rounded-2xl shadow-lg p-6 mt-6 ml-5 mr-5">
      <h2 class="text-2xl font-semibold pb-4 border-b">รายการหนี้ที่ยังไม่ชำระ</h2>

      <div class="table-responsive overflow-x-auto mt-6">
        <table class="w-full table-fixed">
          <thead>
            <tr>
              <th class="w-[200px] px-2 py-3 bg-primary-50">รายการ</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50">จำนวนเงิน</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50">วันที่สร้าง</th>
              <th class="w-[150px] px-2 py-3 bg-primary-50">หมายเหตุ</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50 text-center">สถานะ</th>
              <th class="w-[120px] px-2 py-3 bg-primary-50 text-center"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in debtor.items"
              :key="item.id"
              class="border-b border-gray-300"
            >
              <td class="px-2 py-3 text-center">{{ item.title }}</td>
              <td class="px-2 py-3 text-center">{{ formatMoney(item.amount) }}</td>
              <td class="px-2 py-3 text-center">{{ item.createdAt }}</td>
              <td class="px-2 py-3 text-center">{{ item.note }}</td>

              <!-- Status -->
              <td class="px-2 py-3 text-center">
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="{
                    'bg-red-100 text-red-700': item.status === 'pending',
                    'bg-green-100 text-green-700': item.status === 'cleared'
                  }"
                >
                  {{ item.status === 'pending' ? 'ค้างชำระ' : 'ชำระแล้ว' }}
                </span>
              </td>

              <!-- Attion button -->
              <td class="px-2 py-3 text-center">
  <button class="hvr-bob"
  @click="toggleSelect(item)"
  v-tippy="'เพิ่มรายการล้าง/ลบรายการล้าง'"
  >
    <i
      class="material-symbols-outlined "
      :class="item.selected ? 'text-green-600' : 'text-red-600'"
    >
      {{ item.selected ? 'check_circle' : 'cancel' }}
    </i>
  </button>
</td>
            </tr>

            <tr v-if="debtor.items.length === 0">
              <td colspan="6" class="text-center py-6 text-gray-400">
                ไม่มีรายการหนี้ที่ค้างชำระ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Clear All Button -->
      <div class="text-right mt-6">
        <button class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow text-lg">
          ล้างหนี้ทั้งหมด
        </button>
      </div>
    </div>


  </div>
</template>

<script setup>
import { reactive } from 'vue'

import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Swal from "sweetalert2";


const debtor = reactive({
  fullName: "กองแผน",
  totalDebt: 35220,
  items: [
    { id: "1", title: "ค่าธรรมเนียมธนาคาร", amount: 50, selected: false },
    { id: "2", title: "ค่าเอกสาร", amount: 1200, selected: false },
    { id: "3", title: "ค่าวัสดุงานวิจัย", amount: 35000, selected: false },
  ]
})

const toggleSelect = (item) => {
  item.selected = !item.selected;

  if (item.selected) {
    Swal.fire({
      title: "เพิ่มรายการเรียบร้อย!",
      text: `เพิ่มรายการ "${item.title}" สำหรับล้างหนี้`,
      icon: "success",
      confirmButtonText: "ตกลง",
    });
  } else {
    Swal.fire({
      title: "ยกเลิกรายการสำเร็จ",
      text: `นำรายการ "${item.title}" ออกจากการล้างหนี้`,
      icon: "info",
      confirmButtonText: "ปิด",
    });
  }
};

function formatMoney(num) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

</script>
