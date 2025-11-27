<template>
  <div>
    <h1>รายการใบเสร็จทั้งหมด</h1>
    
    <!-- Search -->
    <input v-model="searchQuery" placeholder="ค้นหา..." @input="searchReceipts" />
    
    <!-- List -->
    <div v-for="receipt in receipts" :key="receipt.projectCode">
      <h3>{{ receipt.fullName }}</h3>
      <p>รหัสโครงการ: {{ receipt.projectCode }}</p>
      <button @click="viewDetail(receipt.projectCode)">ดูรายละเอียด</button>
      <button @click="deleteReceipt(receipt.projectCode)">ลบ</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { GetReceipts, DeleteReceipt } from '@/services/ReciptService'

const receipts = ref([])
const searchQuery = ref('')

const loadReceipts = async () => {
  try {
    const data = await GetReceipts()
    receipts.value = data
    console.log('📋 ข้อมูลทั้งหมด:', data)
  } catch (error) {
    console.error('Error loading receipts:', error)
  }
}

const searchReceipts = async () => {
  try {
    const data = await GetReceipts({ q: searchQuery.value })
    receipts.value = data
  } catch (error) {
    console.error('Error searching:', error)
  }
}

const deleteReceipt = async (projectCode) => {
  if (!confirm('ต้องการลบใช่หรือไม่?')) return
  
  try {
    await DeleteReceipt(projectCode)
    alert('ลบสำเร็จ!')
    loadReceipts() // โหลดใหม่
  } catch (error) {
    alert('เกิดข้อผิดพลาด')
  }
}

const viewDetail = (projectCode) => {
  router.push(`/receipt/${projectCode}`)
}

onMounted(() => {
  loadReceipts()
})
</script>