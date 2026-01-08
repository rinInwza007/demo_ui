<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center h-96">
      <div class="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
    </div>

    <div v-else-if="!dailyData" class="flex justify-center items-center h-96">
      <div class="text-lg text-red-600">ไม่พบข้อมูล</div>
    </div>

    <div v-else class="flex justify-center items-center pt-10">
      <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        type="application/pdf"
        class="w-[1000px] h-[1000px] border border-gray-300 shadow-md "
      ></iframe>
    </div>

    <div class="mt-6 flex justify-end gap-3 mb-4">
      <button @click="gotomainpage" class="px-6 py-2 rounded-md bg-gray-600 text-white btn-back">
        กลับ
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import pdfMake from 'pdfmake/build/pdfmake'
import { vfs, fonts } from '../../../assets/fonts.js'
import { loadReceipts } from '@/fake/mockDb.js'

const route = useRoute()
const router = useRouter()

const gotomainpage = () => {
  router.push('/daily_closing')
}

pdfMake.vfs = vfs
pdfMake.fonts = fonts

const pdfUrl = ref(null)
const dailyData = ref(null)
const loading = ref(true)

const formatCurrency = (num) => {
  return Number(num || 0).toLocaleString('th-TH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

const formatThaiDate = (dateKey) => {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function createDocDefinition() {
  const data = dailyData.value

  // สร้าง header ของตาราง
  const tableHeaders = [
    // ===== แถวที่ 1 =====
    [
      { text:'\n'+'เลขที่ใบเสร็จรับเงิน', rowSpan: 3, alignment: 'center', style: 'tableHeader' , margin:[0,10,0,0] },
      { text: '\n'+'รายการ', rowSpan: 3, alignment: 'center', style: 'tableHeader', margin:[0,10,0,0] },
      { text: 'รับชำระโดย', colSpan: 5, alignment: 'center', style: 'tableHeader' },
      {}, {}, {}, {},
    ],

    // ===== แถวที่ 2 =====
    [
      {},
      {},
      { text: 'ลูกหนี้', colSpan: 2, alignment: 'center', style: 'tableHeader' },
      {},
      { text: 'เงินสด', rowSpan: 2, alignment: 'center', style: 'tableHeader' },
      { text: 'เงินโอน', alignment: 'center', style: 'tableHeader' },
      { text: 'รวม', rowSpan: 2, alignment: 'center', style: 'tableHeader' },
    ],

    // ===== แถวที่ 3 =====
    [
      {},
      {},
      { text: 'เพิ่ม', alignment: 'center', style: 'tableHeader' },
      { text: 'ลด', alignment: 'center', style: 'tableHeader' },
      {},
      { text: 'ระหว่างธนาคาร', alignment: 'center', style: 'tableHeader' },
      {},
    ]
  ]

  // สร้างแถวข้อมูล
  const tableRows = data.items.map(item => [
    { text: item.delNumber || item.projectCode || '', alignment: 'center', fontSize: 12 },
    { text: item.description || item.fullName || '', alignment: 'left', fontSize: 12 },
    
    // ✅ ใช้ค่าที่ถูกต้อง
    { text: formatCurrency(item.debtorIncrease), alignment: 'right', fontSize: 12 },
    { text: formatCurrency(item.debtorDecrease), alignment: 'right', fontSize: 12 },
    { text: formatCurrency(item.cash), alignment: 'right', fontSize: 12 },
    { text: formatCurrency(item.transfer), alignment: 'right', fontSize: 12 },
    { text: formatCurrency(item.total), alignment: 'right', fontSize: 12, bold: true },
  ])

  const totalRow = [
    { text: 'รวมทั้งสิ้น', colSpan: 2, alignment: 'center', bold: true, fontSize: 12 },
    {},
    { text: formatCurrency(data.totals.debtorIncrease), alignment: 'right', bold: true, fontSize: 12 },
    { text: formatCurrency(data.totals.debtorDecrease), alignment: 'right', bold: true, fontSize: 12 },
    { text: formatCurrency(data.totals.cash), alignment: 'right', bold: true, fontSize: 12 },
    { text: formatCurrency(data.totals.transfer), alignment: 'right', bold: true, fontSize: 12 },
    { text: formatCurrency(data.totals.grandTotal), alignment: 'right', bold: true, fontSize: 13 },
  ]

  return {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [30, 60, 30, 80],
    defaultStyle: { font: 'THSarabun', fontSize: 13 },
    
    header: (currentPage, pageCount) => ({
      columns: [
        { 
          text: 'มหาวิทยาลัยพะเยา\nรายงานการรับเงิน', 
          alignment: 'center',
          fontSize: 16,
          bold: true,
          margin: [0, 15, 0, 0]
        }
      ]
    }),

    content: [
      {
        text: `วันที่ ${formatThaiDate(data.dateKey)}`,
        alignment: 'right',
        fontSize: 14,
        bold: true,
        margin: [0, 0, 80, 0]
      },

      {
        margin: [70, 0, 0, 0],
        table: {
          headerRows: 3,
          widths: [
            '12%', // เลขที่ใบเสร็จ
            '28%', // รายการ
            '8%',  // ลูกหนี้ เพิ่ม
            '8%',  // ลูกหนี้ ลด
            '10%', // เงินสด
            '14%', // เงินโอน
            '15%'  // รวม
          ],
          body: [
            ...tableHeaders,
            ...tableRows,
            totalRow
          ]
        },
        layout: {
          hLineWidth: (i, node) => 0.5,
          vLineWidth: (i, node) => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      },

      // ขึ้นหน้าใหม่สำหรับตารางที่ 2
      {
        text: '',
        pageBreak: 'after'
      },
      
      {
        text: `วันที่ ${formatThaiDate(data.dateKey)}`,
        alignment: 'right',
        fontSize: 14,
        bold: true,
        margin: [0, 0, 80, 10]
      },

      // ตารางสรุปยอดเงินด้านล่าง (ตารางว่าง)
      {
        margin: [70, 0, 35, 0],
        table: {
          widths: ['*', '25%'],
          body: [
            [
              { text: 'รายการรับชำระ', bold: true, alignment: 'center', fillColor: '#f0f0f0' },
              { text: 'จำนวนเงิน', bold: true, alignment: 'center', fillColor: '#f0f0f0' }
            ],
            [
              { text: 'ยอดเงินสดรายวันรับส่ง', alignment: 'left' },
              { text: '', alignment: 'right' }
            ],
            [
              { text: 'ยอดเงินรายวันเงินโอน', alignment: 'left' },
              { text: '', alignment: 'right' }
            ],
            [
              { text: 'รวม', alignment: 'left', bold: true },
              { text: '', alignment: 'right', bold: true }
            ],
            [
              { text: 'เงินฝาก/โอนไว้ยังธนาคารแล้ว', alignment: 'left' },
              { text: '', alignment: 'right' }
            ],
            [
              { text: 'เช็ค', alignment: 'left' },
              { text: '', alignment: 'right' }
            ]
          ]
        },
        layout: {
          hLineWidth: (i, node) => 0.5,
          vLineWidth: (i, node) => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      },

      // ลายเซ็นต่อท้ายตารางที่ 2
      {
        text: '\n\n',
        margin: [0, 20, 0, 0]
      },
      {
        columns: [
          {
            stack: [
              { text: 'ลงชื่อ.................................................ผู้จัดทำ', alignment: 'center' },
              { text: '       (................................................)', alignment: 'center' },
              { text: 'วันที่.......................................................', alignment: 'center' }
            ],
            width: '33%',
            margin: [40, 0, 0, 0]
          },
          {
            stack: [
              { text: 'ลงชื่อ.................................................ผู้ตรวจสอบ', alignment: 'center' },
              { text: '       (................................................)', alignment: 'center' },
              { text: 'วันที่.......................................................', alignment: 'center' }
            ],
            width: '33%'
          },
          {
            stack: [
              { text: 'ลงชื่อ.................................................ผู้อนุมัติ', alignment: 'center' },
              { text: '       (................................................)', alignment: 'center' },
              { text: 'วันที่.......................................................', alignment: 'center' }
            ],
            width: '33%',
            margin: [0, 0, 40, 0]
          }
        ]
      }
    ],

    footer: (currentPage, pageCount) => {
      // ไม่แสดง footer เลย (ย้ายไปแสดงในเนื้อหาแล้ว)
      return {}
    },

    styles: {
      tableHeader: {
        bold: true,
        fontSize: 13,
        fillColor: '#f0f0f0'
      }
    }
  }
}

function previewPdf() {
  const docDefinition = createDocDefinition()
  pdfMake.createPdf(docDefinition).getBlob((blob) => {
    pdfUrl.value = URL.createObjectURL(blob)
  })
}

// แปลง receipt เป็นรูปแบบที่ต้องการ (แสดงรายการย่อย)
function processReceiptData(receipts, dateKey) {
  const items = []
  let totalCash = 0
  let totalCheck = 0
  let totalTransfer = 0
  let totalDeposit = 0
  let grandTotal = 0

  receipts.forEach(receipt => {
    const pm = receipt.paymentMethods || {}
    
    const parseAmount = (amount) => {
      if (!amount) return 0
      const str = String(amount).replace(/,/g, '')
      const num = parseFloat(str)
      return isNaN(num) ? 0 : num
    }
    
    // ✅ คำนวณเงินแต่ละประเภทรวมทั้งใบนำส่ง
    const receiptCash = pm.cash?.checked ? parseAmount(pm.cash.amount) : 0
    const receiptCheck = pm.check?.checked ? parseAmount(pm.check.amount) : 0
    
    // ✅ รวมเงินโอนจากทุกบัญชี
    const receiptTransfer = (
      (pm.krungthai1?.checked ? parseAmount(pm.krungthai1.amount) : 0) +
      (pm.krungthai2?.checked ? parseAmount(pm.krungthai2.amount) : 0) +
      (pm.krungthai3?.checked ? parseAmount(pm.krungthai3.amount) : 0)
    )
    
    const receiptDeposit = pm.other?.checked ? parseAmount(pm.other.amount) : 0
    const receiptGrandTotal = receiptCash + receiptCheck + receiptTransfer + receiptDeposit

    console.log('💰 Receipt payment breakdown:', {
      delNumber: receipt.delNumber,
      cash: receiptCash,
      check: receiptCheck,
      transfer: receiptTransfer,
      deposit: receiptDeposit,
      total: receiptGrandTotal
    })

    // ✅ วนลูปแสดงรายการย่อยแต่ละรายการ
if (receipt.receiptList && receipt.receiptList.length > 0) {
  receipt.receiptList.forEach((item) => {
    const itemAmount = parseAmount(item.amount || item.subtotal || 0)
    
    // ✅ ตรวจสอบว่าเป็นหนี้เพิ่มหรือไม่
    const isDebtorIncrease = (item.note || '').includes('ลูกหนี้')
    const isDebtorDecrease = false
    
    // ✅ กำหนดค่าตามประเภทการชำระเงินของแต่ละรายการ
    let itemCash = 0
    let itemCheck = 0
    let itemTransfer = 0
    let itemDeposit = 0
    
    if (isDebtorIncrease) {
      // ถ้าเป็นหนี้เพิ่ม ไม่ต้องแสดงเงินสดหรือโอน
      itemCash = 0
      itemCheck = 0
      itemTransfer = 0
      itemDeposit = 0
    } else {
      // ✅ แบ่งเงินตามสัดส่วนของใบเสร็จ โดยดูจากประเภทที่เลือกไว้
      const ratio = receiptGrandTotal > 0 ? itemAmount / receiptGrandTotal : 0
      itemCash = receiptCash * ratio
      itemCheck = receiptCheck * ratio
      itemTransfer = receiptTransfer * ratio
      itemDeposit = receiptDeposit * ratio
    }
    
    items.push({
      delNumber: receipt.delNumber,
      projectCode: receipt.projectCode,
      description: item.itemName || '-',
      referenceNo: item.referenceNo || '-',
      fullName: receipt.fullName,
      
      debtorIncrease: isDebtorIncrease ? itemAmount : 0,
      debtorDecrease: isDebtorDecrease ? itemAmount : 0,
      
      cash: itemCash,
      check: itemCheck,
      transfer: itemTransfer,
      deposit: itemDeposit,
      total: itemAmount
    })

    console.log('📝 Item added:', {
      item: item.itemName,
      cash: itemCash,
      transfer: itemTransfer,
      debtor: isDebtorIncrease ? itemAmount : 0,
      total: itemAmount
    })
  })
}
     else {
      items.push({
        delNumber: receipt.delNumber,
        projectCode: receipt.projectCode,
        description: `${receipt.sendmoney || ''} - ${receipt.fullName || ''}`,
        referenceNo: '-',
        fullName: receipt.fullName,
        debtorIncrease: 0,
        debtorDecrease: 0,
        cash: receiptCash,
        check: receiptCheck,
        transfer: receiptTransfer,
        deposit: receiptDeposit,
        total: receiptGrandTotal
      })
    }
  })

  // ✅ คำนวณยอดรวมทั้งหมด
  items.forEach(item => {
    totalCash += item.cash
    totalCheck += item.check
    totalTransfer += item.transfer
    totalDeposit += item.deposit
    grandTotal += item.total
  })

  console.log('📊 Total summary:', {
    cash: totalCash,
    check: totalCheck,
    transfer: totalTransfer,
    deposit: totalDeposit,
    grandTotal
  })

  return {
    dateKey,
    items,
    totals: {
      debtorIncrease: items.reduce((sum, i) => sum + i.debtorIncrease, 0),
      debtorDecrease: items.reduce((sum, i) => sum + i.debtorDecrease, 0),
      cash: totalCash,
      check: totalCheck,
      transfer: totalTransfer,
      deposit: totalDeposit,
      grandTotal
    }
  }
}

onMounted(async () => {
  try {
    loading.value = true

    // ดึง dateKey จาก URL params (แก้ไขให้ดึงถูกต้อง)
    const dateKey = route.params.dateKey || route.query.dateKey
    console.log('🔍 Loading daily report for:', dateKey)
    console.log('Route params:', route.params)
    console.log('Route query:', route.query)

    if (!dateKey) {
      console.error('❌ dateKey is required')
      loading.value = false
      return
    }

    // โหลดข้อมูลทั้งหมด
    const receipts = loadReceipts()
    console.log('📦 Total receipts:', receipts.length)

    // กรองข้อมูลตามวันที่ (แก้ไขการเปรียบเทียบวันที่)
    const filteredReceipts = receipts.filter(r => {
      if (!r.createdAt) return false
      
      const receiptDate = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)
      const year = receiptDate.getFullYear()
      const month = String(receiptDate.getMonth() + 1).padStart(2, '0')
      const day = String(receiptDate.getDate()).padStart(2, '0')
      const receiptDateKey = `${year}-${month}-${day}`
      
      console.log('Comparing:', receiptDateKey, '===', dateKey)
      return receiptDateKey === dateKey
    })

    console.log('✅ Found receipts for date:', filteredReceipts.length)

    if (filteredReceipts.length === 0) {
      console.warn('⚠️ No receipts found for this date')
      // สร้างข้อมูลเปล่าเพื่อแสดง
      dailyData.value = {
        dateKey,
        items: [],
        totals: {
          cash: 0,
          check: 0,
          transfer: 0,
          deposit: 0,
          grandTotal: 0
        }
      }
    } else {
      dailyData.value = processReceiptData(filteredReceipts, dateKey)
    }

    previewPdf()
    loading.value = false
  } catch (error) {
    console.error('❌ Error loading daily report:', error)
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.btn-back {
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.btn-back:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background-color: #b91c1c;
}
</style>