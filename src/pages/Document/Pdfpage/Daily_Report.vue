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
const dailyData = ref({
  dateKey: '2026-01-18',
  items: [
    {
      waybillNumber: '6968/50',
      description: 'ลูกหนี้ทางทันตกรรม สิทธิ กรมบัญชีกลาง',
      debtorIncrease: 7540.0,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 7540.0,
    },
    {
      waybillNumber: '7006/08',
      description: 'ลูกหนี้ทันตกรรม สิทธิ สปสช.',
      debtorIncrease: 5811.25,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 5811.25,
    },
    {
      waybillNumber: '6972/21 ยกเลิก',
      description: 'ลูกหนี้ทันตกรรม สิทธิ ประกันสังคม',
      debtorIncrease: 900.0,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 900.0,
    },
    {
      waybillNumber: '6972/22',
      description: 'ลูกหนี้ทันตกรรม สิทธิ อื่นๆ',
      debtorIncrease: 1650.0,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 1650.0,
    },
    {
      waybillNumber: '6992/01-39',
      description: 'ลูกหนี้ทางการแพทย์ สิทธิ กรมบัญชีกลาง',
      debtorIncrease: 292334.0,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 292334.0,
    },
    {
      waybillNumber: '69106RV0300-0323',
      description: 'ลูกหนี้ทางการแพทย์ สิทธิ สปสช.',
      debtorIncrease: 30640.5,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 30640.5,
    },
    {
      waybillNumber: '6964/37',
      description: 'ลูกหนี้ทางการแพทย์ สิทธิ ประกันสังคม',
      debtorIncrease: 2460.0,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 2460.0,
    },
    {
      waybillNumber: '7004/12',
      description: 'ลูกหนี้ทางการแพทย์ รพ.มพ. อื่นๆ',
      debtorIncrease: 69123.75,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 69123.75,
    },
    {
      waybillNumber: '6965/23-24',
      description: 'ค่าบริการทางการแพทย์',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 80568.25,
      total: 80568.25,
    },
    {
      waybillNumber: 'PA-2569 2/61-74',
      description: 'ค่าธรรมเนียมธนาคาร',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: -58.37,
      total: -58.37,
    },    {
      waybillNumber: '6953/49-50',
      description: 'รับชำระลูกหนี้ทางการแพทย์',
      debtorIncrease: '',
      debtorDecrease: -55566.00,
      cash: '',
      transfer: 55566.00,
      total: '0',
    },    {
      waybillNumber: '7007/01',
      description: 'รายได้ค่าบริการทางการแพทย์',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 81061.67,
      total: 81061.67,
    },    {
      waybillNumber: '',
      description: 'เหมาจ่ายสิทธิประกันสังคม',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 607186.67,
      total: 607186.67,
    },
         {
      waybillNumber: '',
      description: 'รายได้ค่าบริการการศึกษา',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 280.00,
      total: 280.00,
    },
             {
      waybillNumber: '',
      description: 'รายได้เบ็ดเตล็ด (โอนเกินไม่ประสงค์ขอคืน)',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 5.00,
      total: 5.00,
    },
    {
      waybillNumber: '',
      description: 'ค่าลงทะเบียนอบรมหลักสูตรการวิจัยและพัฒนาทางสุขภาพ',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 54600.00,
      total: 54600.00,
    },
    {
      waybillNumber: '',
      description: 'ลูกหนี้ค่าไฟฟ้า',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 27632.00,
      total: 27632.00,
    },
        {
      waybillNumber: '',
      description: 'เจ้าหนี้รอต่าย-ค่าไฟฟ้า',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 29632.00,
      total: 29632.00,
    },
        {
      waybillNumber: '',
      description: 'เงินรับฝาก-โครงการวิจัยและบริการวิชาการ',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 35150.00,
      total: 35150.00,
    },
        {
      waybillNumber: '',
      description: 'เงินรับฝาก-สถาบันนวัตกรรมการเรียนรู้ มหาวิทยาลัยพะเยา',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 100000,
      total: 100000,
    },
    {
      waybillNumber: '',
      description: 'รายได้รอการรับรู้-เงินบริจาค',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 1000000.00,
      total: 1000000.00,
    },
      {
      waybillNumber: '',
      description: 'รายกได้จากการจัดประชุมวิชาการ',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 2500.00,
      total: 2500.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้ค่าเช่าบ้าน / สถานที่',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 2000.00,
      total: 2000.00,
    },
        {
      waybillNumber: '',
      description: 'ค่าบำรุงรรักษารถบัสปรับอากาศ',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 1200.00,
      total: 1200.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้ค่าน้ำประปา',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 406.00,
      total: 406.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้เบ็ดเตล็ด',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 364.50,
      total: 364.50,
    },
        {
      waybillNumber: '',
      description: 'รายได้คืนลูกหนี้เงินยืม',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: 163.00,
      transfer: 16835.00,
      total: 16998.00,
    },
        {
      waybillNumber: '',
      description: 'ค่าบริการทางทันตกรรม',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 24790.00,
      total: 24790.00,
    },
      {
      waybillNumber: '',
      description: 'รายได้ค่าธรรมเนียมการศึกษา กยศ 1/68',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 15000.00,
      total: 15000.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้ค่าซักผ้าหยอดเหรียญ',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 2820.00,
      total: 2820.00,
    },
        {
      waybillNumber: '',
      description: 'เงินรับฝาก*สถานปฏิบัติการเภสัชกรรมชุมชน',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 240.00,
      total: 240.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้จากการขายสินค้า (สปสช.)',
      debtorIncrease: 360.00,
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: 360.00,
    },
        {
      waybillNumber: '',
      description: 'รับโอนจากการใช้สิทธิบัตรทอง (สปสช.)',
      debtorIncrease: '',
      debtorDecrease: 1440.00,
      cash: '',
      transfer: '',
      total: 1440.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้ค่าธรรมเนียมการศึกษา',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: 24000.00,
      transfer: 57000.00,
      total: 81000.00,
    },
        {
      waybillNumber: '',
      description: 'เงินรับฝาก-ค่าธรรเนียมหอพัก',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: 18800.00,
      transfer: 18800.00,
      total: 37600.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้ค่าธรรมเนียมอื่นๆ',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: 25.00,
      transfer: 3775.00,
      total: 3800.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้จากการขายสินค้า',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 3553.00,
      total: 3553.00,
    },
        {
      waybillNumber: '',
      description: 'รายได้จากการขายสินค้าระหว่างกัน',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 1720.00,
      total: 1720.00,
    },
        {
      waybillNumber: '',
      description: 'เงินรับฝากสินค้าฝากขาย',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 3650.00,
      total: 3650.00,
    },
        {
      waybillNumber: '',
      description: 'ส่วนแบ่งรายได้จากการรับฝากขาย',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: 80.00,
      total: 80.00,
    },
        {
      waybillNumber: '',
      description: 'เงินรับฝากค่าไปรษณีย์',
      debtorIncrease: '',
      debtorDecrease: '',
      cash: '',
      transfer: '',
      total: '0',
    },
  ],
  totals: {
    debtorIncrease: 377819.50,
    debtorDecrease: -57006.00,
    cash: 42988.00,
    transfer: 2228019.02,
    grandTotal: 2591820.52,
  },
})

const loading = ref(true)

const formatCurrency = (num) => {
  if (num === '' || num === null || num === undefined) return ''
  return Number(num).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
}


const formatThaiDate = (dateKey) => {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function createDocDefinition() {
  const data = dailyData.value

  // สร้าง header ของตาราง
  const tableHeaders = [
    // ===== แถวที่ 1 =====
    [
      {
        text: '\n' + 'เลขที่ใบเสร็จรับเงิน',
        rowSpan: 3,
        alignment: 'center',
        style: 'tableHeader',
        margin: [0, 10, 0, 0],
      },
      {
        text: '\n' + 'รายการ',
        rowSpan: 3,
        alignment: 'center',
        style: 'tableHeader',
        margin: [0, 10, 0, 0],
      },
      { text: 'รับชำระโดย', colSpan: 5, alignment: 'center', style: 'tableHeader' },
      {},
      {},
      {},
      {},
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
    ],
  ]

  // สร้างแถวข้อมูล
  const tableRows = data.items.map((item) => [
    { text: item.waybillNumber || item.projectCode || '', alignment: 'center', fontSize: 12 },
    { text: item.description || item.fullName || '', alignment: 'left', fontSize: 12 },

    // ✅ ใช้ค่าที่ถูกต้อง
    { text: formatCurrency(item.debtorIncrease), alignment: 'right', fontSize: 12 },
    { text: formatCurrency(item.debtorDecrease), alignment: 'right', fontSize: 12 },
    { text: formatCurrency(item.cash), alignment: 'right', fontSize: 12 },
    { text: formatCurrency(item.transfer), alignment: 'right', fontSize: 12 },
    { text: formatCurrency(item.total), alignment: 'right', fontSize: 12, bold: true },
  ])

  const totalRow = [
    { text: '', colSpan: 2, alignment: 'center', bold: true, fontSize: 12 },
    {},
    {
      text: formatCurrency(data.totals.debtorIncrease),
      alignment: 'right',
      bold: true,
      fontSize: 12,
    },
    {
      text: formatCurrency(data.totals.debtorDecrease),
      alignment: 'right',
      bold: true,
      fontSize: 12,
    },
    { text: formatCurrency(data.totals.cash), alignment: 'right', bold: true, fontSize: 12 },
    { text: formatCurrency(data.totals.transfer), alignment: 'right', bold: true, fontSize: 12 },
    { text: formatCurrency(data.totals.grandTotal), alignment: 'right', bold: true, fontSize: 13 },
  ]

  return {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [30, 60, 30, 80],
    defaultStyle: { font: 'THSarabun', fontSize: 10 },

    header: (currentPage, pageCount) => ({
      columns: [
        {
          text: 'มหาวิทยาลัยพะเยา\nรายงานการรับเงิน',
          alignment: 'center',
          fontSize: 12,
          bold: true,
          margin: [0, 15, 0, 0],
        },
      ],
    }),

    content: [
      {
        text: `วันที่ ${formatThaiDate(data.dateKey)}`,
        alignment: 'right',
        fontSize: 12,
        bold: true,
        margin: [0, 0, 80, 0],
      },

      {
        margin: [70, 0, 0, 0],
        fontSize: 10,
        table: {
          headerRows: 3,
          widths: [
            '12%', // เลขที่ใบเสร็จ
            '28%', // รายการ
            '8%', // ลูกหนี้ เพิ่ม
            '8%', // ลูกหนี้ ลด
            '10%', // เงินสด
            '14%', // เงินโอน
            '15%', // รวม
          ],
          body: [...tableHeaders, ...tableRows, totalRow],
        },
        layout: {
          hLineWidth: (i, node) => 0.5,
          vLineWidth: (i, node) => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },

      // ขึ้นหน้าใหม่สำหรับตารางที่ 2
      {
        text: '',
        pageBreak: 'after',
      },

      {
        text: `วันที่ ${formatThaiDate(data.dateKey)}`,
        alignment: 'right',
        fontSize: 10,
        bold: true,
        margin: [0, 0, 220, 0],
      },

      // ตารางสรุปยอดเงินด้านล่าง (ตารางว่าง)
      {
        margin: [200, 0, 200, -30],
        fontSize: 12,
        table: {
          widths: ['*', '25%'],
          body: [
            [
              { text: 'รายการรับชำระ', bold: true, alignment: 'center', fillColor: '#f0f0f0' },
              { text: 'จำนวนเงิน', bold: true, alignment: 'center', fillColor: '#f0f0f0' },
            ],
            [
              { text: 'ยอดยกมา:', alignment: 'left' },
              { text: '', alignment: 'right' },
            ],
            [
              { text: 'เงินสด', alignment: 'left' },
              { text: '0.00', alignment: 'right' },
            ],
            [
              { text: 'เช็ค', alignment: 'left', bold: true },
              { text: '0.00', alignment: 'right', bold: true },
            ],
            [
              { text: 'ลูกหนี้ทางทันตกรรม สิทธิ กรมบัญชีกลาง', alignment: 'left' },
              { text: '298798.00', alignment: 'right' },
            ],
            [
              { text: 'ลูกหนี้ทางทันตกรรม สิทธิ สปสช.', alignment: 'left' },
              { text: '2194966.25', alignment: 'right' },
            ],
                        [
              { text: 'ลูกหนี้ทางทันตกรรม สิทธิ ประกันสังคม', alignment: 'left' },
              { text: '12310.00', alignment: 'right' },
            ],
                        [
              { text: 'ลูกหนี้ทางทันตกรรม สิทธิ อื่นๆ', alignment: 'left' },
              { text: '122825.50', alignment: 'right' },
            ],
                        [
              { text: 'ลูกหนี้ทางการแพทย์ รพ.มพ. กรมบัญชีกลาง', alignment: 'left' },
              { text: '30335569.22', alignment: 'right' },
            ],
                        [
              { text: 'ลูกหนี้ทางการแพทย์ รพ.มพ. สิทธิ สปสช.', alignment: 'left' },
              { text: '19822748.05', alignment: 'right' },
            ],
                        [
              { text: 'ลูกหนี้ทางการแพทย์ รพ.มพ. สิทธิ ประกันสังคม', alignment: 'left' },
              { text: '4195954.81', alignment: 'right' },
            ],
                        [
              { text: 'ลูกหนี้ทางการแพทย์ รพ.มพ. อื่นๆ', alignment: 'left' },
              { text: '16155978.34', alignment: 'right' },
            ],
                        [
              { text: 'ลูกหนี้-รายได้จากการใช้สิธิบัตรทอง (สปสช.)', alignment: 'left' },
              { text: '137293.25', alignment: 'right' },
            ],
                        [
              { text: 'รับวันนี้ :', alignment: 'left' },
              { text: '', alignment: 'right' },
            ],
                        [
              { text: 'เงินสด', alignment: 'left' },
              { text: '42988.00', alignment: 'right' },
            ],
                        [
              { text: 'ลูกหนี้ (เพิ่ม)', alignment: 'left' },
              { text: '377819.50', alignment: 'right' },
            ],
                                    [
              { text: 'ลูกหนี้ (ลด)', alignment: 'left' },
              { text: '-57006.00', alignment: 'right' },
            ],
                                    [
              { text: 'เช็ครับ..1..ฉบับ เป็นเงิน', alignment: 'left' },
              { text: '0.00', alignment: 'right' },
            ],
                                    [
              { text: 'เงินโอนระหว่างธนาคาร', alignment: 'left' },
              { text: '2228019.02', alignment: 'right' },
            ],
                                    [
              { text: 'รวม', alignment: 'left' },
              { text: '75868263.94', alignment: 'right' },
            ],
                                    [
              { text: 'นำฝากเข้าธนาคาร :', alignment: 'left' },
              { text: '', alignment: 'right' },
            ],
                                    [
              { text: 'ธนาคารไทยพาณิชย์', alignment: 'left' },
              { text: '1063150.00', alignment: 'right' },
            ],
                                    [
              { text: 'ธนาคารอิสลาม', alignment: 'left' },
              { text: '0.00', alignment: 'right' },
            ],
                                    [
              { text: 'ธนาคารกรุงไทย', alignment: 'left' },
              { text: '1207857.02', alignment: 'right' },
            ],
                                    [
              { text: 'ธนาคารทหารไทย', alignment: 'left' },
              { text: '', alignment: 'right' },
            ],
                                    [
              { text: 'รวม', alignment: 'left' },
              { text: '2271007.02', alignment: 'right' },
            ],
                                                [
              { text: 'เก็บรักษาไว้จ่ายประจำวัน:', alignment: 'left' },
              { text: '', alignment: 'right' },
            ],
                                                [
              { text: 'เงินสด', alignment: 'left' },
              { text: '2271007.02', alignment: 'right' },
            ],
                                                [
              { text: 'เช็ค ฉบับ', alignment: 'left' },
              { text: '2271007.02', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ทางทันตกรรม สิทธิ กรมบัญชีกลาง', alignment: 'left' },
              { text: '306338.00', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ทางทันตกรรม สิทธิ สปสช.', alignment: 'left' },
              { text: '2200777.50', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ทางทันตกรรม สิทธิ ประกันสังคม', alignment: 'left' },
              { text: '13210.00', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ทางทันตกรรม สิทธิ อื่นๆ', alignment: 'left' },
              { text: '124475.50', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ทางการแพทย์ รพ.มพ. กรมบัญชีกลาง', alignment: 'left' },
              { text: '30627903.22', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ทางการแพทย์ รพ.มพ. สิทธิ สปสช.', alignment: 'left' },
              { text: '19853388.55', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ทางการแพทย์ รพ.มพ. สิทธิ ประกันสังคม', alignment: 'left' },
              { text: '4142848.81', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ทางการแพทย์ รพ.มพ. อื่นๆ', alignment: 'left' },
              { text: '16192102.09', alignment: 'right' },
            ],
                                                [
              { text: 'ลูกหนี้ - รายได้จากการใช้สิทธิบัตรทอง (สปสช.)', alignment: 'left' },
              { text: '136213.25', alignment: 'right' },
            ],

          ],
        },
        layout: {
          hLineWidth: (i, node) => 0.5,
          vLineWidth: (i, node) => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },

      // ลายเซ็นต่อท้ายตารางที่ 2
      {
        text: '\n\n',
        margin: [0, 20, 0, 0],
      },
      {
        columns: [
          {
            stack: [
              {
                text: 'ลงชื่อ.................................................ผู้จัดทำ',
                alignment: 'center',
              },
              {
                text: '       (................................................)',
                alignment: 'center',
              },
              {
                text: 'วันที่.......................................................',
                alignment: 'center',
              },
            ],
            width: '33%',
            margin: [40, 0, 0, 0],
          },
          {
            stack: [
              {
                text: 'ลงชื่อ.................................................ผู้ตรวจสอบ',
                alignment: 'center',
              },
              {
                text: '       (................................................)',
                alignment: 'center',
              },
              {
                text: 'วันที่.......................................................',
                alignment: 'center',
              },
            ],
            width: '33%',
          },
          {
            stack: [
              {
                text: 'ลงชื่อ.................................................ผู้อนุมัติ',
                alignment: 'center',
              },
              {
                text: '       (................................................)',
                alignment: 'center',
              },
              {
                text: 'วันที่.......................................................',
                alignment: 'center',
              },
            ],
            width: '33%',
            margin: [0, 0, 40, 0],
          },
        ],
      },
    ],

    footer: (currentPage, pageCount) => {
      // ไม่แสดง footer เลย (ย้ายไปแสดงในเนื้อหาแล้ว)
      return {}
    },

    styles: {
      tableHeader: {
        bold: true,
        fontSize: 13,
        fillColor: '#f0f0f0',
      },
    },
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

  receipts.forEach((receipt) => {
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
    const receiptTransfer =
      (pm.krungthai1?.checked ? parseAmount(pm.krungthai1.amount) : 0) +
      (pm.krungthai2?.checked ? parseAmount(pm.krungthai2.amount) : 0) +
      (pm.krungthai3?.checked ? parseAmount(pm.krungthai3.amount) : 0)

    const receiptDeposit = pm.other?.checked ? parseAmount(pm.other.amount) : 0
    const receiptGrandTotal = receiptCash + receiptCheck + receiptTransfer + receiptDeposit

    console.log('💰 Receipt payment breakdown:', {
      waybillNumber: receipt.waybillNumber,
      cash: receiptCash,
      check: receiptCheck,
      transfer: receiptTransfer,
      deposit: receiptDeposit,
      total: receiptGrandTotal,
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
          waybillNumber: receipt.waybillNumber,
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
          total: itemAmount,
        })

        console.log('📝 Item added:', {
          item: item.itemName,
          cash: itemCash,
          transfer: itemTransfer,
          debtor: isDebtorIncrease ? itemAmount : 0,
          total: itemAmount,
        })
      })
    } else {
      items.push({
        waybillNumber: receipt.waybillNumber,
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
        total: receiptGrandTotal,
      })
    }
  })

  // ✅ คำนวณยอดรวมทั้งหมด
  items.forEach((item) => {
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
    grandTotal,
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
      grandTotal,
    },
  }
}

onMounted(() => {
  previewPdf()
  loading.value = false
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
