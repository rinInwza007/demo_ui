<template>
  <div>
    <Navbar  />
    <SecondNavbar class="bg-gray-100 "/>

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
      <button
        @click="gotomainpage"
        class="px-6 py-2 rounded-md bg-gray-600 text-white btn-back"
      >
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
  day: 'numeric'
})

// ✅ ฟังก์ชันแปลงตัวเลขเป็นตัวอักษรไทย
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
      if (position === 1 && digit === 1) {
        result += 'สิบ'
      } else if (position === 1 && digit === 2) {
        result += 'ยี่สิบ'
      } else if (position === 0 && digit === 1 && len > 1) {
        result += 'เอ็ด'
      } else {
        result += bahtText[digit] + unitText[position]
      }
    }
  }

  result += 'บาทถ้วน'
  return result
}

function deleteRowEmpty() {
  const filtered = rows.filter((row) => {
    if (row.item && row.item.includes('ค่าธรรมเนียม')) {
      return true
    }
    return Object.values(row).some((value) => value && value.toString().trim() !== '')
  })
  rows.splice(0, rows.length, ...filtered)
}


function createDocDefinition() {
  deleteRowEmpty()

  const receipt = receiptData.value || {}

  const isCash = receipt.receiptList?.some(item =>
    item.paymentDetails.some(p => p.moneyType === 'cash')
  ) || false

  const hasCheck = receipt.receiptList?.some(item =>
    item.paymentDetails.some(p => p.moneyType === 'bank')
  ) || false

  const checkDetails = receipt.receiptList?.flatMap(item => {
    const checks = item.paymentDetails.filter(p => p.moneyType === 'bank')
    const fee = item.fee || 0
    const feePerCheck = checks.length > 0 ? fee / checks.length : 0
    return checks.map(check => ({
      ...check,
      amount: (check.amount || 0) - feePerCheck
    }))
  }) || []

  const transferDetails = receipt.receiptList?.flatMap(item => {
    const transfers = item.paymentDetails.filter(p => p.moneyType === 'transfer')
    const fee = item.fee || 0
    const feePer = transfers.length ? fee / transfers.length : 0

    return transfers.map(t => ({
      ...t,
      amount: (t.amount || 0) - feePer
    }))
  }) || []

  const cashAmount = receipt.receiptList?.reduce((sum, item) => {
    const cashPayments = item.paymentDetails.filter(p => p.moneyType === 'cash')
    const cashTotal = cashPayments.reduce((s, p) => s + (p.amount || 0), 0)
    const fee = item.fee || 0
    return sum + cashTotal - (cashPayments.length > 0 ? fee : 0)
  }, 0) || 0

  return {
    pageSize: 'A4',
    pageMargins: [20, 30, 20, 0],
    defaultStyle: { font: 'THSarabun', fontSize: 13 },
    content: [
      {
        stack: [
          {
            text: `${ ''}`,
            absolutePosition: { x: 420, y: 15 },
            fontSize: 13,
          },
          {
            text: 'เลขที่นำส่ง ..................../..................',
            absolutePosition: { x: 0, y: 15 },
            margin: [0, 0, 0, 0],
            lineHeight: 1,
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
      { text: '\n' },
      { text: '\n' },
      {
        stack: [
          {
            text: `${currentDate}`,
            absolutePosition: { x: 440, y: 65 },
            fontSize: 13,
          },
          {
            text: 'วันที่............................................................................\n',
            absolutePosition: { x: 400, y: 66.5 },
          },
        ],
      },
      {
        stack: [
          {
            text: `${receipt.fullName || ''}`,
            absolutePosition: { x: 95, y: 81.5 },
            fontSize: 13,
          },
          {
            text: `${receipt.phone || ''}`,
            absolutePosition: { x: 270, y: 81.5 },
            fontSize: 13,
          },
          {
            text: `${receipt.mainAffiliationName || ''}`,
            absolutePosition: { x: 370, y: 81.5 },
            fontSize: 13,
          },
          {
            text: 'ข้าพเจ้า........................................................เบอร์โทรติดต่อ.............................................สังกัด....................................................................................................\n',
            margin: [35, 0, 0, 0],
          },
        ],
      },
      {
        stack: [
          {
            text: `${receipt.sendmoney || ''}`,
            absolutePosition: { x: 110, y: 98.5 },
            fontSize: 13,
          },
          {
            text: `${receipt.fundName || ''}`,
            absolutePosition: { x: 460, y: 98.5 },
            fontSize: 13,
          },
          {
            text: 'ใบนำส่งรายได้/เงินโครงการ.........................................................................................................................................................กองทุน..........................................................\n',
            margin: [-10, 0, 0, 0],
          },
        ],
      },
      {
        stack: [
          {
            text: `${receipt.projectCode || ''}`,
            absolutePosition: { x: 265, y: 115 },
            fontSize: 13,
          },
          {
            text: 'รหัสโครงการ(กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ)............................................................. ',
            margin: [-10, 0, 0, 0],
          },
        ],
      },
      {
        table: {
          widths: ['8%', '15%', '*', '12%', '20%'],
          body: [
            [
              {
                text: '\n  ลำดับที่',
                alignment: 'center',
                bold: true,
                margin: [0, 10, 0, 0],
              },
              {
                text: 'เลขที่\nเอกสารอ้างอิง\n(เล่มที่/เลขที่\nใบเสร็จรับเงิน)',
                alignment: 'center',
                bold: true,
              },
              {
                text: '\nรายการ',
                alignment: 'center',
                bold: true,
                margin: [0, 10, 0, 0],
              },
              {
                text: '\nจำนวน/บาท',
                alignment: 'center',
                bold: true,
                margin: [0, 10, 0, 0],
              },
              {
                text: '\nหมายเหตุ',
                alignment: 'center',
                bold: true,
                margin: [0, 10, 0, 0],
              },
            ],
            ...rows.map((r) => [
              { text: r.id ?? '', alignment: 'center' },
              { text: r.ref ?? '', alignment: 'center' },
              { text: r.item ?? ' ', alignment: 'left' },
              { text: r.amount ?? '', alignment: 'right' },
              { text: r.note ?? '', alignment: 'center' },
            ]),
            [
              {
                text: summary.text,
                colSpan: 3,
                alignment: 'center',
                bold: true,
              },
              '',
              '',
              { text: summary.total || '', alignment: 'right', bold: true },
              {
                text: summary.Empty || '',
                alignment: 'center',
                bold: true,
                border: [true, true, false, false],
              },
            ],
          ],
        },
        layer: 'nobold',
        margin: [-10, 0, -10, 0],
      },
      { text: '\n' },

...(isCash ? [{
  columns: [
    {
      columns: [
        {
          text: 'เงินสด',
          style: 'form',
          margin: [83, 0, 0, 0],
          noWrap: true,
          width: 'auto'
        },              {
                text: 'จำนวนเงิน',
                style: 'form',
                width: 'auto',
                margin: [240, 0, 0, 0],
                noWrap: true
              },
        {
          stack: [
            {
              text: isCash ? cashAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '',
              alignment: 'center',
              lineHeight: 1.2
            },
            {
              text: '.............................',
              alignment: 'center',
              margin: [0, -19, 0, 0],
              lineHeight: 1
            },
          ],
          width: 80,margin: [-18, 0, 0, 0]
        },          {
                text: 'บาท',
                style: 'form',
                width: 'auto',
                noWrap: true,
                margin: [-20, 0, 0, 0]
              }
      ]
    }
  ],
}] : []),  // ✅ เพิ่ม ']'

      ...checkDetails.map((check) => ({
        columns: [

          {
            columns: [
              {
                text: 'เช็คธนาคาร',
                style: 'form',
                margin: [58, 3, -25, 0],
                width: 'auto'
              },
              {
                stack: [
                  {
                    text: `${check.bankName || 'ธนาคารกรุงไทย'}`,
                    alignment: 'center',
                    lineHeight: 1.2
                  },
                  {
                    text: '.............................',
                    alignment: 'center',
                    margin: [-50, -19, -50, 0],
                    lineHeight: 1
                  }
                ],
                width: 120,
                margin: [-10, 3, 0, 0]
              },
              {
                text: 'เลขที่เช็ค',
                style: 'form',
                width: 'auto',
                margin: [-30, 3, 0, 0]
              },
              {
                stack: [
                  {
                    text: `${check.checkNumber || ''}`,
                    alignment: 'center',
                    lineHeight: 1.2
                  },
                  {
                    text: '.............................',
                    alignment: 'center',
                    margin: [0, -19, 0, 0],
                    lineHeight: 1
                  }
                ],
                width: 100,
                margin: [-35, 3, 0, 0]
              },
              {
                text: 'จำนวนเงิน',
                style: 'form',
                width: 'auto',
                margin: [25, 3, 0, 0]
              },
              {
                stack: [
                  {
                    text: `${check.amount ? check.amount.toLocaleString('th-TH', {minimumFractionDigits: 2}) : ''}`,
                    alignment: 'center',
                    lineHeight: 1.2
                  },
                  {
                    text: '.............................',
                    alignment: 'center',
                    margin: [0, -19, 0, 0],
                    lineHeight: 1
                  }
                ],
                width: 80,
                margin: [-18, 3, 0, 0]
              },
              {
                text: 'บาท',
                style: 'form',
                width: 'auto',
                margin: [-20, 3, 0, 0]
              }
            ]
          }
        ],
        margin: [25, 3, 0, 0]
      })),

      ...(hasCheck ? [{
        columns: [
          {
            columns: [
              {
                text: 'รวมยอดเงินตามเช็ค',
                style: 'form',
                width: 'auto',
                margin: [170, 3, 0, 0]
              },
              {
                text: 'จำนวนเงิน',
                style: 'form',
                width: 'auto',
                margin: [56, 3, 0, 0]
              },
              {
                stack: [
                  {
                    text: `${checkDetails.reduce((sum, c) => sum + (c.amount || 0), 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}`,
                    alignment: 'center',
                    lineHeight: 1.2
                  },
                  {
                    text: '.............................',
                    alignment: 'center',
                    margin: [0, -19, 0, 0],
                    lineHeight: 1
                  }
                ],
                width: 80,
                margin: [-18, 3, 0, 0]
              },
              {
                text: 'บาท',
                style: 'form',
                width: 'auto',
                margin: [-20, 3, 0, 0]
              }
            ]
          }
        ],
        margin: [50, 5, 0, 0]
      }] : []),

      ...transferDetails.map((transfer) => [
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
                {
                  text: `${transfer.bankName || ''}`,
                  alignment: 'center',
                  lineHeight: 1.2
                },
                {
                  text: '.............................',
                  alignment: 'center',
                  margin: [0, -19, 0, 0],
                  lineHeight: 1
                }
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
                {
                  text: `${transfer.accountNumber || ''}`,
                  alignment: 'center',
                  lineHeight: 1.2
                },
                {
                  text: '.............................',
                  alignment: 'center',
                  margin: [0, -19, 0, 0],
                  lineHeight: 1
                }
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
            {
              text: '',
              width: 20,
              margin: [52.5, 0, 0, 0]
            },
            {
              text: 'ชื่อบัญชี',
              style: 'form',
              width: 'auto',
              margin: [13, 3, 0, 0]
            },
            {
              stack: [
                {
                  text: `${transfer.accountName || ''}`,
                  alignment: 'center',
                  lineHeight: 1.2
                },
                {
                  text: '.........................................................',
                  alignment: 'center',
                  margin: [0, -19, 0, 0],
                  lineHeight: 1
                }
              ],
              width: 200,
              margin: [-75, 3, 0, 0]
            },
            {
              text: 'จำนวนเงิน',
              style: 'form',
              width: 'auto',
              margin: [34.5, 3, 0, 0]
            },
            {
              stack: [
                {
                  text: `${transfer.amount ? transfer.amount.toLocaleString('th-TH', {minimumFractionDigits: 2}) : ''}`,
                  alignment: 'center',
                  lineHeight: 1.2
                },
                {
                  text: '.............................',
                  alignment: 'center',
                  margin: [0, -19, 0, 0],
                  lineHeight: 1
                }
              ],
              width: 80,
              margin: [-18, 3, 0, 0]
            },
            {
              text: 'บาท',
              style: 'form',
              width: 'auto',
              margin: [-20, 3, 0, 0]
            }
          ],
          margin: [50, 3, 0, 0]
        }
      ]).flat(),
      { text: '\n' },
      { text: '\n' },
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
          text: currentDate,
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
  widths: ['50%', '50%']  // ⭐ ตัวนี้แหละ พระเอก
}
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

// ✅ โหลดข้อมูลตาม projectCode จาก URL
onMounted(() => {
  try {
    loading.value = true

    // ✅ ดึง projectCode จาก URL params
    const projectCode = route.params.id
    console.log('🔍 Loading receipt with projectCode:', projectCode)

    // ✅ โหลดข้อมูลทั้งหมด
    const receipts = loadReceipts()
    console.log('📦 Total receipts:', receipts.length)

    // ✅ ค้นหา receipt ที่ตรงกับ projectCode
    const foundReceipt = receipts.find(r => r.projectCode === projectCode)

    if (!foundReceipt) {
      console.error('❌ Receipt not found for projectCode:', projectCode)
      loading.value = false
      return
    }

    console.log('✅ Found receipt:', foundReceipt.projectCode, foundReceipt.fullName)
    receiptData.value = foundReceipt

    // ✅ สร้าง rows จากข้อมูล receiptList
    if (receiptData.value && receiptData.value.receiptList) {
      rows.splice(0, rows.length)

      let rowNumber = 1

receiptData.value.receiptList.forEach((item) => {
  // ✅ เพิ่ม payment ทั้งหมดก่อน
  item.paymentDetails.forEach((payment) => {
    rows.push({
      id: String(rowNumber),
      ref: payment.referenceNo || '',
      item: item.itemName || '',
      amount: payment.amount ? payment.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '',
      other: '',
      note: item.note || ''
    })

    rowNumber++
  })

  // ✅ เพิ่มค่าธรรมเนียมเพียงครั้งเดียวหลังจากเพิ่ม payment ทั้งหมดแล้ว
  if (item.fee && item.fee > 0) {
    rows.push({
      id: '',
      ref: '',
      item: 'หัก ค่าธรรมเนียม',
      amount: `${item.fee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
      other: '',
      note: ''
    })
  }
})

      const total = receiptData.value.netTotalAmount || 0
      summary.text = convertNumberToThaiText(total)
      summary.total = total.toLocaleString('th-TH', { minimumFractionDigits: 2 })
      
    }

    previewPdf()
    loading.value = false

  } catch (error) {
    console.error('❌ Error loading receipt:', error)
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
