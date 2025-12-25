<template>
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full flex h-screen overflow-hidden">
      <div class="mesh-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <sidebar />
      <main class="flex-1 flex flex-col relative z-10">
        <header class="h-16 flex items-center justify-between px-8 pt-4 pb-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <i class="ph ph-file-plus"></i>
              {{ isEditMode ? 'แก้ไขใบนำส่ง' : 'เพิ่มใบนำส่ง' }}
            </h1>
            <p class="text-xs text-slate-800 mt-0.5">
              {{ isEditMode ? `รหัส: ${formData.projectCode}` : 'กรอกข้อมูลใบนำส่งเงิน' }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm"
            >
              <i class="ph ph-bell text-xl"></i>
            </button>
            <button
              class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm"
            >
              <i class="ph ph-gear text-xl"></i>
            </button>
          </div>
        </header>
        <div v-if="isLoading" class="flex-1 flex justify-center items-center">
          <div class="glass-panel rounded-2xl p-8 flex flex-col items-center gap-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p class="text-slate-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
        <div v-else class="flex-1 overflow-y-auto px-8 pb-8">
          <div class="max-w-6xl mx-auto space-y-6">
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>ส่วนที่ 1: ข้อมูลผู้บันทึก
              </h2>
              <div class="grid grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    เลขที่นำส่ง <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    v-model="formData.delNumber"
                    placeholder="เลขที่นำส่ง"
                    class="transition-all duration-200"
                    @keypress="allowOnlyDigits"
                  />
                  <span v-if="errors.delNumber" class="text-red-600 text-xs">
                    {{ errors.delNumber }}
                  </span>
                </div>
                <div></div>
              </div>

              <!-- แถวที่ 1: ชื่อ | เบอร์โทร (แสดงเสมอ) -->
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
              </div>

              <!-- แถวที่ 2: หน่วยงาน | (กองทุน หรือ sub1) -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Col 1: หน่วยงาน -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    หน่วยงาน <span class="text-red-500">*</span>
                  </label>
                  <Selects
                    v-model="mainCategory"
                    :options="['เลือกทั้งหมด', ...Object.keys(options)]"
                    placeholder="-- เลือกหน่วยงาน --"
                    value-type="string"
                  />
                  <span v-if="errors.mainCategory" class="text-red-600 text-xs">
                    {{ errors.mainCategory }}
                  </span>
                </div>

                <!-- Col 2: กองทุน (ถ้าไม่มี sub) หรือ sub1 (ถ้ามี sub) -->
                <div v-if="!hasAnySub" class="flex flex-col gap-2">
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

                <div v-if="hasAnySub" class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    หน่วยงานรอง <span class="text-red-500">*</span>
                  </label>
                  <Selects
                    v-model="subCategory"
                    :options="sub1OptionsArray"
                    placeholder="-- เลือกหน่วยงานรอง --"
                    value-type="string"
                  />
                  <span v-if="errors.subCategory" class="text-red-600 text-xs">
                    {{ errors.subCategory }}
                  </span>
                </div>
              </div>

              <!-- แถวที่ 3: กรณีไม่มี sub → ขอนำส่งเงิน | รหัสโครงการ -->
              <div v-if="!hasAnySub" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    ขอนำส่งเงิน <span class="text-red-500">*</span>
                  </label>
                  <SendMoneySelect
                    ref="sendmoneySelectRef"
                    v-model="formData.sendmoney"
                    input-id="sendmoney"
                    placeholder="เลือกประเภท"
                    :required="true"
                    :error-message="errors.sendmoney"
                    :options="[
                      { value: 'รายได้', text: 'รายได้' },
                      { value: 'เงินโครงการ', text: 'เงินโครงการ' },
                    ]"
                    :create-new-option="true"
                    @change="clearError('sendmoney')"
                  />
                  <span v-if="errors.sendmoney" class="text-red-600 text-xs">
                    {{ errors.sendmoney }}
                  </span>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    รหัสโครงงาน <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    class="-mt-1"
                    v-model="formData.projectCode"
                    placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    :class="{ 'readonly-force': isEditMode }"
                  />
                  <span v-if="errors.projectCode" class="text-red-600 text-xs">
                    {{ errors.projectCode }}
                  </span>
                </div>
              </div>

              <!-- แถวที่ 3: กรณีมี sub1 แต่ไม่มี sub2 → กองทุน | ขอนำส่งเงิน -->
              <div v-if="hasAnySub && !hasSub2" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <SendMoneySelect
                    ref="sendmoneySelectRef"
                    v-model="formData.sendmoney"
                    input-id="sendmoney"
                    placeholder="เลือกประเภท"
                    :required="true"
                    :error-message="errors.sendmoney"
                    :options="[
                      { value: 'รายได้', text: 'รายได้' },
                      { value: 'เงินโครงการ', text: 'เงินโครงการ' },
                    ]"
                    :create-new-option="true"
                    @change="clearError('sendmoney')"
                  />
                  <span v-if="errors.sendmoney" class="text-red-600 text-xs">
                    {{ errors.sendmoney }}
                  </span>
                </div>
              </div>

              <!-- แถวที่ 3: กรณีมี sub2 → sub2 | กองทุน -->
              <div v-if="hasSub2" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    หน่วยงานย่อย <span class="text-red-500">*</span>
                  </label>
                  <Selects
                    v-model="subCategory2"
                    :options="sub2OptionsArray"
                    placeholder="-- เลือกหน่วยงานย่อย --"
                    value-type="string"
                  />
                  <span v-if="errors.subCategory2" class="text-red-600 text-xs">
                    {{ errors.subCategory2 }}
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
              </div>

              <!-- แถวที่ 4: กรณีมี sub1 (ไม่ว่าจะมี sub2 หรือไม่) → รหัสโครงการ | ว่าง หรือ ขอนำส่งเงิน | รหัสโครงการ -->
              <div v-if="hasAnySub && !hasSub2" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    รหัสโครงงาน <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    v-model="formData.projectCode"
                    placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    :class="{ 'readonly-force': isEditMode }"
                  />
                  <span v-if="errors.projectCode" class="text-red-600 text-xs">
                    {{ errors.projectCode }}
                  </span>
                </div>
                <!-- คอลัมน์ว่าง -->
                <div></div>
              </div>

              <!-- แถวที่ 4: กรณีมี sub2 → ขอนำส่งเงิน | รหัสโครงการ -->
              <div v-if="hasSub2" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    ขอนำส่งเงิน <span class="text-red-500">*</span>
                  </label>
                  <SendMoneySelect
                    ref="sendmoneySelectRef"
                    v-model="formData.sendmoney"
                    input-id="sendmoney"
                    placeholder="เลือกประเภท"
                    :required="true"
                    :error-message="errors.sendmoney"
                    :options="[
                      { value: 'รายได้', text: 'รายได้' },
                      { value: 'เงินโครงการ', text: 'เงินโครงการ' },
                    ]"
                    :create-new-option="true"
                    @change="clearError('sendmoney')"
                  />
                  <span v-if="errors.sendmoney" class="text-red-600 text-xs">
                    {{ errors.sendmoney }}
                  </span>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    รหัสโครงงาน <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    class="-mt-1"
                    v-model="formData.projectCode"
                    placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    :class="{ 'readonly-force': isEditMode }"
                  />
                  <span v-if="errors.projectCode" class="text-red-600 text-xs">
                    {{ errors.projectCode }}
                  </span>
                </div>
              </div>
            </div>
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span class="w-1 h-6 bg-green-500 rounded-full"></span>ส่วนที่ 2: รายการนำส่งเงิน
                </h2>
                <span class="text-xs text-slate-600 bg-white/60 px-3 py-1 rounded-full"
                  >{{ morelist.length }} รายการ</span
                >
              </div>

              <div
                class="hidden sm:grid sm:grid-cols-[0.3fr_0.6fr_1.5fr_0.8fr_0.8fr_0.2fr] gap-3 px-2 pb-2 border-b border-white/40 items-center text-center"
              >
                <div class="text-base font-semibold text-slate-600 uppercase">ลำดับ</div>
                <div class="text-base font-semibold text-slate-600 uppercase">เลขที่อ้างอิง</div>
                <div class="text-base font-semibold text-slate-600 uppercase">รายการ</div>
                <div class="text-base font-semibold text-slate-600 uppercase">จำนวนเงิน</div>
                <div class="text-base font-semibold text-slate-600 uppercase">หมายเหตุ</div>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  class="bg-white/20 rounded-xl p-4 border border-white/50 transition-all"
                >
                  <div
                    class="grid grid-cols-1 sm:grid-cols-[0.2fr_1fr_2fr_1fr_1fr_auto] gap-3 items-start"
                  >
                    <div class="flex items-center justify-center -mr-2">
                      <span
                        class="-mr-3 bg-purple-500 text-white rounded-full text-lg font-bold mt-3 w-10 h-10 flex items-center justify-center"
                        >{{ index + 1 }}</span
                      >
                    </div>
                    <div class="flex flex-col gap-1.5 mt-2 -mr-2 ml-2">
                      <InputText
                        v-model="row.referenceNo"
                        placeholder="(เล่มที่/เลขที่ใบเสร็จ)"
                        @keypress="allowOnlyDigits"
                        @input="() => clearRowError(index, 'referenceNo')"
                      />
                    </div>
                    <div class="flex flex-col gap-2 mt-[13px]">
                      <ItemNameSelect
                        v-model="row.itemName"
                        :input-id="`itemName-${index}`"
                        @input="() => clearRowError(index, 'itemName')"
                        class="-mr-2"
                      />
                      <span v-if="errors.rows?.[index]?.itemName" class="text-red-600 text-xs">{{
                        errors.rows[index].itemName
                      }}</span>
                    </div>

                    <div class="flex flex-col gap-1.5 mt-2">
                      <div class="flex flex-col gap-1.5">
                        <InputText
                          :model-value="formatDisplayAmount(row.amount)"
                          @input="(e) => handleAmountInput(index, e)"
                          @blur="() => formatAmountOnBlur(index)"
                          placeholder="จำนวนเงิน"
                        />
                      </div>
                    </div>
                    <div class="flex flex-col gap-1.5 mt-2">
                      <InputText
                        v-model="row.note"
                        placeholder="หมายเหตุ"
                        @input="() => clearRowError(index, 'note')"
                      />
                      <span v-if="errors.rows?.[index]?.note" class="text-red-600 text-xs">{{
                        errors.rows[index].note
                      }}</span>
                    </div>
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
                </div>
              </div>

              <div class="grid grid-cols-[_1fr_4fr] gap-6">
                <button
                  @click="addRow"
                  class="border-2 border-dashed border-[#7E22CE] rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  เพิ่มรายการ
                </button>
                <div class="bg-[#7E22CE] border rounded-lg py-6 px-3">
                  <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-white">ยอดสุทธิทั้งหมด</span>
                    <span class="text-3xl font-bold text-white">
                      {{ formattedTotalAmount }} บาท
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span class="w-1 h-6 bg-red-500 rounded-full"></span>ส่วนที่ 3: การนำส่งเงิน
                (โปรดระบุ)
              </h2>
              <div class="space-y-4">
                <!-- ธ.กรุงไทย สาขาพะเยา -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.krungthai.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">
                        ธ.กรุงไทย สาขาพะเยา (มหาวิทยาลัยพะเยา)
                      </div>
                      <div class="text-sm text-slate-600">บช.ที่ 512-1-43488-6</div>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <InputText
                          :model-value="formatDisplayPaymentAmount(paymentMethods.krungthai.amount)"
                          @input="(e) => handlePaymentAmountInput('krungthai', e)"
                          @blur="() => formatPaymentAmountOnBlur('krungthai')"
                          :readonly="!paymentMethods.krungthai.checked"
                          :class="{
                            'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                              !paymentMethods.krungthai.checked,
                          }"
                          placeholder="0.00"
                          class="w-48 transition-all duration-200"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ธ.ไทยพาณิชย์ สาขามหาวิทยาลัยพะเยา -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.scb.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">
                        ธ.ไทยพาณิชย์ สาขามหาวิทยาลัยพะเยา
                      </div>
                      <div class="text-sm text-slate-600">บช.ที่ 891-2-00225-5</div>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <InputText
                          :model-value="formatDisplayPaymentAmount(paymentMethods.scb.amount)"
                          @input="(e) => handlePaymentAmountInput('scb', e)"
                          @blur="() => formatPaymentAmountOnBlur('scb')"
                          :readonly="!paymentMethods.scb.checked"
                          :class="{
                            'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                              !paymentMethods.scb.checked,
                          }"
                          placeholder="0.00"
                          class="w-48 transition-all duration-200"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- เงินสด -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.cash.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">เงินสด</div>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <InputText
                          :model-value="formatDisplayPaymentAmount(paymentMethods.cash.amount)"
                          @input="(e) => handlePaymentAmountInput('cash', e)"
                          @blur="() => formatPaymentAmountOnBlur('cash')"
                          :readonly="!paymentMethods.cash.checked"
                          :class="{
                            'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                              !paymentMethods.cash.checked,
                          }"
                          placeholder="0.00"
                          class="w-48 transition-all duration-200"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- เช็ค -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.check.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">เช็ค</div>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <InputText
                          :model-value="formatDisplayPaymentAmount(paymentMethods.check.amount)"
                          @input="(e) => handlePaymentAmountInput('check', e)"
                          @blur="() => formatPaymentAmountOnBlur('check')"
                          :readonly="!paymentMethods.check.checked"
                          :class="{
                            'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                              !paymentMethods.check.checked,
                          }"
                          placeholder="0.00"
                          class="w-48 transition-all duration-200"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- อื่น ๆ -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.other.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-slate-800">อื่น ๆ</span>
                        <InputText
                          v-model="paymentMethods.other.name"
                          :disabled="!paymentMethods.other.checked"
                          placeholder="ระบุประเภท"
                          class="w-64"
                        />
                      </div>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <InputText
                          :model-value="formatDisplayPaymentAmount(paymentMethods.other.amount)"
                          @input="(e) => handlePaymentAmountInput('other', e)"
                          @blur="() => formatPaymentAmountOnBlur('other')"
                          :readonly="!paymentMethods.other.checked"
                          :class="{
                            'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                              !paymentMethods.other.checked,
                          }"
                          placeholder="0.00"
                          class="w-48 transition-all duration-200"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- สรุปยอดเงินส่วนที่ 3 -->
                <div class="bg-purple-500 rounded-xl p-4 mt-4">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-white">ยอดเงินนำส่งทั้งสิ้น</span>
                    <span class="text-2xl font-bold text-white"
                      >{{ formattedPaymentTotal }} บาท</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <div
              class="bg-yellow-50/80 backdrop-blur-sm border border-yellow-300 rounded-xl p-4 shadow-sm"
            >
              <p class="text-sm text-yellow-900 m-0 flex items-start gap-2">
                <i class="ph ph-warning text-xl flex-shrink-0 mt-0.5"></i>
                <span
                  ><strong>หมายเหตุ:</strong> กรุณาตรวจสอบข้อมูลให้ถูกต้องและครบถ้วนก่อนกด{{
                    isEditMode ? 'อัพเดต' : 'บันทึก'
                  }}ข้อมูล (ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก)</span
                >
              </p>
            </div>
            <div class="flex justify-end gap-3 pb-4">
              <button
                @click="gotomainpage"
                class="px-6 py-3 rounded-xl bg-white/60 backdrop-blur-sm text-slate-700 hover:bg-white/80 border border-white/60 transition-all shadow-sm"
              >
                <i class="ph ph-arrow-left mr-2"></i>กลับ
              </button>
              <button
                @click="saveData"
                :disabled="reciptStore.loading || isLoading"
                class="glass-button-primary px-6 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <i class="ph ph-floppy-disk mr-2"></i>{{ isEditMode ? 'อัพเดต' : 'บันทึก' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import Selects from '@/components/input/select/select.vue'
import InputText from '@/components/input/inputtext.vue'
import ItemNameSelect from '@/components/TomSelect/ItemNameSelect.vue'
import SendMoneySelect from '@/components/TomSelect/SendMoneyTomSelect.vue'
import sidebar from '@/components/bar/sidebar.vue'
import { options } from '@/components/data/departments'
import { useReceiptStore } from '@/stores/recipt'
import { useRowManager } from '@/components/Function/FuncForm'
import { setupAxiosMock } from '@/fake/mockAxios'

// Initialize
const route = useRoute()
const router = useRouter()
const reciptStore = useReceiptStore()
setupAxiosMock()

// Check if edit mode
const isEditMode = computed(() => !!route.params.id)
const receiptId = computed(() => route.params.id)
const isLoading = ref(false)

// Form data
const formData = ref({
  delNumber: '',
  fullName: '',
  phone: '',
  mainAffiliationName: '',
  subAffiliationName1: '',
  subAffiliationName2: '',
  fundName: '',
  projectCode: '',
  sendmoney: '',
  receiptList: '',
})
const paymentMethods = ref({
  krungthai: { checked: false, amount: '' },
  scb: { checked: false, amount: '' },
  cash: { checked: false, amount: '' },
  check: { checked: false, amount: '' },
  other: { checked: false, name: '', amount: '' },
})

Object.keys(paymentMethods.value).forEach((key) => {
  watch(
    () => paymentMethods.value[key].checked,
    (checked) => {
      if (!checked) {
        paymentMethods.value[key].amount = ''
        if ('name' in paymentMethods.value[key]) {
          paymentMethods.value[key].name = ''
        }
      }
    },
  )
})
onMounted(async () => {
  if (!isEditMode.value) {
    addRow()
    addRow()
  }

  // รอให้ DOM สร้างแถวเสร็จก่อน init TomSelect
  await nextTick()
  // Init TomSelect สำหรับแถวแรก
  morelist.value.forEach((_, i) => {
    initItemNameTomSelect(i)
  })

  await nextTick()

  // ✅ ถ้าเป็น edit mode ให้โหลดข้อมูล
  if (isEditMode.value) {
    await loadReceiptData()
  }
})

// เพิ่ม computed สำหรับคำนวณยอดรวมส่วนที่ 3
const paymentTotal = computed(() => {
  let total = 0

  Object.keys(paymentMethods.value).forEach((key) => {
    const method = paymentMethods.value[key]

    if (method.checked && method.amount) {
      const cleanAmount = String(method.amount).replace(/,/g, '')
      const numAmount = Number(cleanAmount)

      if (!Number.isNaN(numAmount)) {
        total += numAmount
      }
    }
  })

  return total
})

const formattedPaymentTotal = computed(() => {
  return paymentTotal.value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
})

// ฟังก์ชันจัดการ input จำนวนเงินส่วนที่ 3
const handlePaymentAmountInput = (method, event) => {
  const value = event.target.value.replace(/[^0-9.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) return

  // ✅ แก้ไขตรงนี้ - เพิ่ม .value
  paymentMethods.value[method].amount = value
}

const formatDisplayPaymentAmount = (value) => {
  if (!value) return ''

  const cleanValue = value.toString().replace(/,/g, '')
  const parts = cleanValue.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]

  if (!integerPart) return ''

  const formattedInteger = Number(integerPart).toLocaleString('en-US')

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`
  }

  return formattedInteger
}

const formatPaymentAmountOnBlur = (method) => {
  // ✅ แก้ไขตรงนี้ - เพิ่ม .value
  const value = paymentMethods.value[method].amount
  if (!value) return

  const cleanValue = value.toString().replace(/,/g, '')
  const numValue = parseFloat(cleanValue)

  if (isNaN(numValue)) {
    paymentMethods.value[method].amount = ''
    return
  }

  // ✅ แก้ไขตรงนี้ - เพิ่ม .value
  paymentMethods.value[method].amount = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
const handleAmountInput = (index, event) => {
  // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
  const value = event.target.value.replace(/[^0-9.]/g, '')

  // ป้องกันจุดทศนิยมมากกว่า 1 จุด
  const parts = value.split('.')
  if (parts.length > 2) {
    return // ไม่อนุญาตให้มี . มากกว่า 1 ตัว
  }

  morelist.value[index].amount = value
  clearRowError(index, 'amount')
}

const formatDisplayAmount = (value) => {
  if (!value) return ''

  // ลบ comma ทั้งหมด
  const cleanValue = value.toString().replace(/,/g, '')

  // แยกส่วนจำนวนเต็มกับทศนิยม
  const parts = cleanValue.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]

  if (!integerPart) return ''

  // Format ส่วนจำนวนเต็มด้วย comma
  const formattedInteger = Number(integerPart).toLocaleString('en-US')

  // รวมกับส่วนทศนิยม (ถ้ามี)
  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`
  }

  return formattedInteger
}

const formatAmountOnBlur = (index) => {
  const value = morelist.value[index].amount
  if (!value) return

  // ลบ comma
  const cleanValue = value.toString().replace(/,/g, '')

  // แปลงเป็นตัวเลข
  const numValue = parseFloat(cleanValue)

  if (isNaN(numValue)) {
    morelist.value[index].amount = ''
    return
  }

  // Format ทศนิยม 2 ตำแหน่ง พร้อม comma
  const formatted = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  morelist.value[index].amount = formatted
}
const { allowOnlyDigits, morelist, addRow, removeRow, initTomSelect, formattedTotalAmount } =
  useRowManager()

const itemNameInstances = ref({})
const errors = ref({})
const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}
// ✅ เพิ่ม subCategory2
const mainCategory = ref('')
const subCategory = ref('')
const subCategory2 = ref('')

// ✅ Computed Properties
const sub1OptionsArray = computed(() => {
  if (!mainCategory.value || mainCategory.value === 'เลือกทั้งหมด') return []

  const data = options[mainCategory.value]
  if (!data) return []

  const main = data.main

  if (typeof main === 'string') {
    return ['เลือกทั้งหมด', main]
  }

  if (Array.isArray(main)) {
    return ['เลือกทั้งหมด', ...main]
  }

  return []
})

const sub2OptionsArray = computed(() => {
  if (!mainCategory.value || !subCategory.value || subCategory.value === 'เลือกทั้งหมด') {
    return []
  }

  const data = options[mainCategory.value]
  if (!data) return []

  const subs = data.subs

  if (Array.isArray(subs)) {
    return ['เลือกทั้งหมด', ...subs]
  }

  return []
})

const hasAnySub = computed(() => {
  if (!mainCategory.value || mainCategory.value === 'เลือกทั้งหมด') return false
  const data = options[mainCategory.value]
  if (!data) return false

  const main = data.main
  return main !== null && (typeof main === 'string' || (Array.isArray(main) && main.length > 0))
})

const hasSub2 = computed(() => {
  if (!mainCategory.value || !subCategory.value || subCategory.value === 'เลือกทั้งหมด')
    return false
  const data = options[mainCategory.value]
  if (!data) return false

  const subs = data.subs
  return Array.isArray(subs) && subs.length > 0
})

// ✅ Watchers - Clear sub categories
watch(mainCategory, () => {
  subCategory.value = ''
  subCategory2.value = ''
})

watch(subCategory, () => {
  subCategory2.value = ''
})

const gotomainpage = () => {
  router.push('/')
}

const loadReceiptData = async () => {
  if (!receiptId.value) return

  isLoading.value = true
  try {
    const response = await axios.get(`/getReceipt/${receiptId.value}`)
    const list = response.data

    const data = Array.isArray(list) ? list.find((r) => r.id === receiptId.value) : list

    if (!data) throw new Error('Receipt not found')

    // 1. ล้างค่าเก่าทั้งหมด
    mainCategory.value = ''
    subCategory.value = ''
    subCategory2.value = ''
    formData.value.sendmoney = ''

    // ล้างค่า paymentMethods
    paymentMethods.value = {
      krungthai: { checked: false, amount: '' },
      scb: { checked: false, amount: '' },
      cash: { checked: false, amount: '' },
      check: { checked: false, amount: '' },
      other: { checked: false, name: '', amount: '' },
    }

    morelist.value = []

    await nextTick()

    // 2. ตั้งค่าพื้นฐาน (ส่วนที่ 1)
    formData.value.delNumber = data.delNumber || ''
    formData.value.fullName = data.fullName || ''
    formData.value.phone = data.phone || ''
    formData.value.fundName = data.fundName || ''
    formData.value.projectCode = data.projectCode || ''
    formData.value.sendmoney = data.sendmoney || data.moneyType || ''

    // 3. ✅ ตั้งค่า mainCategory และรอ
    if (data.mainAffiliationName && data.mainAffiliationName !== 'เลือกทั้งหมด') {
      mainCategory.value = data.mainAffiliationName
      await nextTick()
    }

    // 4. ✅ ตั้งค่า subCategory และรอ
    if (data.subAffiliationName1 && data.subAffiliationName1 !== 'เลือกทั้งหมด') {
      subCategory.value = data.subAffiliationName1
      await nextTick()
    }

    // 5. ✅ ตั้งค่า subCategory2
    if (data.subAffiliationName2 && data.subAffiliationName2 !== 'เลือกทั้งหมด') {
      subCategory2.value = data.subAffiliationName2
      await nextTick()
    }

    // 6. โหลดข้อมูล paymentMethods (ส่วนที่ 3)
if (data.paymentMethods && typeof data.paymentMethods === 'object') {
  Object.keys(data.paymentMethods).forEach((key) => {
    if (paymentMethods.value[key] && data.paymentMethods[key]) {
      paymentMethods.value[key].checked = true // สำคัญ: ต้องตั้ง checked = true ก่อน!

      const amount = data.paymentMethods[key].amount || 0
      if (amount > 0) {
        const numAmount = typeof amount === 'string' 
          ? parseFloat(amount.replace(/,/g, ''))
          : Number(amount)

        if (!isNaN(numAmount)) {
          paymentMethods.value[key].amount = numAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }
      }

      if (key === 'other' && data.paymentMethods[key].name) {
        paymentMethods.value[key].name = data.paymentMethods[key].name
      }
    }
  })

  // เพิ่มบรรทัดนี้เพื่อ force re-render
  await nextTick()
}

    // 7. โหลด receiptList (ส่วนที่ 2)
    if (data.receiptList && Array.isArray(data.receiptList) && data.receiptList.length > 0) {
      morelist.value = data.receiptList.map((item, index) => ({
        id: index + 1,
        referenceNo: item.referenceNo || '',
        itemName: item.itemName || '',
        note: item.note || '',
        amount: item.amount || 0,
      }))

      await nextTick()

      // Format amount สำหรับแต่ละรายการ
      morelist.value.forEach((row) => {
        if (row.amount && row.amount > 0) {
          // ✅ แปลงเป็นตัวเลขก่อน format
          const numAmount =
            typeof row.amount === 'string'
              ? parseFloat(row.amount.toString().replace(/,/g, ''))
              : Number(row.amount)

          row.amount = numAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }
      })

      // Init TomSelect
      await nextTick()
      morelist.value.forEach((_, i) => {
        initItemNameTomSelect(i)
      })
    } else {
      // ถ้าไม่มี receiptList ให้เพิ่มแถวว่าง
      addRow()
    }

    console.log('✅ Load complete:', {
      mainCategory: mainCategory.value,
      subCategory: subCategory.value,
      subCategory2: subCategory2.value,
      sendmoney: formData.value.sendmoney,
      paymentMethods: paymentMethods.value,
      receiptList: morelist.value,
    })

    Swal.fire({
      icon: 'success',
      title: 'โหลดข้อมูลสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err) {
    console.error('❌ Load error:', err)
    Swal.fire({
      icon: 'error',
      title: 'ไม่พบข้อมูล',
      text: 'ไม่สามารถโหลดข้อมูลใบนำส่งได้',
      confirmButtonColor: '#DC2626',
    }).then(() => {
      router.push('/')
    })
  } finally {
    isLoading.value = false
  }
}

const initItemNameTomSelect = (index) => {
  const elementId = `itemName-${index}`

  setTimeout(() => {
    const el = document.getElementById(elementId)

    if (el && !el.tomselect) {
      const tomselect = new TomSelect(el, {
        create: true,
        placeholder: 'ระบุรายการ',
        allowEmptyOption: true,
        onChange(value) {
          morelist.value[index].itemName = value
          clearRowError(index, 'itemName')
        },
      })

      applyCSSToTomSelect(el)
      itemNameInstances.value[index] = tomselect
    }
  }, 100)
}

const applyCSSToTomSelect = (selectEl) => {
  const control = selectEl.tomselect.control
  control.style.height = '2.5rem'
  control.style.width = '100%'
  control.style.padding = '0 0.5rem'
  control.style.display = 'flex'
  control.style.alignItems = 'center'
  control.style.borderRadius = '0.375rem'
  control.style.border = '1px solid #6b7280'
  control.style.fontSize = '1rem'

  const input = control.querySelector('input')
  if (input) {
    input.style.fontSize = '1.01rem'
    input.style.height = '1rem'
    input.style.padding = '0.5rem'
  }
}

const clearRowError = (rowIndex, field) => {
  if (errors.value.rows?.[rowIndex]?.[field]) {
    if (morelist.value[rowIndex][field]) {
      delete errors.value.rows[rowIndex][field]

      if (Object.keys(errors.value.rows[rowIndex]).length === 0) {
        delete errors.value.rows[rowIndex]
      }
    }
  }
}
const netTotalAmount = computed(() => {
  let total = 0
  morelist.value.forEach((row) => {
    const cleanAmount = parseFloat(String(row.amount || '0').replace(/,/g, ''))
    if (!isNaN(cleanAmount)) {
      total += cleanAmount
    }
  })
  return total
})

// ✅ แก้ไข Validation Logic
const saveData = async () => {
  errors.value = {}
  let hasError = false

  // ========== Basic validation ==========
  if (!formData.value.fullName) {
    errors.value.fullName = 'กรุณากรอก "ชื่อ"'
    hasError = true
  }
  if (!formData.value.delNumber) {
    errors.value.delNumber = 'กรุณากรอก "เลขที่นำส่ง"'
    hasError = true
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก "เบอร์โทรติดต่อ"'
    hasError = true
  }
  if (!formData.value.fundName) {
    errors.value.fundName = 'กรุณาเลือก "กองทุน"'
    hasError = true
  }
  if (!mainCategory.value || mainCategory.value === 'เลือกทั้งหมด') {
    errors.value.mainCategory = 'กรุณาเลือก "หน่วยงาน"'
    hasError = true
  }

  if (hasAnySub.value && (!subCategory.value || subCategory.value === 'เลือกทั้งหมด')) {
    errors.value.subCategory = 'กรุณาเลือก "หน่วยงานรอง"'
    hasError = true
  }

  if (hasSub2.value && (!subCategory2.value || subCategory2.value === 'เลือกทั้งหมด')) {
    errors.value.subCategory2 = 'กรุณาเลือก "หน่วยงานย่อย"'
    hasError = true
  }

  if (!formData.value.sendmoney) {
    errors.value.sendmoney = 'กรุณาเลือก "ขอนำส่งเงิน"'
    hasError = true
  }
  if (!formData.value.projectCode) {
    errors.value.projectCode = 'กรุณากรอก "รหัสโครงงาน"'
    hasError = true
  }

  // ========== Row validation (ส่วนที่ 2) ==========
  errors.value.rows = {}
  morelist.value.forEach((row, index) => {
    const rowErrors = {}

    if (!row.itemName || row.itemName.trim() === '') {
      rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"'
    }

    if (!row.note || row.note.trim() === '') {
      rowErrors.note = 'กรุณากรอก "หมายเหตุ"'
    }

    // ตรวจสอบ amount
    const cleanAmount = parseFloat(String(row.amount || '').replace(/,/g, ''))
    if (!cleanAmount || cleanAmount <= 0) {
      rowErrors.amount = 'กรุณากรอก "จำนวนเงิน"'
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.value.rows[index] = rowErrors
      hasError = true
    }
  })

  // ========== Payment Methods validation (ส่วนที่ 3) ==========
  const totalSection2 = netTotalAmount.value
  const totalSection3 = paymentTotal.value
  const hasAnyPaymentMethod = Object.keys(paymentMethods.value).some(
    (key) => paymentMethods.value[key].checked,
  )
  if (!hasAnyPaymentMethod) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณาเลือกวิธีการนำส่งเงิน',
      text: 'โปรดเลือกวิธีการนำส่งเงินอย่างน้อย 1 วิธี (ส่วนที่ 3)',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
    })
    return
  }

  // ตรวจสอบว่ากรอกจำนวนเงินในวิธีที่เลือกแล้วหรือยัง
  let missingAmount = false
  // ✅ แก้ไขตรงนี้ - เพิ่ม .value
  Object.keys(paymentMethods.value).forEach((key) => {
    if (paymentMethods.value[key].checked) {
      const amount = paymentMethods.value[key].amount
      if (!amount || parseFloat(amount.toString().replace(/,/g, '')) <= 0) {
        missingAmount = true
      }
    }
  })

  if (missingAmount) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณากรอกจำนวนเงิน',
      text: 'โปรดกรอกจำนวนเงินในวิธีการนำส่งที่เลือกไว้ให้ครบถ้วน',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
    })
    return
  }

  // ตรวจสอบความเท่ากันของยอดเงิน
  const difference = Math.abs(totalSection2 - totalSection3)

  if (difference > 0.01) {
    Swal.fire({
      icon: 'error',
      title: 'จำนวนเงินไม่ตรงกัน',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 10px;">โปรดกรอกจำนวนเงินให้เท่ากัน</p>
          <hr style="margin: 15px 0;">
          <p style="font-weight: 600; color: #059669; margin-bottom: 8px;">
            ✓ ยอดรวมรายการ (ส่วนที่ 2): 
            <span style="float: right;">${totalSection2.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} บาท</span>
          </p>
          <p style="font-weight: 600; color: #DC2626; margin-bottom: 8px;">
            ✗ ยอดเงินนำส่ง (ส่วนที่ 3): 
            <span style="float: right;">${totalSection3.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} บาท</span>
          </p>
          <hr style="margin: 15px 0;">
          <p style="font-weight: 600; color: #7E22CE; margin-bottom: 0;">
            ส่วนต่าง: 
            <span style="float: right;">${difference.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} บาท</span>
          </p>
        </div>
      `,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#DC2626',
      width: '500px',
    })
    return
  }

  // ========== แสดง Error ถ้ามี ==========
  if (hasError) {
    Swal.fire({
      icon: 'error',
      title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      text: 'มีข้อมูลบางช่องที่ยังไม่ได้กรอกหรือกรอกไม่ถูกต้อง',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
    })
    return
  }

  // ========== เริ่มบันทึก ==========
  Swal.fire({
    title: isEditMode.value ? 'กำลังอัพเดตข้อมูล...' : 'กำลังบันทึกข้อมูล...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  const currentDateTime = new Date().toISOString()

  const paymentMethodsData = {}
  // ✅ แก้ไขตรงนี้ - เพิ่ม .value
  Object.keys(paymentMethods.value).forEach((key) => {
    if (paymentMethods.value[key].checked) {
      const cleanAmount = parseFloat(
        String(paymentMethods.value[key].amount || '0').replace(/,/g, ''),
      )

      paymentMethodsData[key] = {
        checked: true,
        amount: cleanAmount,
        ...(key === 'other' && { name: paymentMethods.value[key].name || '' }),
      }
    }
  })

  const payload = {
    delNumber: formData.value.delNumber,
    fullName: formData.value.fullName,
    moneyTypeNote: 'Waybill',
    phone: formData.value.phone,
    mainAffiliationName: mainCategory.value,
    subAffiliationName1: subCategory.value !== 'เลือกทั้งหมด' ? subCategory.value : '',
    subAffiliationName2: subCategory2.value !== 'เลือกทั้งหมด' ? subCategory2.value : '',
    fundName: formData.value.fundName,
    moneyType: formData.value.sendmoney,
    projectCode: formData.value.projectCode,
    sendmoney: formData.value.sendmoney,
    netTotalAmount: totalSection2,

    // ข้อมูลส่วนที่ 3
    paymentMethods: paymentMethodsData,
    totalPaymentAmount: totalSection3,

    receiptList: morelist.value.map((row) => {
      const cleanAmount = parseFloat(String(row.amount || '0').replace(/,/g, ''))

      return {
        itemName: row.itemName || '',
        note: row.note || '',
        referenceNo: row.referenceNo || '',
        amount: cleanAmount,
        subtotal: cleanAmount,
      }
    }),
  }

  if (isEditMode.value) {
    payload.id = receiptId.value // สำคัญมาก สำหรับ update
    payload.updatedAt = currentDateTime
  } else {
    // สำหรับสร้างใหม่ ให้สร้าง id ใหม่ (เช่น uuid หรือ timestamp + random)
    payload.id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
    payload.createdAt = currentDateTime
    payload.updatedAt = currentDateTime
  }

  try {
    let response
    if (isEditMode.value) {
      response = await axios.put(`/updateReceipt/${receiptId.value}`, payload)
    } else {
      response = await axios.post('/saveReceipt', payload)
    }

    await Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'อัพเดตสำเร็จ!' : 'บันทึกสำเร็จ!',
      text: `${isEditMode.value ? 'อัพเดต' : 'บันทึก'}ใบนำส่งเงิน ${formData.value.projectCode} เรียบร้อยแล้ว`,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
      timer: 2000,
      timerProgressBar: true,
    })

    router.push('/')
  } catch (err) {
    console.error('Error:', err)

    let errorMessage = isEditMode.value
      ? 'เกิดข้อผิดพลาดในการอัพเดตข้อมูล'
      : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'

    if (err.response) {
      if (err.response.status === 409) {
        errorMessage = 'รหัสโครงการนี้มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น'
      } else if (err.response.status === 400) {
        errorMessage = err.response.data.message || 'ข้อมูลไม่ถูกต้อง'
      } else {
        errorMessage = err.response.data.message || errorMessage
      }
    } else if (err.request) {
      errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
    } else {
      errorMessage = err.message
    }

    Swal.fire({
      icon: 'error',
      title: isEditMode.value ? 'อัพเดตไม่สำเร็จ' : 'บันทึกไม่สำเร็จ',
      text: errorMessage,
      confirmButtonText: 'ลองอีกครั้ง',
      confirmButtonColor: '#DC2626',
    })
  }
}

watch(
  () => [formData.value, mainCategory.value, subCategory.value, subCategory2.value],
  () => {
    for (const key in formData.value) {
      if (errors.value[key] && formData.value[key]) {
        delete errors.value[key]
      }
    }

    if (errors.value.mainCategory && mainCategory.value) {
      delete errors.value.mainCategory
    }

    if (errors.value.subCategory && subCategory.value) {
      delete errors.value.subCategory
    }

    if (errors.value.subCategory2 && subCategory2.value) {
      delete errors.value.subCategory2
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
/* Animated Background Mesh */
.mesh-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  background-image:
    radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%),
    radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 1) 0, transparent 50%),
    radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 1) 0, transparent 50%);
  background-size: cover;
  z-index: -2;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: -1;
  opacity: 0.8;
  animation: float 10s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #56ccf2;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #ac32e4;
  bottom: -50px;
  right: -100px;
  animation-delay: 2s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: #7918f2;
  top: 40%;
  left: 40%;
  animation-delay: 4s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(20px, 40px) rotate(10deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

/* Glassmorphism Utilities */
.glass-panel {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.glass-input {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.8);
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.glass-button-primary {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.glass-button-primary:hover {
  box-shadow: 0 6px 20px rgba(126, 34, 206, 0.4);
  transform: translateY(-1px);
}

/* Readonly Input Force Style */
.readonly-force input {
  pointer-events: none;
  background-color: #e9ecef !important;
  color: #6c757d !important;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

.swal2-container {
  z-index: 99999 !important;
}

.swal2-popup {
  z-index: 100000 !important;
}

.swal2-overlay {
  z-index: 99998 !important;
}

/* ถ้าใช้ Custom Modal */
[role='dialog'] {
  z-index: 99999 !important;
}
.readonly-force :deep(input) {
  pointer-events: none;
  background-color: #e9ecef;
  color: #6c757d;
}
.detail-toggle-bar {
  margin-top: 10px;
  padding: 8px 0;
  width: 100%;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  font-size: 0.75rem;
  color: #475569;

  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.85));

  border-top: 2px solid rgba(0, 0, 0, 0.05);
  border-radius: 0 0 12px 12px;

  transition: all 0.25s ease;
}

.detail-toggle-bar:hover {
  color: #2563eb;
  background: rgba(255, 255, 255, 0.95);
}
</style>
