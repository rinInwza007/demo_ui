<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <!-- โลโก้หน่วยงาน -->
            <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">แบบฟอร์มลงทะเบียน</h1>
          <p class="text-gray-600">กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง</p>
          <p class="text-sm text-gray-500 mt-2">เลขที่อ้างอิง: FM-2024-001</p>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6 md:p-8">
        <!-- ข้อมูลส่วนตัว -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
            ข้อมูลส่วนตัว
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- คำนำหน้า -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                คำนำหน้า <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="formData.prefix" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- เลือกคำนำหน้า --</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>

            <!-- ชื่อ -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                ชื่อ <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="formData.firstName"
                type="text" 
                required
                placeholder="กรอกชื่อ"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- นามสกุล -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                นามสกุล <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="formData.lastName"
                type="text" 
                required
                placeholder="กรอกนามสกุล"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- เลขบัตรประชาชน -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                เลขบัตรประชาชน <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="formData.idCard"
                type="text" 
                required
                maxlength="13"
                pattern="[0-9]{13}"
                placeholder="0-0000-00000-00-0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- อีเมล -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                อีเมล <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="formData.email"
                type="email" 
                required
                placeholder="example@mail.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- เบอร์โทรศัพท์ -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                เบอร์โทรศัพท์ <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="formData.phone"
                type="tel" 
                required
                maxlength="10"
                pattern="[0-9]{10}"
                placeholder="0812345678"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- ที่อยู่ -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
            ที่อยู่
          </h2>
          
          <div class="grid grid-cols-1 gap-6">
            <!-- ที่อยู่ -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                ที่อยู่ <span class="text-red-500">*</span>
              </label>
              <textarea 
                v-model="formData.address"
                required
                rows="3"
                placeholder="บ้านเลขที่ หมู่ ซอย ถนน"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- จังหวัด -->
              <div>
                <label class="block text-gray-700 font-medium mb-2">
                  จังหวัด <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="formData.province"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- เลือกจังหวัด --</option>
                  <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                  <option value="เชียงใหม่">เชียงใหม่</option>
                  <option value="ภูเก็ต">ภูเก็ต</option>
                  <!-- เพิ่มจังหวัดอื่นๆ -->
                </select>
              </div>

              <!-- รหัสไปรษณีย์ -->
              <div>
                <label class="block text-gray-700 font-medium mb-2">
                  รหัสไปรษณีย์ <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="formData.zipCode"
                  type="text" 
                  required
                  maxlength="5"
                  pattern="[0-9]{5}"
                  placeholder="10100"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ข้อมูลเพิ่มเติม -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
            ข้อมูลเพิ่มเติม
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- ประเภทการสมัคร -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                ประเภทการสมัคร <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="formData.type"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- เลือกประเภท --</option>
                <option value="บุคคลทั่วไป">บุคคลทั่วไป</option>
                <option value="ข้าราชการ">ข้าราชการ</option>
                <option value="พนักงานรัฐวิสาหกิจ">พนักงานรัฐวิสาหกิจ</option>
              </select>
            </div>

            <!-- หน่วยงาน -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                หน่วยงาน
              </label>
              <input 
                v-model="formData.organization"
                type="text" 
                placeholder="ระบุหน่วยงาน (ถ้ามี)"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- หมายเหตุ -->
          <div class="mt-6">
            <label class="block text-gray-700 font-medium mb-2">
              หมายเหตุ
            </label>
            <textarea 
              v-model="formData.note"
              rows="4"
              placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        <!-- ข้อกำหนดและเงื่อนไข -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start">
            <input 
              v-model="formData.acceptTerms"
              type="checkbox" 
              id="terms"
              required
              class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="terms" class="ml-3 text-sm text-gray-700">
              <span class="font-medium">ข้าพเจ้ายินยอมและรับทราบ</span> 
              ว่าข้อมูลที่ให้ไว้ถูกต้องตามความเป็นจริง และข้าพเจ้ายินยอมให้หน่วยงานเก็บรักษาข้อมูลส่วนบุคคล
              ตาม <span class="font-medium">พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</span>
              <span class="text-red-500">*</span>
            </label>
          </div>
        </div>

        <!-- Privacy Notice -->
        <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p class="text-xs text-gray-600 leading-relaxed">
            <strong>นโยบายความเป็นส่วนตัว:</strong> 
            ข้อมูลส่วนบุคคลของท่านจะถูกเก็บรักษาเป็นความลับและใช้เพื่อวัตถุประสงค์ทางราชการเท่านั้น 
            ท่านมีสิทธิ์เข้าถึง แก้ไข ลบ หรือระงับการใช้ข้อมูลได้ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล
          </p>
        </div>

        <!-- ปุ่ม -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
          </button>
          
          <button
            type="button"
            @click="resetForm"
            :disabled="isSubmitting"
            class="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg transition duration-200"
          >
            ล้างข้อมูล
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-green-800 font-medium">บันทึกข้อมูลสำเร็จ!</span>
          </div>
        </div>
      </form>

      <!-- Footer -->
      <div class="text-center mt-6 text-sm text-gray-600">
        <p>หากมีข้อสงสัยติดต่อ: support@example.go.th | โทร. 02-xxx-xxxx</p>
        <p class="mt-2">© 2024 ชื่อหน่วยงาน. สงวนลิขสิทธิ์.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const isSubmitting = ref(false)
const showSuccess = ref(false)

const formData = reactive({
  prefix: '',
  firstName: '',
  lastName: '',
  idCard: '',
  email: '',
  phone: '',
  address: '',
  province: '',
  zipCode: '',
  type: '',
  organization: '',
  note: '',
  acceptTerms: false
})

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // จำลองการส่งข้อมูล
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Form Data:', formData)
    
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      resetForm()
    }, 3000)
    
  } catch (error) {
    console.error('Error:', error)
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'boolean') {
      formData[key] = false
    } else {
      formData[key] = ''
    }
  })
}
</script>

<style scoped>
/* Custom styles ถ้าต้องการ */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Sarabun', sans-serif;
}
</style>