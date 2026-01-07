<template>
  <div>
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
import { loadReceipts } from '@/fake/mockDb.js'
import { isReceivableItem } from '@/components/data/ItemNameOption'
const route = useRoute()
const router = useRouter()

const gotomainpage = () => {
  router.push('/indexwaybill')
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
function separateDebtorItems() {
  const debtors = []
  const normalItems = []
  let totalDebtor = 0

  rows.forEach((row) => {
    // ตรวจสอบว่าเป็นลูกหนี้หรือไม่
    const isDebtor = isReceivableItem(row.item)

    if (isDebtor && row.amount) {
      const amount =
        typeof row.amount === 'string'
          ? parseFloat(row.amount.replace(/,/g, ''))
          : Number(row.amount)

      debtors.push({
        itemName: row.item,
        amount: amount,
        formattedAmount: amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      })

      totalDebtor += amount
    } else {
      normalItems.push(row)
    }
  })

  return {
    debtors,
    normalItems,
    totalDebtor,
    hasDebtor: debtors.length > 0,
  }
}
const currentDate = new Date().toLocaleDateString('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
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
const createCheckbox = () => ({
  canvas: [
    // กล่องสี่เหลี่ยม
    {
      type: 'rect',
      x: 0,
      y: 2,
      w: 8,
      h: 8,
      stroke: 'black',
      fill: null,
    },

    // ขีดซ้ายของเครื่องหมายถูก
    {
      type: 'line',
      x1: 2,
      y1: 6,
      x2: 4,
      y2: 8,
      stroke: 'black',
      strokeWidth: 1,
    },

    // ขีดขวาของเครื่องหมายถูก
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
});
function createDocDefinition() {
  deleteRowEmpty()

  const receipt = receiptData.value || {}

  const { debtors, normalItems, totalDebtor, hasDebtor } = separateDebtorItems()

  const pm = receipt.paymentMethods || {}

  const getAmount = (key) => {
    const amt = pm[key]?.amount || 0
    return typeof amt === 'string' ? parseFloat(amt.replace(/,/g, '')) : Number(amt)
  }

  const krungthai1Amt = pm.krungthai1?.checked ? getAmount('krungthai1') : 0
  const krungthai2Amt = pm.krungthai2?.checked ? getAmount('krungthai2') : 0
  const krungthai3Amt = pm.krungthai3?.checked ? getAmount('krungthai3') : 0
  const cashAmt = pm.cash?.checked ? getAmount('cash') : 0
  const checkAmt = pm.check?.checked ? getAmount('check') : 0
  const debtorAmt = pm.debtor?.checked ? getAmount('debtor') : 0
  const otherAmt = pm.other?.checked ? getAmount('other') : 0
  const otherName = pm.other?.name?.trim() || 'อื่น ๆ'

  return {
    pageSize: 'A4',
    pageMargins: [20, 30, 20, 0],
    defaultStyle: { font: 'THSarabun', fontSize: 13 },
    content: [
      // ========== ส่วนหัวเอกสาร (เดิม) ==========
      {
        stack: [
          {
            text: `${receipt.delNumber || ''}`,
            absolutePosition: { x: 530, y: 15 },
            fontSize: 13,
          },
          {
            text: 'เลขที่นำส่ง ...........................',
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
            absolutePosition: { x: 350, y: 98.5 },
            fontSize: 13,
          },
          {
            text: 'ใบนำส่งรายได้/เงินโครงการ................................................................................................กองทุน....................................................................................................................\n',
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

      // ========== ตารางหลัก ==========
      {
        table: {
          widths: ['8%', '15%', '*', '12%', '20%'],
          body: [
            [
              { text: '\n  ลำดับที่', alignment: 'center', bold: true, margin: [0, 10, 0, 0] },
              {
                text: 'เลขที่\nเอกสารอ้างอิง\n(เล่มที่/เลขที่\nใบเสร็จรับเงิน)',
                alignment: 'center',
                bold: true,
              },
              { text: '\nรายการ', alignment: 'center', bold: true, margin: [0, 10, 0, 0] },
              { text: '\nจำนวน/บาท', alignment: 'center', bold: true, margin: [0, 10, 0, 0] },
              { text: '\nหมายเหตุ', alignment: 'center', bold: true, margin: [0, 10, 0, 0] },
            ],
            ...rows.map((r) => [
              { text: r.id ?? '', alignment: 'center' },
              { text: r.ref ?? '', alignment: 'center' },
              { text: r.item ?? ' ', alignment: 'left' },
              { text: r.amount ?? '', alignment: 'right' },
              { text: r.note ?? '', alignment: 'center' },
            ]),
            [
              { text: summary.text, colSpan: 3, alignment: 'center', bold: true },
              '',
              '',
              { text: summary.total || '', alignment: 'right', bold: true },
              { text: '', alignment: 'center', bold: true, border: [true, true, false, false] },
            ],
          ],
        },
        margin: [-10, 0, -10, 0],
      },
      { text: '\n' },

      // ========== ส่วนที่ 3: การนำส่งเงิน ==========

      ...(pm.cash?.checked && cashAmt > 0
        ? [
            {
              columns: [
                {
                  columns: [
                    { ...createCheckbox(), margin: [100, 2, 0, 0] },
                    {
                      text: 'เงินสด',
                      style: 'form',
                      margin: [110, 0, 0, 0],
                      noWrap: true,
                      width: 'auto',
                    },
                    {
                      text: 'จำนวน',
                      width: 'auto',
                      margin: [220, 0, 0, 0],
                      noWrap: true,
                    },
                    {
                      stack: [
                        {
                          text: cashAmt.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
                          alignment: 'center',
                          lineHeight: 1.2,
                        },
                      ],
                      width: 80,
                      margin: [-18, 0, 0, 0],
                    },
                    {
                      text: 'บาท',
                      width: 'auto',
                      noWrap: true,
                      margin: [-20, 0, 0, 0],
                    },
                  ],
                },
              ],
            },
          ]
        : []),

      // เช็ค
      ...(pm.check?.checked && checkAmt > 0
        ? [
            {
              columns: [
                { ...createCheckbox(), margin: [100, 2, 0, 0] },
                {
                  text: 'เช็ค',
                  style: 'form',
                  width: 'auto',
                  noWrap: true,
                  margin: [110, 0, 0, 0],
                },
                {
                  text: `ธนาคาร${pm.check.bankName ?? ''}`,
                  style: 'form',
                  margin: [10, 0, 0, 0],
                },
              ],
            },
            {
              columns: [
                {
                  text: [
                    pm.check.checkNumber ? `เลขที่เช็ค ${pm.check.checkNumber}   ` : '',
                    pm.check.NumIncheck ? `เลขที่ในเช็ค ${pm.check.NumIncheck}` : '',
                  ].join(''),
                  style: 'form',
                  alignment: 'left',
                  noWrap: true,
                },
                {
                  columns: [
                    {
                      text: 'จำนวน',
                      noWrap: true,
                      width: 'auto',
                    },
                    {
                      text: checkAmt.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                      }),
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
              margin: [130, 2, 92.5, 0],
            },
          ]
        : []),

      // กรุงไทย 1
      ...(pm.krungthai1?.checked && krungthai1Amt > 0
        ? [
            {
              columns: [
                { ...createCheckbox(), margin: [100, 12, 0, 0] },
                {
                  text: 'นำฝากบัญชีกรุงไทย เลขที่บัญชี 671-2-90667-9',
                  style: 'form',
                  margin: [110, 10, 0, 0],
                },
              ],
            },
            {
              columns: [
                {
                  text: 'ชื่อบัญชี โรงพยาบาลมหาวิทยาลัยพะเยา',
                  style: 'form',
                  alignment: 'left',
                  noWrap: true,
                },
                {
                  text: 'จำนวน',
                  margin: [90, 0, 0, 0],
                },
                {
                  text: krungthai1Amt.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  }),
                  margin: [-9, 0, 0, 0],
                  noWrap: true,
                },
                {
                  text: 'บาท',
                  noWrap: true,
                  margin: [-110, 0, 0, 0],
                },
              ],
              margin: [130, 2, 100, 0],
            },
          ]
        : []),

      // กรุงไทย 2
      ...(pm.krungthai2?.checked && krungthai2Amt > 0
        ? [
            {
              columns: [
                { ...createCheckbox(), margin: [100, 12, 0, 0] },
                {
                  text: 'นำฝากบัญชีกรุงไทย เลขที่บัญชี 980-9-61729-1',
                  style: 'form',
                  margin: [110, 10, 0, 0],
                },
              ],
            },
            {
              columns: [
                {
                  text: 'ชื่อบัญชี มหาวิทยาลัยพะเยา (กองทุนทั่วไป)',
                  style: 'form',
                  alignment: 'left',
                  noWrap: true,
                },
                {
                  text: 'จำนวน',
                  margin: [77.5, 0, 0, 0],
                },
                {
                  text: krungthai2Amt.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  }),
                  margin: [-33.5, 0, 0, 0],
                  noWrap: true,
                },
                {
                  text: 'บาท',
                  noWrap: true,
                  margin: [-147, 0, 0, 0],
                },
              ],
              margin: [130, 2, 100, 0],
            },
          ]
        : []),

      // กรุงไทย 3
      ...(pm.krungthai3?.checked && krungthai3Amt > 0
        ? [
            {
              columns: [
                { ...createCheckbox(), margin: [100, 12, 0, 0] },
                {
                  text: 'นำฝากบัญชีกรุงไทย เลขที่บัญชี 662-0-96023-5',
                  style: 'form',
                  margin: [110, 10, 0, 0],
                },
              ],
            },
            {
              columns: [
                {
                  text: 'ชื่อบัญชี กองทุนเพื่อการจัดตั้งธนาคารเลือด',
                  style: 'form',
                  alignment: 'left',
                  noWrap: true,
                },
                {
                  text: 'จำนวน',
                  margin: [80.25, 0, 0, 0],
                },
                {
                  text: krungthai3Amt.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  }),
                  margin: [-27.5, 0, 0, 0],
                  noWrap: true,
                },
                {
                  text: 'บาท',
                  noWrap: true,
                  margin: [-137.5, 0, 0, 0],
                },
              ],
              margin: [130, 2, 100, 0],
            },
          ]
        : []),

      // อื่น ๆ
      ...(pm.other?.checked && otherAmt > 0
        ? [
            {
              columns: [
                { ...createCheckbox(), margin: [100, 11.5, 0, 0] },
                {
                  text: `อื่นๆ ${otherName}`,
                  style: 'form',
                  alignment: 'left',
                  noWrap: false,
                  margin: [110, 10, 0, 0],
                },
                {
                  text:
                    'จำนวน       ' +
                    otherAmt.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                    }) +
                    '      บาท',
                  alignment: 'right',
                  noWrap: true,
                  margin: [0, 10, 90, 0],
                },
              ],
            },
          ]
        : []),

      // ลูกหนี้
      ...(hasDebtor
        ? [
            { text: '\n' },
            {
              columns: [
                { ...createCheckbox(), margin: [100, 2, 0, 0] },
                {
                  text: 'ลูกหนี้',
                  bold: true,
                  fontSize: 13,
                  margin: [110, 0, 0, 0],
                },
              ],
              margin: [0, 0, 0, 5],
            },
            ...debtors.map((d) => ({
              columns: [
                {
                  text: d.itemName,
                  margin: [120, 2, 0, 0],
                  fontSize: 13,
                  width: '*',
                },
                {
                  text: 'จำนวน',
                  width: 'auto',
                  margin: [0, 2, -119.5, 0],
                  noWrap: true,
                  alignment: 'right',
                },
                {
                  text: `${d.formattedAmount}`,
                  margin: [0, 2, 0, 0],
                  fontSize: 13,
                  alignment: 'right',
                  width: '30%',
                },
                {
                  text: 'บาท',
                  width: 'auto',
                  noWrap: true,
                  margin: [12.5, 5, 91, 0],
                  alignment: 'left',
                },
              ],
            })),
            {
              columns: [
                {
                  text: 'รวมยอดลูกหนี้ทั้งหมด',
                  bold: true,
                  margin: [120, 5, 0, 0],
                  fontSize: 13,
                  width: '*',
                },
                {
                  text: `${totalDebtor.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
                  bold: true,
                  margin: [15, 5, 0, 0],
                  fontSize: 13,
                  alignment: 'right',
                  width: '30%',
                },
                {
                  text: 'บาท',
                  style: 'form',
                  width: 'auto',
                  noWrap: true,
                  margin: [12.5, 5, 91, 0],
                  alignment: 'left',
                },
              ],
            },
            { text: '\n' },
          ]
        : []),


      // ลายเซ็น (เดิมไม่เปลี่ยน)
      { text: '\n' },
      { text: '\n' },
      {
        columns: [
          {
            stack: [
              { style: 'form', text: 'ลงชื่อ', margin: [20, 0, 0, 0], alignment: 'left' },
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
              { style: 'form', text: 'ผู้นำส่งเงิน', alignment: 'center', margin: [10, 0, 0, 0] },
              { text: currentDate, alignment: 'center', margin: [0, 0, 0, -15], fontSize: 13 },
              {
                style: 'form',
                text: 'ลงวันที่.......................................................',
                alignment: 'center',
              },
            ],
          },
          {
            stack: [
              { style: 'form', text: 'ลงชื่อ', margin: [0, 0, 225, 0], alignment: 'center' },
              {
                style: 'form',
                text: '(........................................................................)',
                alignment: 'center',
                margin: [0, 1, 0, 0],
              },
              { style: 'form', text: 'ผู้รับเงิน', alignment: 'center' },
              {
                style: 'form',
                text: 'ลงวันที่.......................................................',
                alignment: 'center',
                margin: [0, 3, 0, 0],
              },
            ],
          },
        ],
        widths: ['50%', '50%'],
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
    const foundReceipt = receipts.find((r) => r.projectCode === projectCode)

    if (!foundReceipt) {
      console.error('❌ Receipt not found for projectCode:', projectCode)
      loading.value = false
      return
    }

    console.log('✅ Found receipt:', foundReceipt.projectCode, foundReceipt.fullName)
    receiptData.value = foundReceipt

    // ✅ สร้าง rows จากข้อมูล receiptList
    if (receiptData.value?.receiptList?.length > 0) {
      rows.splice(0, rows.length)
      let rowNumber = 1

      receiptData.value.receiptList.forEach((item) => {
        const cleanAmount = item.amount ? parseFloat(item.amount.toString().replace(/,/g, '')) : 0

        rows.push({
          id: String(rowNumber++),
          ref: item.referenceNo || '',
          item: item.itemName || '',
          amount:
            cleanAmount > 0
              ? cleanAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
              : '',
          note: item.note || '',
        })
      })

      const total = receiptData.value.netTotalAmount || 0
      summary.text = convertNumberToThaiText(total)
      summary.total = total.toLocaleString('th-TH', { minimumFractionDigits: 2 })
    } else {
      // ถ้าไม่มีรายการ
      rows.push({
        id: '1',
        ref: '',
        item: 'ไม่มีรายการ',
        amount: '',
        note: '',
      })
      summary.text = 'ศูนย์บาทถ้วน'
      summary.total = '0.00'
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
