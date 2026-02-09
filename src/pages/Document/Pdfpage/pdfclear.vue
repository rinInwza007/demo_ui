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

// ✅ ฟังก์ชันตรวจสอบว่าเป็นลูกหนี้หรือไม่
function isReceivableItem(itemName: string): boolean {
  if (!itemName) return false
  const receivableKeywords = ['ลูกหนี้', 'receivable', 'debtor']
  const lowerItemName = itemName.toLowerCase()
  return receivableKeywords.some(keyword => lowerItemName.includes(keyword))
}

// ✅ ฟังก์ชันสร้างเครื่องหมายถูก
const createCheckbox = () => ({
  canvas: [
    {
      type: 'rect',
      x: 0,
      y: 2,
      w: 8,
      h: 8,
      stroke: 'black',
      fill: null,
    },
    {
      type: 'line',
      x1: 2,
      y1: 6,
      x2: 4,
      y2: 8,
      stroke: 'black',
      strokeWidth: 1,
    },
    {
      type: 'line',
      x1: 4,
      y1: 8,
      x2: 7,
      y2: 3,
      stroke: 'black',
      strokeWidth: 1,
    },
  ],
  width: 10,
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

  console.log('🎨 Creating PDF with:')
  console.log('  Receipt data:', receipt)
  console.log('  Rows count:', rows.length)

  return {
    pageSize: 'A4',
    pageMargins: [20, 30, 20, 20],
    defaultStyle: { font: 'THSarabun', fontSize: 13 },
    content: [
  {
  stack: [
    {
      text: receipt.waybillNumber || receipt.referenceId || '',
      absolutePosition: { x: 445, y: 15 }, // ตำแหน่งที่แสดง
      alignment: 'center',
      fontSize: 13,
      bold: true,
    },
    {
      text: 'เลขที่นำส่ง ..................../..................', // เส้นประ
      absolutePosition: { x: 0, y: 15 },
      alignment: 'right',
    },
  ],
},
      {
        text: 'มหาวิทยาลัยพะเยา \n ใบนำส่งเงิน\n',
        style: 'header',
        alignment: 'center',
        margin: [0, -20, 0, 0],
        bold: true,
        fontSize: 15,
      },
      { text: '\n\n' },

      // ✅ ส่วนที่ 1: ข้อมูลผู้ทำรายการ (อัปเดตใหม่)
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

      // ✅ แสดงหน่วยงานรอง (ถ้ามี)
      ...(receipt.subAffiliationName1 ? [{
        stack: [
          { text: `${receipt.subAffiliationName1 || ''}`, absolutePosition: { x: 110, y: 98.5 }, fontSize: 13 },
          { text: 'หน่วยงานรอง..........................................................................................................................................................................................................\n', margin: [-10, 0, 0, 0] },
        ],
      }] : []),

      // ✅ แสดงหน่วยงานย่อย (ถ้ามี)
      ...(receipt.subAffiliationName2 ? [{
        stack: [
          { text: `${receipt.subAffiliationName2 || ''}`, absolutePosition: { x: 110, y: receipt.subAffiliationName1 ? 115.5 : 98.5 }, fontSize: 13 },
          { text: 'หน่วยงานย่อย..........................................................................................................................................................................................................\n', margin: [-10, 0, 0, 0] },
        ],
      }] : []),

      // ✅ กองทุนและขอนำส่งเงิน
      {
        stack: [
          {
            text: `${receipt.sendmoney || ''}`,
            absolutePosition: {
              x: 110,
              y: receipt.subAffiliationName2 ? 132.5 : (receipt.subAffiliationName1 ? 115.5 : 98.5)
            },
            fontSize: 13
          },
          {
            text: `${receipt.fundName || ''}`,
            absolutePosition: {
              x: 460,
              y: receipt.subAffiliationName2 ? 132.5 : (receipt.subAffiliationName1 ? 115.5 : 98.5)
            },
            fontSize: 13
          },
          { text: 'ใบนำส่งรายได้/เงินโครงการ.........................................................................................................................................................กองทุน..........................................................\n', margin: [-10, 0, 0, 0] },
        ],
      },

      // ✅ รหัสโครงการ
      {
        stack: [
          {
            text: `${receipt.projectCode || receipt.referenceId || ''}`,
            absolutePosition: {
              x: 265,
              y: receipt.subAffiliationName2 ? 149 : (receipt.subAffiliationName1 ? 132 : 115)
            },
            fontSize: 13
          },
          { text: 'รหัสโครงการ(กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ)............................................................. ', margin: [-10, 0, 0, 0] },
        ],
      },

      // ✅ ตาราง (ลบคอลัมน์ผู้ทำรายการออก)
      {
        table: {
          widths: ['10%', '18%', '*', '15%', '22%'],
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

      // ✅ รายการชำระเงิน พร้อมเครื่องหมายถูก
      ...(receipt.payments && receipt.payments.length > 0 ?
        receipt.payments.flatMap((payment: any) => {
          const result: any[] = []

          if (payment.type === 'transfer') {
            result.push({
              columns: [
                { ...createCheckbox(), margin: [100, 12, 0, 0] },
                {
                  text: `นำฝากบัญชี ${payment.bankName || ''}`,
                  margin: [110, 10, 0, 0],
                },
                {
                  text: `เลขที่ ${payment.accountNumber || ''}`,
                  margin: [5, 10, 0, 0],
                }
              ],
            })

            result.push({
              columns: [
                {
                  text: `ชื่อบัญชี ${payment.accountName || payment.bankName || ''}`,
                  margin: [120, 0, 0, 0],
                  width: 200,
                  noWrap: true,
                },
                {
                  text: 'จำนวน',
                  width: 50,
                  margin: [163, 0, 0, 0],
                  noWrap: true,
                },
                {
                  text: payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
                  width: 80,
                  margin: [155, 0, 0, 0],
                  noWrap: true,
                },
                {
                  text: 'บาท',
                  width: 30,
                  noWrap: true,
                  margin: [115, 0, 0, 0],
                },
              ],
            })
          } else if (payment.type === 'cash') {
            result.push({
              columns: [
                { ...createCheckbox(), margin: [100, 7, 0, 0] },
                {
                  text: 'เงินสด',
                  margin: [110, 5, 0, 0],
                  noWrap: true,
                  width: 'auto',
                },
                {
                  text: 'จำนวน',
                  width: 'auto',
                  margin: [220, 5, 0, 0],
                  noWrap: true,
                },
                {
                  text: payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
                  width: 80,
                  margin: [0, 5, 15, 0],
                  alignment: 'center',
                },
                {
                  text: 'บาท',
                  width: 'auto',
                  noWrap: true,
                  margin: [-19, 5, 0, 0],
                },
              ],
            })
          } else if (payment.type === 'check') {
            result.push({
              columns: [
                { ...createCheckbox(), margin: [100, 7, 0, 0] },
                {
                  text: 'เช็ค',
                  width: 'auto',
                  noWrap: true,
                  margin: [110, 5, 0, 0],
                },
                {
                  text: `ธนาคาร${payment.bankName || ''}`,
                  margin: [5, 5, 0, 0],
                },
              ],
            })
            result.push({
              columns: [
                {
                  text: payment.checkNumber ? `เลขที่เช็ค ${payment.checkNumber}` : '',
                  alignment: 'left',
                  noWrap: true,
                  margin: [-10, 0, 0, 0],
                },
                {
                  columns: [
                    {
                      text: 'จำนวน',
                      noWrap: true,
                      width: 'auto',
                    },
                    {
                      text: payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
                      alignment: 'right',
                      width: 'auto',
                      noWrap: true,
                      margin: [18.5, 0, 0, 0],
                    },
                    {
                      text: 'บาท',
                      noWrap: true,
                      width: 'auto',
                      margin: [16.5, 0, 0, 0],
                    },
                  ],
                  alignment: 'right',
                  width: 'auto',
                },
              ],
              margin: [130, 0, 92.5, 0],
            })
          }

          return result
        })
      : []),

      { text: '\n' },

      // ✅ ลายเซ็น
      {
        unbreakable: true,
        stack: [
          {
            columns: [
              {
                stack: [
                  {
                    text: 'ลงชื่อ',
                    margin: [20, 0, 0, 0],
                    alignment: 'left',
                    bold: true,
                  },
                  {
                    text: receipt.fullName || '',
                    alignment: 'center',
                    margin: [0, 0, 0, -15],
                    fontSize: 13,
                  },
                  {
                    text: '(........................................................................)',
                    alignment: 'center',
                    bold: true,
                  },
                  {
                    text: 'ผู้นำส่งเงิน',
                    alignment: 'center',
                    margin: [10, 0, 0, 0],
                    bold: true,
                  },
                  {
                    text: receipt.date || currentDate,
                    alignment: 'center',
                    margin: [0, 0, 0, -15],
                    fontSize: 13,
                  },
                  {
                    text: 'ลงวันที่.......................................................',
                    alignment: 'center',
                    bold: true,
                  },
                ],
              },
              {
                stack: [
                  {
                    text: 'ลงชื่อ',
                    margin: [0, 0, 225, 0],
                    alignment: 'center',
                    bold: true,
                  },
                  {
                    text: '(........................................................................)',
                    alignment: 'center',
                    margin: [0, 1, 0, 0],
                    bold: true,
                  },
                  {
                    text: 'ผู้รับเงิน',
                    alignment: 'center',
                    bold: true,
                  },
                  {
                    text: 'ลงวันที่.......................................................',
                    alignment: 'center',
                    margin: [0, 3, 0, 0],
                    bold: true,
                  },
                ],
              },
            ],
            widths: ['50%', '50%']
          },
        ],
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

// ✅ เปลี่ยนมาใช้ clearSummaryService แทน localStorage
onMounted(async () => {
  try {
    loading.value = true
    const referenceId = route.params.id as string
    console.log('🔍 Looking for referenceId:', referenceId)

    const { clearSummaryService } = await import('@/services/ClearDebtor/clearSummaryService')
    const foundHistory = await clearSummaryService.getByReferenceId(referenceId)

    if (!foundHistory) {
      console.error('❌ Clear summary not found:', referenceId)
      loading.value = false
      return
    }

    console.log('✅ Found clear summary:', foundHistory)
    console.log('📋 DebtorList:', foundHistory.debtorList)

    // ✅ โหลดข้อมูลผู้ทำรายการ (แก้ไขส่วนนี้)
    receiptData.value = {
      // ✅ ใช้ waybillNumbers array หรือ referenceId
      waybillNumber: foundHistory.waybillNumbers?.[0] || foundHistory.referenceId,
      waybillNumbers: foundHistory.waybillNumbers || [], // เก็บ array ทั้งหมดไว้ใช้งาน
      referenceId: foundHistory.referenceId,
      fullName: foundHistory.fullName || 'ไม่ระบุ',
      phone: foundHistory.phone || '-',
      mainAffiliationName: foundHistory.mainAffiliationName || 'ไม่ระบุ',
      subAffiliationName1: foundHistory.subAffiliationName1 || '',
      subAffiliationName2: foundHistory.subAffiliationName2 || '',
      sendmoney: foundHistory.sendmoney || '-',
      fundName: foundHistory.fundName || '-',
      projectCode: foundHistory.projectCode || foundHistory.referenceId,
      date: new Date(foundHistory.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      payments: foundHistory.payments || []
    }

    console.log('📝 Loaded waybillNumber:', receiptData.value.waybillNumber)
    console.log('📝 All waybillNumbers:', receiptData.value.waybillNumbers)

    // ... ส่วนที่เหลือเหมือนเดิม
    rows.splice(0, rows.length)

    if (Array.isArray(foundHistory.debtorList) && foundHistory.debtorList.length > 0) {
      console.log('✅ Processing', foundHistory.debtorList.length, 'items')

      foundHistory.debtorList.forEach((item: any) => {
        rows.push({
          item: item.itemName || '',
          amount: (item.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 }),
          ref: item.receiptNumber || item.waybillNumber || '',
          note: item.note || '',
        })
      })

      console.log('✅ Created', rows.length, 'rows')
    }

    const total = foundHistory.totalAmount || 0
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
