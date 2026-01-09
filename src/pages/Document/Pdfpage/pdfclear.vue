<template>
  <div>
    <Navbar />
    <SecondNavbar class="bg-gray-100" />

    <div v-if="loading" class="flex justify-center items-center h-96">
      <div class="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
    </div>

    <div v-else-if="!receiptData" class="flex justify-center items-center h-96">
      <div class="text-lg text-red-600">ไม่พบข้อมูล</div>
    </div>

    <div v-else class="flex justify-center items-center -mt-10">
      <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        type="application/pdf"
        class="w-[1000px] h-[1000px] border border-gray-300 shadow-md"
      ></iframe>
    </div>

    <div class="mt-6 flex justify-end gap-3 mb-4 px-8">
      <button @click="gotomainpage" class="px-6 py-2 rounded-md bg-gray-600 text-white btn-back">
        กลับ
      </button>
    </div>
  </div>
</template>

<!-- ✅ เพิ่ม lang="ts" -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import pdfMake from 'pdfmake/build/pdfmake'
import { vfs, fonts } from '../../../assets/fonts.js'
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'

const route = useRoute()
const router = useRouter()

const gotomainpage = () => {
  router.back()
}

pdfMake.vfs = vfs
pdfMake.fonts = fonts

// ✅ ลบฟังก์ชัน viewPdf ออกเพราะไม่ได้ใช้ในไฟล์นี้
// const viewPdf = (id: string) => {
//   router.push(`/pdfclear/${id}`)
// }

const pdfUrl = ref<string | null>(null)
const receiptData = ref<any>(null)
const loading = ref(true)
const rows = reactive<any[]>([])

const summary = reactive({
  text: 'ศูนย์บาทถ้วน',
  total: '-',
  note: '0',
})

const currentDate = new Date().toLocaleDateString('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function convertNumberToThaiText(number: number) {
  if (!number || number === 0) return 'ศูนย์บาทถ้วน'
  const bahtText = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const unitText = ['', 'สิบ', 'รอย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']
  let result = ''
  const numberStr = Math.floor(number).toString()
  const len = numberStr.length
  for (let i = 0; i < len; i++) {
    const digit = parseInt(numberStr[i])
    const position = len - i - 1
    if (digit !== 0) {
      if (position === 1 && digit === 1) { result += 'สิบ' }
      else if (position === 1 && digit === 2) { result += 'ยี่สิบ' }
      else if (position === 0 && digit === 1 && len > 1) { result += 'เอ็ด' }
      else { result += bahtText[digit] + unitText[position] }
    }
  }
  result += 'บาทถ้วน'
  return result
}

function createDocDefinition() {
  const receipt = receiptData.value || {}

  return {
    pageSize: 'A4',
    pageMargins: [20, 30, 20, 20],
    defaultStyle: { font: 'THSarabun', fontSize: 13 },
    content: [
      {
        stack: [
          {
            text: 'เลขที่นำส่ง ..................../..................',
            absolutePosition: { x: 0, y: 15 },
            alignment: 'right',
          },
        ],
      },
      {
        text: 'มหาวิทยาลัยพะเยา \n ใบนำส่งเงินลูกหนี้\n',
        style: 'header',
        alignment: 'center',
        margin: [0, -20, 0, 0],
        bold: true,
        fontSize: 15,
      },
      { text: '\n\n' },
      {
        stack: [
          { text: `${currentDate}`, absolutePosition: { x: 440, y: 65 }, fontSize: 13 },
          {
            text: 'วันที่............................................................................\n',
            absolutePosition: { x: 400, y: 66.5 },
          },
        ],
      },
      {
        stack: [
          { text: `${receipt.fullName || ''}`, absolutePosition: { x: 95, y: 81.5 }, fontSize: 13 },
          { text: `${receipt.phone || ''}`, absolutePosition: { x: 270, y: 81.5 }, fontSize: 13 },
          { text: `${receipt.mainAffiliationName || ''}`, absolutePosition: { x: 370, y: 81.5 }, fontSize: 13 },
          { text: 'ข้าพเจ้า........................................................เบอร์โทรติดต่อ.............................................สังกัด....................................................................................................\n', margin: [35, 0, 0, 0] }
        ],
      },
      {
        stack: [
          { text: `${receipt.sendmoney || ''}`, absolutePosition: { x: 110, y: 98.5 }, fontSize: 13 },
          { text: `${receipt.fundName || ''}`, absolutePosition: { x: 460, y: 98.5 }, fontSize: 13 },
          { text: 'ใบนำส่งรายได้/เงินโครงการ.........................................................................................................................................................กองทุน..........................................................\n', margin: [-10, 0, 0, 0] },
        ],
      },
      {
        stack: [
          { text: `${receipt.projectCode || receipt.referenceId || ''}`, absolutePosition: { x: 265, y: 115 }, fontSize: 13 },
          { text: 'รหัสโครงการ(กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ)............................................................. ', margin: [-10, 0, 0, 0] },
        ],
      },

      // ตาราง
      {
        table: {
          widths: ['8%', '15%', '*', '12%', '20%'],
          body: [
            [
              { text: '\n ลำดับที่', alignment: 'center', bold: true, margin: [0, 10, 0, 0] },
              { text: 'เลขที่\nเอกสารอ้างอิง\n(เล่มที่/เลขที่\nใบเสร็จรับเงิน)', alignment: 'center', bold: true },
              { text: '\nรายการ', alignment: 'center', bold: true, margin: [0, 10, 0, 0] },
              { text: '\nจำนวน/บาท', alignment: 'center', bold: true, margin: [0, 10, 0, 0] },
              { text: '\nหมายเหตุ', alignment: 'center', bold: true, margin: [0, 10, 0, 0] },
            ],
            ...rows.map((r, index) => [
              { text: r.isFee ? '' : (index + 1), alignment: 'center' },
              { text: r.ref || ' ', alignment: 'center' },
              { text: r.item || ' ', alignment: 'left' },
              { text: r.amount || ' ', alignment: 'right' },
              { text: r.note || ' ', alignment: 'center' },
            ]),
            [
              { text: summary.text, colSpan: 3, alignment: 'center', bold: true },
              '', '',
              { text: summary.total || '', alignment: 'right', bold: true },
              { text: '', alignment: 'center', bold: true },
            ],
          ],
        },
        margin: [-10, 0, -10, 0],
      },

      { text: '\n' },

      // รายการชำระเงิน
      ...(receipt.payments && receipt.payments.length > 0 ?
        receipt.payments.flatMap((payment: any) => {
          const result: any[] = []

          if (payment.type === 'transfer') {
            result.push({
              columns: [
                {
                  text: 'นำฝากเข้าบัญชีธนาคาร',
                  style: 'form',
                  width: 'auto',
                  margin: [33, 3, 0, 0],
                  noWrap: true
                },
                {
                  stack: [
                    { text: `${payment.bankName || ''}`, alignment: 'center', lineHeight: 1.2 },
                    { text: '.............................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
                  ],
                  width: 120,
                  margin: [-60, 3, 0, 0]
                },
                {
                  text: 'เลขที่บัญชี',
                  style: 'form',
                  width: 'auto',
                  margin: [-60, 3, 0, 0]
                },
                {
                  stack: [
                    { text: `${payment.accountNumber || ''}`, alignment: 'center', lineHeight: 1.2 },
                    { text: '.............................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
                  ],
                  width: 100,
                  margin: [-40, 3, 0, 0]
                }
              ],
              columnGap: 3,
              margin: [50, 3, 0, 0]
            })

            result.push({
              columns: [
                { text: '', width: 20, margin: [52.5, 0, 0, 0] },
                { text: 'ชื่อบัญชี', style: 'form', width: 'auto', margin: [13, 3, 0, 0] },
                {
                  stack: [
                    { text: `${payment.accountName || payment.bankName || ''}`, alignment: 'center', lineHeight: 1.2 },
                    { text: '.........................................................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
                  ],
                  width: 200,
                  margin: [-75, 3, 0, 0]
                },
                { text: 'จำนวนเงิน', style: 'form', width: 'auto', margin: [34.5, 3, 0, 0] },
                {
                  stack: [
                    { text: `${payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, alignment: 'center', lineHeight: 1.2 },
                    { text: '.............................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
                  ],
                  width: 80,
                  margin: [-18, 3, 0, 0]
                },
                { text: 'บาท', style: 'form', width: 'auto', margin: [-20, 3, 0, 0] }
              ],
              margin: [50, 3, 0, 0]
            })
          } else if (payment.type === 'cash') {
            result.push({
              columns: [
                { text: 'เงินสด', style: 'form', width: 'auto', margin: [33, 3, 0, 0] },
                { text: 'จำนวนเงิน', style: 'form', width: 'auto', margin: [0, 3, 0, 0] },
                {
                  stack: [
                    { text: `${payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, alignment: 'center', lineHeight: 1.2 },
                    { text: '.............................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
                  ],
                  width: 80,
                  margin: [-15, 3, 7, 0]
                },
                { text: 'บาท', style: 'form', width: 'auto', margin: [-20, 3, 0, 0] }
              ],
              margin: [50, 3, 95, 0]
            })
          } else if (payment.type === 'check') {
            result.push({
              columns: [
                { text: 'เช็คธนาคาร', style: 'form', width: 'auto', margin: [33, 3, 0, 0] },
                {
                  stack: [
                    { text: `${payment.bankName || ''}`, alignment: 'center', lineHeight: 1.2 },
                    { text: '.............................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
                  ],
                  width: 120,
                  margin: [-60, 3, 0, 0]
                },
                {
                  text: 'เลขที่เช็ค',
                  style: 'form',
                  width: 'auto',
                  margin: [-60, 3, 0, 0]
                },
                {
                  stack: [
                    { text: `${payment.checkNumber || ''}`, alignment: 'center', lineHeight: 1.2 },
                    { text: '.............................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
                  ],
                  width: 100,
                  margin: [-40, 3, 0, 0]
                }
              ],
              columnGap: 3,
              margin: [50, 3, 0, 0]
            })

            result.push({
              columns: [
                { text: '', width: 20, margin: [52.5, 0, 0, 0] },
                { text: 'จำนวนเงิน', style: 'form', width: 'auto', margin: [13, 3, 0, 0] },
                {
                  stack: [
                    { text: `${payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, alignment: 'center', lineHeight: 1.2 },
                    { text: '.............................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
                  ],
                  width: 80,
                  margin: [-18, 3, 0, 0]
                },
                { text: 'บาท', style: 'form', width: 'auto', margin: [-20, 3, 0, 0] }
              ],
              margin: [50, 3, 0, 0]
            })
          }

          return result
        })
      : []),

      { text: '\n\n' },

      // ลายเซ็น
      {
        columns: [
          {
            stack: [
              {
                style: 'form',
                text: 'ลงชื่อ',
                margin: [20, 0, 0, 0],
                alignment: 'left',
              },
              {
                text: receipt.fullName || '',
                alignment: 'center',
                margin: [0, 0, 0, -15],
                fontSize: 13,
              },
              {
                style: 'form',
                text: '(........................................................................)',
                alignment: 'center',
              },
              {
                style: 'form',
                text: 'ผู้นำส่งเงิน',
                alignment: 'center',
                margin: [10, 0, 0, 0]
              },
              {
                text: receipt.date || currentDate,
                alignment: 'center',
                margin: [0, 0, 0, -15],
                fontSize: 13,
              },
              {
                style: 'form',
                text: 'ลงวันที่.......................................................',
                alignment: 'center',
              },
            ],
          },
          {
            stack: [
              {
                style: 'form',
                text: 'ลงชื่อ',
                margin: [0, 0, 225, 0],
                alignment: 'center',
              },
              {
                style: 'form',
                text: '(........................................................................)',
                alignment: 'center',
                margin: [0, 1, 0, 0],
              },
              {
                style: 'form',
                text: 'ผู้รับเงิน',
                alignment: 'center',
              },
              {
                style: 'form',
                text: 'ลงวันที่.......................................................',
                alignment: 'center',
                margin: [0, 3, 0, 0],
              },
            ],
          },
        ],
        widths: ['50%', '50%']
      },
    ],
    styles: {
      form: { bold: true },
    },
  }
}

function previewPdf() {
  const docDefinition = createDocDefinition()
  pdfMake.createPdf(docDefinition).getBlob((blob) => {
    pdfUrl.value = URL.createObjectURL(blob)
  })
}

onMounted(() => {
  try {
    loading.value = true
    const referenceId = route.params.id as string

    const historyData = localStorage.getItem('debtorClearHistory')
    if (!historyData) {
      console.error('❌ No history data found')
      loading.value = false
      return
    }

    const history = JSON.parse(historyData)
    const foundHistory = history.find((h: any) => h.referenceId === referenceId)

    if (!foundHistory) {
      console.error('❌ History item not found:', referenceId)
      loading.value = false
      return
    }

    console.log('✅ Found history item:', foundHistory)

    receiptData.value = {
      referenceId: foundHistory.referenceId,
      fullName: foundHistory.fullName || 'ไม่ระบุ',
      phone: foundHistory.phone || '-',
      mainAffiliationName: foundHistory.department || 'ไม่ระบุ',
      sendmoney: foundHistory.sendmoney || '-',
      fundName: foundHistory.fundName || '-',
      projectCode: foundHistory.receiptId || referenceId,
      date: foundHistory.date,
      payments: foundHistory.payments || []
    }

    const MIN_ROWS = 8
    rows.splice(0, rows.length)

    if (foundHistory.items && Array.isArray(foundHistory.items)) {
      foundHistory.items.forEach((item: any) => {
        rows.push({
          item: item.itemName || '',
          amount: item.amount?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00',
          ref: item.referenceId || '',
          note: item.note || '',
        })
      })
    }

    while (rows.length < MIN_ROWS) {
      rows.push({ item: ' ', amount: ' ', ref: ' ', note: ' ' })
    }

    const total = foundHistory.total || 0
    summary.text = convertNumberToThaiText(total)
    summary.total = total.toLocaleString('th-TH', { minimumFractionDigits: 2 })

    previewPdf()
    loading.value = false
  } catch (error) {
    console.error('❌ PDF Error:', error)
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.btn-back {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.btn-back:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background-color: #b91c1c;
}
</style>
