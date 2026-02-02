  //pdfpage/index.vue
  <template>
    <div>
      <div v-if="loading" class="flex justify-center items-center h-96">
        <div class="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>

      <div v-else-if="!receiptData" class="flex justify-center items-center h-96">
        <div class="text-lg text-red-600">ไม่พบข้อมูล</div>
      </div>

      <div v-else class="flex justify-center items-center ">
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
    const isDebtor = isReceivableItem(row.item)

    if (isDebtor && row.amount) {
      const amount =
        typeof row.amount === 'string'
          ? parseFloat(row.amount.replace(/,/g, ''))
          : Number(row.amount)

      // ✅ เพิ่มเงื่อนไข: เฉพาะเงินบวกเท่านั้น และไม่ถูกยกเลิก
      if (amount > 0) {
        // ✅ หารายการต้นฉบับจาก receiptData เพื่อเช็คสถานะการยกเลิก
        const originalItem = receiptData.value?.receiptList?.find(
          item => item.itemName === row.item && 
                 parseFloat(item.amount.toString().replace(/,/g, '')) === amount
        )

        // ✅ ถ้ารายการไม่ถูกยกเลิก ให้เพิ่มเข้าไป
        if (!originalItem || (originalItem.status !== 'cancelled' && originalItem.isCancelled !== true)) {
          debtors.push({
            itemName: row.item,
            amount: amount,
            formattedAmount: amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
          })

          totalDebtor += amount
        } else {
          console.log(`  🚫 Debtor item cancelled (skip): ${row.item}`)
        }
      }
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

function calculatePaymentTypeTotals() {
  const totals = {
    cash: 0,
    check: 0,
    transfer: 0,
    negative: 0,
    cashCount: 0,
    checkCount: 0,
    transferCount: 0,
    negativeCount: 0,
    checkDetails: [],
    transferDetails: [],
    negativeDetails: []
  }

  if (!receiptData.value?.receiptList) return totals

  receiptData.value.receiptList.forEach((item) => {
    // ✅ ตรวจสอบสถานะการยกเลิก - ถ้ายกเลิกแล้วให้ข้ามไป
    if (item.status === 'cancelled' || item.isCancelled === true) {
      console.log(`  🚫 Cancelled item (skip): ${item.itemName}`)
      return // ข้ามรายการที่ยกเลิก
    }

    const cleanAmount = item.amount ? parseFloat(item.amount.toString().replace(/,/g, '')) : 0
    
    // ✅ ตรวจสอบว่าเป็นค่าธรรมเนียมหรือไม่ (จากชื่อรายการ)
    const isFeeItem = item.itemName && (
      item.itemName.includes('ค่าธรรมเนียม') || 
      item.itemName.includes('ส่วนลด') ||
      item.itemName.includes('หัก')
    )
    
    // ✅ จัดการเงินลบ หรือ รายการที่เป็นค่าธรรมเนียม
    if (cleanAmount < 0 || (isFeeItem && cleanAmount > 0)) {
      const feeAmount = isFeeItem && cleanAmount > 0 ? -cleanAmount : cleanAmount
      
      totals.negative += feeAmount
      totals.negativeCount++
      totals.negativeDetails.push({
        itemName: item.itemName,
        amount: feeAmount,
        note: item.note || '',
        referenceNo: item.referenceNo || ''
      })
      
      console.log(`  ✅ Detected fee item: ${item.itemName} = ${feeAmount}`)
      return
    }
    
    // ตรวจสอบว่าเป็นลูกหนี้หรือไม่
    const isDebtor = isReceivableItem(item.itemName)
    
    // ✅ ถ้าเป็นลูกหนี้ ไม่ต้องนับใน payment types
    if (isDebtor) {
      console.log(`  ℹ️ Debtor item (skip payment): ${item.itemName}`)
      return
    }
    
    // ✅ จัดการเงินบวกตามปกติ (ไม่ใช่ลูกหนี้ และไม่ใช่ค่าธรรมเนียม)
    if (cleanAmount > 0 && item.paymentTypes) {
      // เงินสด
      if (item.paymentTypes.cash) {
        totals.cash += cleanAmount
        totals.cashCount++
        console.log(`  💵 Cash: ${cleanAmount}`)
      }
      
      // เช็ค
      if (item.paymentTypes.check) {
        totals.check += cleanAmount
        totals.checkCount++
        
        if (item.checkDetails && item.checkDetails.bankName) {
          totals.checkDetails.push({
            bankName: item.checkDetails.bankName,
            checkNumber: item.checkDetails.checkNumber,
            numInCheck: item.checkDetails.numInCheck,
            amount: cleanAmount
          })
        }
        console.log(`  📝 Check: ${cleanAmount}`)
      }
      
      // เงินโอน
      if (item.paymentTypes.transfer) {
        totals.transfer += cleanAmount
        totals.transferCount++
        
        if (item.transferDetails?.accountData?.accountNumber) {
          const account = item.transferDetails.accountData
          const existingIndex = totals.transferDetails.findIndex(
            t => t.accountNumber === account.accountNumber
          )
          
          if (existingIndex >= 0) {
            totals.transferDetails[existingIndex].amount += cleanAmount
          } else {
            totals.transferDetails.push({
              accountNumber: account.accountNumber,
              bankName: account.bankName,
              accountName: account.accountName,
              amount: cleanAmount
            })
          }
        }
        console.log(`  🏦 Transfer: ${cleanAmount}`)
      }
    }
  })

  console.log('💰 Payment Totals Calculated:', totals)
  return totals
}

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
  });

  function createDocDefinition() {
    deleteRowEmpty()

    const receipt = receiptData.value || {}
    const paymentTotals = calculatePaymentTypeTotals()
    const { debtors, totalDebtor, hasDebtor } = separateDebtorItems()

    const isApproved = receipt.approvalStatus === 'approved'
    const approverName = receipt.approverName || 'เจ้าหน้าที่การเงิน'
    const approvalDate = receipt.approvedAt
      ? new Date(receipt.approvedAt).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : currentDate

    // ✅ คำนวณยอดรวมรายการนำส่ง (เงินโอน + เงินสด + เช็ค + เงินลบ) ไม่รวมลูกหนี้
    const deliveryTotal = paymentTotals.transfer + paymentTotals.cash + paymentTotals.check + paymentTotals.negative

    return {
      pageSize: 'A4',
      pageMargins: [20, 30, 20, 0],
      defaultStyle: { font: 'THSarabun', fontSize: 13 },
      content: [
        // ========== ส่วนหัวเอกสาร ==========
        {
          stack: [
            {
              text: `${receipt.waybillNumber || ''}`,
              absolutePosition: { x: 530, y: 13 },
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
              text: `${receipt.projectCode || '- '}`,
              absolutePosition: { x: 240, y: 115 },
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

        // ========== ส่วนรายละเอียดการชำระเงิน ==========

  // ✅ เงินโอน - ห้ามแยกข้ามหน้า (แต่ละบัญชีเป็นกลุ่มเดียวกัน)
  ...(paymentTotals.transferDetails.length > 0
    ? paymentTotals.transferDetails.map((transfer) => ({
        unbreakable: true, // ✅ ห้ามแยกข้ามหน้า
        stack: [
          {
            columns: [
              { ...createCheckbox(), margin: [100, 12, 0, 0] },
              {
                text: `นำฝากบัญชี ${transfer.bankName} เลขที่ ${transfer.accountNumber}`,
                margin: [110, 10, 0, 0],
              },
            ],
          },
          {
            columns: [
              {
                text: `ชื่อบัญชี ${transfer.accountName}`,
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
                text: transfer.amount.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                }),
                width: 80,
                margin: [155, 0, 0, 0],
                noWrap: true,
              },
              {
                text: 'บาท',
                width: 30,
                noWrap: true,
                margin: [120, 0, 0, 0],
              },
            ],
          },
        ]
      }))
    : []),

  // ✅ เงินสด - ห้ามแยกข้ามหน้า
  ...(paymentTotals.cash > 0
    ? [{
        unbreakable: true, // ✅ ห้ามแยกข้ามหน้า
        stack: [
          {
            columns: [
              {
                columns: [
                  { ...createCheckbox(), margin: [100, 7, 0, 0] },
                  {
                    text: 'เงินสด',
                    style: 'form',
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
                    stack: [
                      {
                        text: paymentTotals.cash.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
                        alignment: 'center',
                        lineHeight: 1.2,
                      },
                    ],
                    width: 80,
                    margin: [0, 5, 9.5, 0],
                  },
                  {
                    text: 'บาท',
                    width: 'auto',
                    noWrap: true,
                    margin: [-16, 5, 0, 0],
                  },
                ],
              },
            ],
          },
        ]
      }]
    : []),

  // ✅ เช็ค - ห้ามแยกข้ามหน้า (แต่ละใบเช็คเป็นกลุ่มเดียวกัน)
  ...(paymentTotals.checkDetails.length > 0
    ? paymentTotals.checkDetails.map((check) => ({
        unbreakable: true, // ✅ ห้ามแยกข้ามหน้า
        stack: [
          {
            columns: [
              { ...createCheckbox(), margin: [100, 7, 0, 0] },
              {
                text: 'เช็ค',
                style: 'form',
                width: 'auto',
                noWrap: true,
                margin: [110, 5, 0, 0],
              },
              {
                text: `ธนาคาร${check.bankName || ''}`,
                style: 'form',
                margin: [5, 5, 0, 0],
              },
            ],
          },
          {
            columns: [
              {
                text: [
                  check.checkNumber ? `เลขที่เช็ค ${check.checkNumber}   ` : '',
                  check.numInCheck ? `เลขที่ในเช็ค ${check.numInCheck}` : '',
                ].join(''),
                style: 'form',
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
                    text: check.amount.toLocaleString('th-TH', {
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
            margin: [130, 0, 92.5, 0],
          },
        ]
      }))
    : []),

  // ✅ รายการเงินลบ (ค่าธรรมเนียม) - แสดงก่อนยอดรวม - ห้ามแยกข้ามหน้า
  ...(paymentTotals.negativeDetails.length > 0
    ? [{
        unbreakable: true, // ✅ ห้ามแยกข้ามหน้า
        stack: [
          { text: '\n' },
          ...paymentTotals.negativeDetails.map((neg) => ({
            columns: [
              {
                text: neg.itemName,
                margin: [120, -10, 0, 0],
                fontSize: 13,
                width: '*',
              },
              {
                text: 'จำนวน',
                width: 'auto',
                margin: [0, -10, -119.5, 0],
                noWrap: true,
                alignment: 'right',
              },
              {
                text: `${neg.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
                margin: [0, -10, 0, 0],
                fontSize: 13,
                alignment: 'right',
                width: '30%',
              },
              {
                text: 'บาท',
                width: 'auto',
                noWrap: true,
                margin: [15.8, -10, 92, 0],
                alignment: 'left',
              },
            ],
          })),
        ]
      }]
    : []),

  // ✅ แสดงยอดรวมรายการนำส่ง - ห้ามแยกข้ามหน้า
  ...(deliveryTotal !== 0
    ? [{
        unbreakable: true, // ✅ ห้ามแยกข้ามหน้า
        stack: [
          { text: '\n' },
          {
            columns: [
              {
                text: 'ยอดรวมรายการนำส่ง',
                bold: true,
                fontSize: 13,
                margin: [120, -10, 0, 0],
                width: '*',
              },
              {
                text: `${deliveryTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
                bold: true,
                fontSize: 13,
                margin: [50, -10, -2.5, 0],
                alignment: 'right',
                width: '30%',
                noWrap:true,
              },
              {
                text: 'บาท',
                bold: true,
                fontSize: 13,
                width: 'auto',
                noWrap: true,
                margin: [15, -10, 89, 0],
                alignment: 'left',
              },
            ],
          },
          { text: '\n' },
        ]
      }]
    : []),

  // ✅ ลูกหนี้ทั้งหมด - ห้ามแยกข้ามหน้า
  ...(hasDebtor
    ? [{
        unbreakable: true, // ✅ ห้ามแยกข้ามหน้า - ทั้งส่วนลูกหนี้จะไปด้วยกัน
        stack: [
          { text: '\n' },
          {
            columns: [
              { ...createCheckbox(), margin: [100, 2, 0, 0] },
              {
                text: 'ลูกหนี้',
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
                margin: [15.8, 2, 92, 0],
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
                margin: [15, 5, 92, 0],
                alignment: 'left',
              },
            ],
          },
          { text: '\n' },
        ]
      }]
    : []),

        // ========== ลายเซ็น ==========
        {
          unbreakable: true,
          stack: [
            { text: '\n' },
            { text: '\n' },
            {
              columns: [
                {
                  stack: [
                    {
                      style: 'form',
                      text: 'ลงชื่อ',
                      margin: [40, 0, 0, 0],
                      alignment: 'left',
                    },
                    {
                      text: receipt.fullName || '',
                      alignment: 'center',
                      margin: [40, 0, 0, -15],
                      fontSize: 13,
                    },
                    {
                      style: 'form',
                      text: '(........................................................................)',
                      alignment: 'center',
                      margin: [40, 0, 0,0],
                    },
                    {
                      style: 'form',
                      text: 'ผู้นำส่งเงิน',
                      alignment: 'center',
                      margin: [40, 0, 0, 0],
                    },
                    {
                      text: currentDate,
                      alignment: 'center',
                      margin: [40, 0, 0, -15],
                      fontSize: 13,
                    },
                    {
                      style: 'form',
                      text: 'ลงวันที่.......................................................',
                      alignment: 'center',
                      margin: [40, 0, 0, 0],
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
                    ...(isApproved
                      ? [
                          {
                            text: approverName,
                            alignment: 'center',
                            margin: [0, 0, 0, -15],
                            fontSize: 13,
                          },
                        ]
                      : []),
                    {
                      style: 'form',
                      text: '(........................................................................)',
                      alignment: 'center',
                      margin: [0, 0, 0, 0],
                    },
                    {
                      style: 'form',
                      text: 'ผู้รับเงิน',
                      alignment: 'center',
                    },
                    ...(isApproved
                      ? [
                          {
                            text: approvalDate,
                            alignment: 'center',
                            margin: [0, 0, 0, -15],
                            fontSize: 13,
                          },
                        ]
                      : []),
                    {
                      style: 'form',
                      text: 'ลงวันที่.......................................................',
                      alignment: 'center',
                      margin: [0, 0, 0, 0],
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
        },
      ],
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
      const waybillNumber = route.params.id
      console.log('🔍 Loading receipt with waybillNumber:', waybillNumber)

      const receipts = loadReceipts()
      console.log('📦 Total receipts:', receipts.length)
      const foundReceipt = receipts.find((r) => r.waybillNumber === waybillNumber)

      if (!foundReceipt) {
        console.error('❌ Receipt not found for waybillNumber:', waybillNumber)
        loading.value = false
        return
      }

      console.log('✅ Found receipt:', foundReceipt)
      receiptData.value = foundReceipt

      // ✅ Debug แต่ละรายการ
      console.log('📋 Receipt items:')
      receiptData.value.receiptList?.forEach((item, idx) => {
        const amt = parseFloat(item.amount.toString().replace(/,/g, ''))
        console.log(`  [${idx}] ${item.itemName}: ${amt} (${amt < 0 ? 'NEGATIVE' : 'POSITIVE'})`)
        console.log(`      paymentTypes:`, item.paymentTypes)
      })

      if (receiptData.value?.receiptList?.length > 0) {
        rows.splice(0, rows.length)
        let rowNumber = 1

        receiptData.value.receiptList.forEach((item) => {
          const cleanAmount = item.amount ? parseFloat(item.amount.toString().replace(/,/g, '')) : 0
          const isDebtor = isReceivableItem(item.itemName)
          
          rows.push({
            id: String(rowNumber++),
            ref: item.referenceNo || '',
            item: item.itemName || '',
            amount:
              cleanAmount !== 0
                ? cleanAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                : '',
            note: isDebtor ? 'ลูกหนี้' : (item.note || ''),
          })
        })

        const total = receiptData.value.netTotalAmount || 0
        summary.text = convertNumberToThaiText(total)
        summary.total = total.toLocaleString('th-TH', { minimumFractionDigits: 2 })
      } else {
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

      // ✅ ตรวจสอบการคำนวณ
      const paymentTotals = calculatePaymentTypeTotals()
      console.log('💰 Final Payment Totals:')
      console.log('  Transfer:', paymentTotals.transfer)
      console.log('  Cash:', paymentTotals.cash)
      console.log('  Check:', paymentTotals.check)
      console.log('  Negative:', paymentTotals.negative)
      console.log('  Negative Details:', paymentTotals.negativeDetails)

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