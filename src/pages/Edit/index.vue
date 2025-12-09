<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <div class="max-w-6xl mx-auto p-4 sm:p-6 pt-5">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-10 space-y-8">
        <!-- Header Section -->
        <div class="text-center space-y-2 pb-4 border-b border-gray-200">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-800">แก้ไขใบนำส่งเงิน</h1>
          <p v-if="!loading" class="text-sm text-gray-600">
            รหัสโครงการ: <span class="font-semibold text-purple-600">{{ projectCode }}</span>
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>

        <!-- Form Section -->
        <div v-else class="max-w-5xl mx-auto space-y-8">
          <!-- ข้อมูลผู้บันทึก -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
              ข้อมูลผู้บันทึก
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  ข้าพเจ้า <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.fullName"
                  placeholder="กรอกชื่อ-นามสกุล"
                  class="transition-all duration-200"
                />
                <span v-if="errors.fullName" class="text-red-600 text-xs">
                  {{ errors.fullName }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  เบอร์โทรติดต่อ <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.phone"
                  placeholder="xxx-xxxx-xxx"
                  class="transition-all duration-200"
                  @keypress="allowOnlyDigits"
                />
                <span v-if="errors.phone" class="text-red-600 text-xs">
                  {{ errors.phone }}
                </span>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">
                  หน่วยงาน <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="mainCategory"
                  class="h-[44px] w-full rounded-md border border-gray-500 px-2 text-sm"
                >
                  <option value="">-- เลือกหน่วยงาน --</option>
                  <option v-for="(sub, key) in options" :key="key" :value="key">
                    {{ key }}
                  </option>
                </select>
                <span v-if="errors.mainCategory" class="text-red-600 text-xs">
                  {{ errors.mainCategory }}
                </span>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">
                  หน่วยงานย่อย <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="subCategory"
                  class="h-[44px] w-full rounded-md border border-gray-500 px-2 text-sm disabled:bg-gray-200 disabled:text-gray-400"
                  :disabled="!mainCategory"
                >
                  <option value="">-- เลือกหัวข้อย่อย --</option>
                  <option v-for="item in subOptions" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
                <span v-if="errors.subCategory" class="text-red-600 text-xs">
                  {{ errors.subCategory }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  กองทุน <span class="text-red-500">*</span>
                </label>
                <Selects
                  v-model="formData.fundName"
                  :options="['กองทุนทั่วไป', 'กองทุนพิเศษ']"
                  placeholder="เลือกกองทุน"
                  value-type="string"
                />
                <span v-if="errors.fundName" class="text-red-600 text-xs">
                  {{ errors.fundName }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  ขอนำส่งเงิน <span class="text-red-500">*</span>
                </label>
                <select
                  id="sendmoney"
                  v-model="formData.sendmoney"
                  class="h-[44px] w-full rounded-md border border-gray-500 px-2 text-sm"
                >
                  <option value="">-- เลือก --</option>
                  <option value="รายได้">รายได้</option>
                  <option value="เงินโครงการ">เงินโครงการ</option>
                </select>
                <span v-if="errors.sendmoney" class="text-red-600 text-xs">
                  {{ errors.sendmoney }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  รหัสโครงงาน <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.projectCode"
                  disabled
                  class="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <!-- รายการนำส่งเงิน -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                รายการนำส่งเงิน
              </h2>
              <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {{ morelist.length }} รายการ
              </span>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
              <!-- Header Labels -->
              <div
                class="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-2 pb-2 border-b border-gray-300"
              >
                <div class="text-xs font-semibold text-gray-600 uppercase">รายการ</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">จำนวนเงิน</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">ค่าธรรมเนียม</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">หมายเหตุ</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">คำสำคัญ</div>
              </div>

              <!-- Dynamic Rows -->
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 items-start">
                    <!-- ชื่อรายการ -->
                    <div class="flex flex-col gap-2">
                      <InputText
                        v-model="row.itemName"
                        placeholder="ชื่อรายการ"
                      />
                      <span v-if="errors.rows?.[index]?.itemName" class="text-red-600 text-xs">
                        {{ errors.rows[index].itemName }}
                      </span>
                    </div>

                    <!-- จำนวนเงิน -->
                    <div class="flex flex-col gap-1.5">
                      <button
                        class="w-full px-4 py-2 bg-[#7E22CE] text-white rounded-md hover:bg-[#6B21A8] transition-colors"
                        @click="openModalForRowEdit(index)"
                      >
                        จำนวนเงิน
                      </button>
                      <Modal
                        v-if="showModal === index"
                        :show="true"
                        :items="rowItems[index]"
                        @close="showModal = null"
                        @update:selected="(selected) => updateSelectedItems(index, selected)"
                      />
                      <span v-if="errors.rows?.[index]?.selectedItems" class="text-red-600 text-xs">
                        {{ errors.rows[index].selectedItems }}
                      </span>
                    </div>

                    <!-- ค่าธรรมเนียม -->
                    <div>
                      <InputText
                        v-model="row.fee"
                        placeholder="ค่าธรรมเนียม"
                        @keypress="allowOnlyDigits"
                      />
                    </div>

                    <!-- หมายเหตุ -->
                    <div class="flex flex-col gap-1.5">
                      <InputText
                        v-model="row.note"
                        placeholder="หมายเหตุ"
                      />
                      <span v-if="errors.rows?.[index]?.note" class="text-red-600 text-xs">
                        {{ errors.rows[index].note }}
                      </span>
                    </div>

                    <!-- Keyword -->
                    <div class="flex flex-col gap-1.5">
                      <InputText
                        v-model="row.keyword"
                        placeholder="คำสำคัญ"
                      />
                    </div>

                    <!-- Delete Button -->
                      <button
                        v-if="morelist.length > 1"
                        @click="removeRow(index)"
                        class="mt-0 sm:mt-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 self-start sm:self-center"
                        title="ลบรายการ"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                  </div>

                  <!-- รายละเอียดรายการ (ตามหน้า Add) -->
                  <div v-if="getRowDetail(index)" class="mt-4 border-t border-gray-200 pt-4">
                    <!-- ... (ใช้ getRowDetail เหมือนหน้า Add) -->
                  </div>
                </div>
              </div>

              <!-- Add Row Button -->
              <button
                @click="addRow"
                class="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มรายการ
              </button>
            </div>
          </div>

          <!-- ยอดรวม -->
          <div class="bg-[#7E22CE] rounded-lg p-6">
            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold text-white">ยอดสุทธิทั้งหมด</span>
              <span class="text-3xl font-bold text-white">
                {{ formatNumber(totalAmount) }} บาท
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="gotomainpage"
              class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              กลับ
            </button>
            <button
              @click="saveData"
              class="px-6 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select/select.vue'
import InputText from '@/components/input/inputtext.vue'
import Modal from '@/components/modal/modalwaybill.vue'
import { useRowManager } from '@/components/Function/FuncForm'
const route = useRoute()
const router = useRouter()
const projectCode = ref(route.params.id)
const loading = ref(true)
const {
  allowOnlyDigits,
  netTotalAmount,
  getRowDetail,
  morelist,
  addRow,
  removeRow,
  updateSelectedItems,
  showModal,
  rowItems,
  initTomSelect,
} = useRowManager()
// ตัวเลือกหน่วยงาน (เหมือนหน้า Add)
const options = {
  คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ: [
    'ศูนย์ศึกษาเศรษฐกิจพอเพียงและความอยู่รอดของมนุษยชาติ',
    'ศูนย์ฝึกอบรมวิชาชีพและบริการนานาชาติด้านเกษตรและอาหาร',
  ],
  คณะทันตแพทยศาสตร์: ['โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา'],
  คณะพยาบาลศาสตร์: ['ศูนย์พัฒนาเด็กเล็ก'],
  คณะพลังงานและสิ่งแวดล้อม: [
    '1.ศูนย์วิจัยพลังงานทดแทนและสิ่งแวดล้อม',
    '1.1หน่วยปฏิบัติการทดสอบทางสิ่งแวดล้อม',
    '1.2 หน่วยรับรองการจัดการก๊าซเรือนกระจก',
  ],
  คณะแพทยศาสตร์: ['โรงพยาบาลมหาวิทยาลัยพะเยา'],
  คณะเภสัชศาสตร์: ['สถานปฏิบัติการเภสัชกรรมชุมชน'],
  คณะวิทยาศาสตร์: ['ศูนย์การเรียนรู้ความเป็นเลิศทางวิทยาศาสตร์และบริการวิชาการ'],
  คณะวิศวกรรมศาสตร์: ['ศูนย์วิจัยและบริการวิชาการวิศวกรรม', 'ศูนย์เทคโนโลยียานยนต์และขนส่ง'],
  คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์: ['ศูนย์บริการวิชาการงานสร้างสรรค์'],
  คณะศิลปศาสตร์: ['ศูนย์ภาษา'],
  คณะสหเวชศาสตร์: ['ศูนย์บริการสุขภาพสหเวชศาสตร์'],
  วิทยาลัยการจัดการ: [],
  กองทรัพย์สิน: ['งานบริหารพื้นที่', 'งานโรงแรมฟ้ามุ่ยและเอื้องคำ', 'งานร้านค้าสวัสดิการ'],
  โรงเรียนสาธิตมหาวิทยาลัยพะเยา: [],
  วิทยาเขตเชียงราย: [],
  สถาบันนวัตกรรมและถ่ายทอดเทคโนโลยี: [],
  สถาบันนวัตกรรมการเรียนรู้: [],
}

const mainCategory = ref('')
const subCategory = ref('')
const subOptions = computed(() => {
  return mainCategory.value ? options[mainCategory.value] : []
})

const formData = ref({
  fullName: '',
  phone: '',
  fundName: '',
  sendmoney: '',
  projectCode: ''
})
const errors = ref({})
onMounted(async () => {
  try {
    console.log('🔍 Loading receipt:', projectCode.value);
    
    const response = await axios.get(`/findOneReceipt/${projectCode.value}`);
    const data = response.data;

    console.log('📦 Loaded data:', data);

    formData.value = {
      fullName: data.fullName || '',
      phone: data.phone || '',
      fundName: data.fundName || '',
      sendmoney: data.moneyTypeNote || '',
      projectCode: data.projectCode || ''
    };

    mainCategory.value = data.mainAffiliationName || '';
    subCategory.value = data.subAffiliationName || '';

    if (data.receiptList?.length > 0) {
      morelist.value = data.receiptList.map((receipt) => ({
        itemName: receipt.itemName || '',
        note: receipt.note || '',
        fee: Number(receipt.fee) || 0,
        keyword: Array.isArray(receipt.keyword) 
          ? receipt.keyword 
          : receipt.keyword ? [receipt.keyword] : [],
        selectedItems: (receipt.paymentDetails || []).map((payment) => ({
          moneyType: payment.moneyType,
          name: getPaymentTypeName(payment.moneyType),
          checked: true,
          amount: payment.amount || '',
          referenceNo: payment.referenceNo || '',
          // เช็คธนาคาร
          checkNumber: payment.checkNumber || '',
          NumCheck: payment.checkNumber || '',
          // ฝากเข้าบัญชี
          accountName: payment.accountName || '',
          AccountName: payment.accountName || '',
          accountNumber: payment.accountNumber || '',
          AccountNum: payment.accountNumber || '',
          bankName: payment.bankName || '',
          BankName: payment.bankName || ''
        }))
      }));
    }

    loading.value = false;
    console.log('✅ Data loaded successfully');

  } catch (error) {
    console.error('❌ Load Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'ข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลได้',
      confirmButtonText: 'ตกลง'
    });
    router.back();
  }
});


// 🔥 Override function เพื่อรองรับการแก้ไข
const openModalForRowEdit = (index) => {
  console.log('🔍 Opening modal for row:', index);
  console.log('Current row data:', morelist.value[index]);

  // 🟢 Default ทั้ง 3 ประเภท
  const defaultItems = [
    { 
      name: 'เงินสด',
      moneyType: 'cash',
      checked: false,
      amount: '',
      referenceNo: ''
    },
    { 
      name: 'เช็ค',
      moneyType: 'bank',
      checked: false,
      amount: '',
      referenceNo: '',
      NumCheck: '',
      checkNumber: ''
    },
    { 
      name: 'ฝากเข้าบัญชี',
      moneyType: 'transfer',
      checked: false,
      amount: '',
      referenceNo: '',
      AccountNum: '',
      accountNumber: '',
      AccountName: '',
      accountName: '',
      BankName: '',
      bankName: ''
    }
  ];

  // ถ้ามี selectedItems ของแถวนี้
  const existing = morelist.value[index]?.selectedItems || [];

  // 🧩 สร้าง structure แบบ 3 ประเภทเสมอ
  const mergedItems = defaultItems.map(def => {
    // ค้นหาข้อมูลเก่า (ถ้ามี)
    const exist = existing.find(i => i.moneyType === def.moneyType);

    if (exist) {
      // รวมข้อมูลเก่าเข้ากับ default
      return {
        ...def,
        ...exist,
        checked: true, // มีข้อมูลเก่า → เปิดใช้งาน
        name: exist.name || getPaymentTypeName(exist.moneyType)
      };
    }

    // ไม่มีข้อมูลเก่า → ใช้ค่า default
    return { ...def };
  });

  // 🟣 เซตค่าเข้า modal
  rowItems.value[index] = mergedItems;

  console.log('✅ Final merged items:', mergedItems);

  showModal.value = index;
};


watch(showModal, (newVal) => {
  if (newVal !== null) {
    console.log('📋 Modal opened for row:', newVal);
    console.log('Items in modal:', rowItems.value[newVal]);
  }
});

const formatNumber = (num) => {
  return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

const getPaymentTypeName = (type) => {
  const map = { cash: 'เงินสด', bank: 'เช็คธนาคาร', transfer: 'ฝากเข้าบัญชี' }
  return map[type] || type
}

const getPaymentTypeCode = (name) => {
  const map = { 'เงินสด': 'cash', 'เช็คธนาคาร': 'bank', 'ฝากเข้าบัญชี': 'transfer' }
  return map[name] || 'cash'
}

const totalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    const rowTotal = (row.selectedItems || [])
      .filter(i => i.checked)
      .reduce((s, i) => s + (Number(i.amount) || 0), 0)
    return sum + (rowTotal - (Number(row.fee) || 0))
  }, 0)
})
const saveData = async () => {
  // รีเซ็ต error
  errors.value = { rows: {} };
  let hasError = false;
  if (!formData.value.fullName) {
    errors.value.fullName = 'กรุณากรอก "ชื่อ"';
    hasError = true;
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก "เบอร์โทรติดต่อ"';
    hasError = true;
  }
  if (!formData.value.fundName) {
    errors.value.fundName = 'กรุณาเลือก "กองทุน"';
    hasError = true;
  }
  if (!mainCategory.value) {
    errors.value.mainCategory = 'กรุณาเลือก "หน่วยงาน"';
    hasError = true;
  }
  if (!subCategory.value) {
    errors.value.subCategory = 'กรุณาเลือก "หน่วยงานย่อย"';
    hasError = true;
  }
  if (!formData.value.sendmoney) {
    errors.value.sendmoney = 'กรุณาเลือก "ขอนำส่งเงิน"';
    hasError = true;
  }

  // Validate แต่ละ row
  morelist.value.forEach((row, index) => {
    const rowErrors = {};
    if (!row.itemName) rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"';
    if (!row.note) rowErrors.note = 'กรุณากรอก "หมายเหตุ"';

    // เช็ค selectedItems
    if (!row.selectedItems || row.selectedItems.filter(i => i.checked).length === 0) {
      rowErrors.selectedItems = 'กรุณาเลือก "จำนวนเงิน" อย่างน้อย 1 รายการ';
    } else if (row.selectedItems.some(i => i.checked && !i.amount)) {
      rowErrors.selectedItems = 'กรุณากรอกจำนวนเงินให้ครบถ้วน';
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.value.rows[index] = rowErrors;
      hasError = true;
    }
  });

  if (hasError) {
    Swal.fire({
      icon: 'error',
      title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      text: 'มีข้อมูลบางช่องที่ยังไม่ได้กรอกหรือกรอกไม่ถูกต้อง',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE'
    });
    return;
  }

  // แสดง loading
  Swal.fire({
    title: 'กำลังบันทึก...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  // สร้าง payload
  const updatedData = {
    projectCode: formData.value.projectCode,
    fullName: formData.value.fullName,
    phone: formData.value.phone,
    mainAffiliationName: mainCategory.value,
    subAffiliationName: subCategory.value,
    fundName: formData.value.fundName,
    moneyTypeNote: formData.value.moneyTypeNote,
    netTotalAmount: totalAmount.value,
    receiptList: morelist.value.map(row => {
      const rowTotal = (row.selectedItems || [])
        .filter(i => i.checked)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      
      const fee = Number(row.fee) || 0;

      return {
        itemName: row.itemName,
        note: row.note || '',
        fee: fee,
        keyword: Array.isArray(row.keyword) ? row.keyword : row.keyword ? [row.keyword] : [],
        subtotal: rowTotal,
        amount: rowTotal - fee,
        paymentDetails: (row.selectedItems || [])
          .filter(i => i.checked)
          .map(item => ({
            moneyType: item.moneyType || getPaymentTypeCode(item.name),
            amount: Number(item.amount) || 0,
            referenceNo: item.referenceNo || '',
            checkNumber: item.checkNumber || item.NumCheck || null,
            accountName: item.accountName || item.AccountName || null,
            accountNumber: item.accountNumber || item.AccountNum || null,
            bankName: item.bankName || item.BankName || null
          }))
      };
    })
  };

  try {
    console.log('📤 Sending update:', updatedData);
    
    // ✅ ใช้ encodeURIComponent เพื่อ encode projectCode
    const response = await axios.put(
      `/updateReceipt/${encodeURIComponent(projectCode.value)}`,
      updatedData
    );

    console.log('✅ Update successful:', response.data);

    await Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ!',
      text: 'แก้ไขข้อมูลเรียบร้อยแล้ว',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
      timer: 2000,
      timerProgressBar: true
    });

    // กลับไปหน้าหลัก
    router.push('/');

  } catch (error) {
    console.error('❌ Update Error:', error);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
    }

    Swal.fire({
      icon: 'error',
      title: 'บันทึกไม่สำเร็จ',
      text: errorMessage,
      confirmButtonText: 'ลองอีกครั้ง',
      confirmButtonColor: '#DC2626'
    });
  }
};

const gotomainpage = () => {
  router.back()
}
</script>