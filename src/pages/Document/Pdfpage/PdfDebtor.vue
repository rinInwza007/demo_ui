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

    <div class="mt-6 flex justify-end gap-3 mb-4">
      <button @click="gotomainpage" class="px-6 py-2 rounded-md bg-gray-600 text-white btn-back">
        กลับ
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import pdfMake from 'pdfmake/build/pdfmake'
import { vfs, fonts } from '../../../assets/fonts.js'
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import { loadReceipts } from '@/fake/mockDb.js'

const route = useRoute()
const router = useRouter()

const gotomainpage = () => {
  router.push('/')
}

pdfMake.vfs = vfs
pdfMake.fonts = fonts

const pdfUrl = ref(null)
const receiptData = ref(null)
const loading = ref(true)
const rows = reactive([])

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

function convertNumberToThaiText(number) {
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
          { text: `${receipt.projectCode || ''}`, absolutePosition: { x: 265, y: 115 }, fontSize: 13 },
          { text: 'รหัสโครงการ(กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ)............................................................. ', margin: [-10, 0, 0, 0] },
        ],
      },

      // ========== ตาราง ==========
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

      ...(receipt.debtorList && receipt.debtorList.length > 0 ? [
        {
          columns: [
            {
              columns: [
                {
                  text: 'ลูกหนี้',
                  style: 'form',
                  margin: [83, 0, 0, 0],
                  width: 'auto',
                  noWrap: true
                }
              ]
            }
          ]
        },
        ...receipt.debtorList.map((debtor) => ({
          columns: [
            { text: `${debtor.itemName}`, width: '*', margin: [33, 0, 0, 0] },
            { text: 'จำนวนเงิน', style: 'form', width: 'auto', margin: [0, 0, 0, 0] },
            {
              stack: [
                { text: `${debtor.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, alignment: 'center', lineHeight: 1.2 },
                { text: '.............................', alignment: 'center', margin: [0, -19, 0, 0], lineHeight: 1 }
              ],
              width: 80,
              margin: [-15, 0, 7, 0]
            },
            { text: 'บาท', style: 'form', width: 'auto', margin: [-20, 0, 0, 0] }
          ],
          margin: [50, 3, 95, 0]
        }))
      ] : []),

      // รายการเงินฝาก
      ...(receipt.depositList && receipt.depositList.length > 0 ? 
        receipt.depositList.flatMap((deposit) => 
          deposit.paymentDetails.map((payment) => [
            {
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
            },
            {
              columns: [
                { text: '', width: 20, margin: [52.5, 0, 0, 0] },
                { text: 'ชื่อบัญชี', style: 'form', width: 'auto', margin: [13, 3, 0, 0] },
                {
                  stack: [
                    { text: `${payment.accountName || ''}`, alignment: 'center', lineHeight: 1.2 },
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
            }
          ])
        ).flat()
      : []),

      { text: '\n\n' },

      // ========== ลายเซ็น (เลียนแบบตำแหน่ง pdfWaybill) ==========
      {
        columns: [
          {
            stack: [
              { style: 'form', text: 'ลงชื่อ', alignment: 'center', absolutePosition: { x: -520, y: 697 } }, 
              { text: `${receipt.fullName || ''}`, alignment: 'left', absolutePosition: { x: 105, y: 718.5 }, fontSize: 13 }, 
              { style: 'form', text: '(........................................................................)', alignment: 'center', absolutePosition: { x: -300, y: 720 } }, 
              { style: 'form', text: 'ผู้นำส่งเงิน', alignment: 'center', absolutePosition: { x: -300, y: 740 } }, 
              { text: `${currentDate}`, alignment: 'left', absolutePosition: { x: 105, y: 768 }, fontSize: 13 },
              { style: 'form', text: 'ลงวันที่.......................................................', alignment: 'center', absolutePosition: { x: -300, y: 770 } },
            ],
          },
          {
            stack: [
              { style: 'form', text: '\nลงชื่อ', alignment: 'center', absolutePosition: { x: 110, y: 680 } },
              { style: 'form', text: '(........................................................................)', alignment: 'center', absolutePosition: { x: 340, y: 720 } },
              { style: 'form', text: 'ผู้รับเงิน', alignment: 'center', absolutePosition: { x: 335, y: 740 } }, 
              { style: 'form', text: 'ลงวันที่.......................................................', alignment: 'center', absolutePosition: { x: 340, y: 770 } }, 
            ],
          },
        ],
      },
      {
        text: '***หมายเหตุ จัดทำแบบฟอร์มนี้ด้วยการพิมพ์เท่านั้น',
        alignment: 'center',
        absolutePosition: { x: -380, y: 805 },
        fontSize: 12,
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
    const projectCode = route.params.id
    const receipts = loadReceipts() 
    const foundReceipt = receipts.find((r) => r.projectCode === projectCode) 

    if (!foundReceipt) {
      loading.value = false
      return
    }

    receiptData.value = foundReceipt
    const MIN_ROWS = 8
    rows.splice(0, rows.length)

    if (receiptData.value.debtorList) {
      receiptData.value.debtorList.forEach((debtor) => {
        rows.push({
          item: debtor.itemName || '',
          amount: debtor.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
          ref: '',
          note: debtor.debtornote || '',
        })
      })
    }

    if (receiptData.value.depositList) {
      receiptData.value.depositList.forEach((deposit) => {
        deposit.paymentDetails?.forEach((payment) => {
          rows.push({
            item: deposit.itemName || '',
            amount: payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
            ref: payment.referenceNo || '',
            note: deposit.depositnote || '',
          })
        })
        if (deposit.fee && deposit.fee > 0) {
          rows.push({
            ref: ' ',
            item: 'ค่าธรรมเนียม',
            amount: `${deposit.fee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
            note: ' ',
            isFee: true,
          })
        }
      })
    }

    while (rows.length < MIN_ROWS) {
      rows.push({ item: ' ', amount: ' ', ref: ' ', note: ' ' })
    }

    const total = receiptData.value.netTotalAmount || 0 
    summary.text = convertNumberToThaiText(total)
    summary.total = total.toLocaleString('th-TH', { minimumFractionDigits: 2 })

    previewPdf()
    loading.value = false
  } catch (error) {
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