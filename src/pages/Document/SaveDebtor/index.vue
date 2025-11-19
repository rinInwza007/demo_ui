<template>
  <div >
    <Navbar/>
    <SecondNavbar />

    <!-- Main container -->
    <div class="max-w-5xl mx-auto p-6 pt-5 ">

      <!-- 🔲 กล่องใหญ่ครอบทุกอย่าง -->
      <div class="bg-white border border-gray-300 rounded-xl shadow-sm p-10 space-y-9">


    <h1 class="text-center text-3xl ">
      บันทึกลูกหนี้
    </h1>
    <div class="max-w-4xl mx-auto p-6 pt-8 mt-10">

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-4 ">
          <div class="flex flex-col gap-1.5">
            <span>ข้าพเจ้า</span>
            <InputText type="text" />
             <p v-if="errors.name" class="text-red-500 text-sm">* {{ errors.name }}</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <span>เบอร์โทรติดต่อ</span>
            <InputText type="phone" />
            <p v-if="errors.phone" class="text-red-500 text-sm">* {{ errors.phone }}</p>

          </div>

          <div class="flex flex-col gap-1.5">
            <span>สังกัด</span>
            <Selects
              v-model="category"
              :options="['กองทุนที่ 1','กองทุนที่ 2','กองทุนที่ 3','กองทุนที่ 4']"
            />
            <p v-if="errors.department" class="text-red-500 text-sm mt-2">
    * {{ errors.department }}
  </p>

          </div>

          <div class="flex flex-col gap-1.5">
            <span>จำนวนเงิน</span>
            <InputText type="number" />
             <p v-if="errors.amount" class="text-red-500 text-sm">
    * {{ errors.amount }}</p>

          </div>
        </div>



        <div class="space-y-4 mt-5 ">
          <span class="font-medium text-lg ">ล้างลูกหนี้</span>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Selects
              v-model="debts"
              :options="['กองทุนที่ 1','กองทุนที่ 2','กองทุนที่ 3','กองทุนที่ 4']"
              placeholder="เพิ่มรายการ"
            />
            <InputText placeholder="เลขที่เอกสารอ้างอิง" />
            <p v-if="errors.clearDoc" class="text-red-500 text-sm mt-1">
      * {{ errors.clearDoc }}
    </p>
            <InputText placeholder="จำนวนเงิน" />
            <p v-if="errors.clearMoney" class="text-red-500 text-sm mt-1">
      * {{ errors.clearMoney }}
    </p>
            <InputText placeholder="หมายเหตุ" />
            <p v-if="errors.clearNote" class="text-red-500 text-sm mt-1">
      * {{ errors.clearNote }}
    </p>
          </div>
        </div>



        <div class="space-y-4 mt-5">
          <div>
            <input type="checkbox" v-model="check3">
            นำฝากเข้าธนาคาร
          </div>

        </div>



        <div class="flex justify-end gap-3 pt-4">
          <button class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400" @click="saveData">
            บันทึก
          </button>
          <button
            class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700"
            @click="gotomainpage"
          >
            กลับ
          </button>
        </div>
       </div>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select.vue'
import InputText from '@/components/input/inputtext.vue'
import router from '@/router'
import { reactive } from "vue";

const category = ref('')
const debts = ref('')
const check3 = ref(false)

const gotomainpage = () => router.push('/')
const form = reactive({
  name: "",
  phone: "",
  department: "",
  amount: "",
  clearList: {
    type: "",
    doc: "",
    money: "",
    note: "",
  },
  bank1: false,
  bank2: false,
  bank3: false,
});

const errors = reactive({});

const validateForm = () => {
  errors.name = !form.name ? "กรุณากรอกชื่อ" : "";
  errors.phone = !form.phone ? "กรุณากรอกเบอร์โทร" : "";
  errors.department = !form.department ? "กรุณาเลือกสังกัด" : "";
  errors.amount = !form.amount ? "กรุณากรอกจำนวนเงิน" : "";

  errors.clearType = !form.clearList.type ? "กรุณาเลือกรายการ" : "";
  errors.clearDoc = !form.clearList.doc ? "กรุณากรอกเลขที่เอกสาร" : "";
  errors.clearMoney = !form.clearList.money ? "กรุณากรอกจำนวนเงิน" : "";
  errors.clearNote = !form.clearList.note ? "กรุณากรอกหมายเหตุ" : "";

  // ถ้ามี error ให้คืน true
  return Object.values(errors).some((e) => e !== "");
};

const saveData = () => {
  const hasError = validateForm();

  if (hasError) {
    alert("❌ กรุณากรอกข้อมูลให้ครบทุกช่อง");
    return;
  }

  console.log("ข้อมูล:", JSON.parse(JSON.stringify(form)));
  alert("✔ บันทึกสำเร็จ");
};

</script>
