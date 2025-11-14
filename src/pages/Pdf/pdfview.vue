<template>
  <div>
    <button class="bg-black text-white m-1" @click="addRow">เพิ่มแถว</button>
    <button class="bg-black text-white m-1" @click="deleteRow">ลบแถว</button>

    <!-- ปุ่มแสดงตัวอย่าง PDF -->
    <button class="bg-blue-600 text-white m-1" @click="previewPdf">
      แสดงตัวอย่าง PDF
    </button>

    <!-- ปุ่มดาวน์โหลด PDF -->
    <button class="bg-green-600 text-white m-1" @click="downloadPdf">
      ดาวน์โหลด PDF
    </button>
    <br />
  </div>
</template>

<script setup>
import { reactive, defineProps } from 'vue'
import pdfMake from 'pdfmake/build/pdfmake'
import { vfs, fonts } from '../../assets/fonts.js'

pdfMake.vfs = vfs
pdfMake.fonts = fonts

// ถ้าต่อไปจะใช้ค่าจากหน้าก่อนหน้า ก็เอา props นี้ไปต่อได้เลย
const props = defineProps(    {
  ktb1Amount: Number,
  ktb2Amount: Number,
  ktb3Amount: Number,
  debtor1: Number,
  debtor2: Number,
  debtor3: Number,
  debtor4: Number,
  debtor5: Number,
  debtorTotal: Number,
  income1: Number,
  income2: Number,
  incomeTotal: Number,
  ktb1Checked: Boolean,
  ktb2Checked: Boolean,
  ktb3Checked: Boolean,
  debtorChecked: Boolean,
  incomeChecked: Boolean,
})

const rows = reactive([
  { id: '1', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '2', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '3', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '4', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '5', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '6', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '7', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '8', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '9', ref: '', item: '', amount: '', other: '', note: '' },
  { id: '10', ref: '', item: '', amount: '', other: '', note: '' },
])

const summary = reactive({
  text: 'ศูนย์บาทถ้วน',
  total: '-',
  note: '0',
})

function addRow() {
  rows.push({ id: '', ref: '', item: '', amount: '', other: '', note: '' })
}

function deleteRow() {
  if (rows.length > 0) {
    rows.pop()
  } else {
    alert('ไม่มีแถวให้ลบ')
  }
}

function deleteRowEmpty() {
  const filtered = rows.filter((row) => {
    return Object.values(row).some(
      (value) => value && value.toString().trim() !== ''
    )
  })
  rows.splice(0, rows.length, ...filtered)
}

function createCheckbox() {
  return {
    canvas: [{ type: 'rect', x: 0, y: 0, w: 15, h: 15, lineWidth: 1 }],
    width: 20,
  }
}

/** ✅ รวม logic สร้างเอกสาร PDF ไว้ฟังก์ชันเดียว ใช้ทั้ง preview + download */
function createDocDefinition() {
  deleteRowEmpty()

  return {
    pageSize: 'A4',
    pageMargins: [20, 30, 20, 0],
    defaultStyle: { font: 'THSarabun', fontSize: 13 },
    content: [
      {
        text: 'เลขที่นำส่ง ..................../..................',
        absolutePosition: { x: 0, y: 0 },
        margin: [0, 0, 0, 0],
        lineHeight: 1,
        alignment: 'right',
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
        text: 'วันที่............................................................................\n',
        absolutePosition: { x: 400, y: 50 },
        nowrmal: true,
      },
      {
        text: 'ข้าพเจ้า............................................................................เบอร์โทรติดต่อ.........................................................สังกัด..........................................................\n',
        margin: [35, 0, 0, 0],
      },
      {
        text: 'ใบนำส่งรายได้/เงินโครงการ.........................................................................................................................................................กองทุน..........................................................\n',
        margin: [-10, 0, 0, 0],
      },
      {
        text: 'รหัสโครงการ(กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ)............................................................. ',
        margin: [-10, 0, 0, 0],
      },
      {
        table: {
          widths: ['8%', '15%', '*', '12%', '3%', '20%'],
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
              { text: '\n' },
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
              { text: r.other ?? '', alignment: 'center' },
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
              { text: summary.note || '', alignment: 'center', bold: true },
              {
                text: summary.Emtpy || '',
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

      {
        columns: [
          { text: 'นำส่งเป็น', style: 'form', margin: [0, 0, 2, 0] },
          { ...createCheckbox(), margin: [-190, 0, 0, 0] },
          {
            style: 'form',
            text: `เงินสดจำนวน..................................บาท (........................................................................)`,
            margin: [-185, 0, 0, 0],
          },
        ],
        margin: [50, 5, 0, 0],
      },

      {
        columns: [
          { ...createCheckbox(), margin: [52.5, 3, 0, 0] },
          {
            style: 'form',
            text: `เช็คธนาคาร...............................................เลขที่เช็ค.............................................จำนวนเงิน..................................บาท`,
            margin: [57.5, 3, 0, 0],
          },
        ],
        margin: [50, 3, 0, 0],
      },

      {
        columns: [
          {
            style: 'form',
            text: `เช็คธนาคาร...............................................เลขที่เช็ค.............................................จำนวนเงิน..................................บาท`,
            margin: [77.5, 3, 0, 0],
          },
        ],
        margin: [50, 5, 0, 0],
      },

      {
        columns: [
          {
            style: 'form',
            text: `รวมยอดเงินตามเช็ค                              จำนวนเงิน..................................บาท `,
            margin: [170, 3, 0, 0],
          },
        ],
        margin: [50, 5, 0, 0],
      },

      {
        columns: [
          { ...createCheckbox(), margin: [52.5, 3, 0, 0] },
          {
            style: 'form',
            text: `นำฝากเข้าบัญชีธนาคาร..................................................เลขที่บัญชี..................................................`,
            margin: [57, 3, 0, 0],
          },
        ],
        margin: [50, 5, 0, 0],
      },

      {
        columns: [
          {
            style: 'form',
            text: `ชื่อบัญชี....................................................................................จำนวนเงิน.................................................บาท `,
            margin: [77.5, 3, 0, 0],
          },
        ],
        margin: [50, 5, 0, 0],
      },

      {
        columns: [
          { ...createCheckbox(), margin: [45, 3, 0, 0] },
          {
            style: 'form',
            text: `อื่นๆ ระบุ....................................................................................จำนวนเงิน.................................................บาท`,
            margin: [50, 3, 0, 0],
          },
        ],
        margin: [57.5, 5, 0, 0],
      },

      { text: '\n' },
      { text: '\n' },

      {
        columns: [
          {
            stack: [
              {
                style: 'form',
                text: 'ลงชื่อ',
                alignment: 'center',
                absolutePosition: { x: -520, y: 697 },
              },
              {
                style: 'form',
                text: '(........................................................................)',
                alignment: 'center',
                absolutePosition: { x: -300, y: 720 },
              },
              {
                style: 'form',
                text: 'ผู้นำส่งเงิน',
                alignment: 'center',
                absolutePosition: { x: -300, y: 740 },
              },
              {
                style: 'form',
                text: 'ลงวันที่.......................................................',
                alignment: 'center',
                absolutePosition: { x: -300, y: 770 },
              },
            ],
          },
          {
            stack: [
              {
                style: 'form',
                text: '\nลงชื่อ',
                alignment: 'center',
                absolutePosition: { x: 110, y: 680 },
              },
              {
                style: 'form',
                text: '(........................................................................)',
                alignment: 'center',
                absolutePosition: { x: 340, y: 720 },
              },
              {
                style: 'form',
                text: 'ผู้รับเงิน',
                alignment: 'center',
                absolutePosition: { x: 335, y: 740 },
              },
              {
                style: 'form',
                text: 'ลงวันที่.......................................................',
                alignment: 'center',
                absolutePosition: { x: 340, y: 770 },
              },
            ],
          },
        ],
      },

      {
        text: '***หมายเหตุ จัดทำแบบฟอร์มนี้ด้วยการพิมพ์เท่านั้น',
        alignment: 'center',
        absolutePosition: { x: -380, y: 820 },
        fontSize: 12,
      },
    ],
    styles: {
      form: { bold: true },
    },
  }
}

/** 🔍 แสดงตัวอย่าง PDF (เปิดในแท็บ/หน้าต่างใหม่) */
function previewPdf() {
  const docDefinition = createDocDefinition()
  pdfMake.createPdf(docDefinition).open()
}

/** ⬇ ดาวน์โหลด PDF */
function downloadPdf() {
  const docDefinition = createDocDefinition()
  pdfMake.createPdf(docDefinition).download('reportPDF.pdf')
}
</script>

<style scoped>
</style>
