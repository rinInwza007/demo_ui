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
              {{ isEditMode ? `เลขที่นำส่ง: ${formData.waybillNumber}` : 'กรอกข้อมูลใบนำส่งเงิน' }}
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
              <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>ส่วนที่ 1: ข้อมูลผู้บันทึก
              </h2>
    <!-- ปุ่ม Template -->
    <div class="flex gap-2">
      <button
        @click="showLoadDialog = true"
        class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
      >
        <i class="ph ph-folder-open text-lg"></i>
        <span class="text-base font-medium">โหลด Template</span>
      </button>
    </div>
    </div>
              <!-- แถวที่ 1: เลขที่นำส่ง | ชื่อ (แสดงเสมอ) -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    เลขที่นำส่ง <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    v-model="formData.waybillNumber"
                    placeholder="เลขที่นำส่ง"
                    class="transition-all duration-200"
                    @keypress="allowOnlyDigits"
                  />
                  <span v-if="errors.waybillNumber" class="text-red-600 text-xs">
                    {{ errors.waybillNumber }}
                  </span>
                </div>

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
              </div>

              <!-- แถวที่ 2: เบอร์โทรศัพท์ | หน่วยงาน (แสดงเสมอ) -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    หน่วยงาน <span class="text-red-500">*</span>
                  </label>
                  <Selects
                    v-model="mainCategory"
                    :options="mainCategoryOptions"
                    placeholder="เลือกหน่วยงาน"
                    value-type="string"
                  />
                  <span v-if="errors.mainCategory" class="text-red-600 text-xs">
                    {{ errors.mainCategory }}
                  </span>
                </div>
              </div>

              <!-- =========================== -->
              <!-- กรณีไม่มีหน่วยงานรอง -->
              <!-- =========================== -->
              <template v-if="!hasAnySub">
                <!-- แถวที่ 3: กองทุน | ขอนำส่งเงิน -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <!-- แถวที่ 4: รหัสโครงการ | ว่าง -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      รหัสโครงงาน <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="formData.projectCode"
                      placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    />
                  </div>
                  <!-- คอลัมน์ว่าง -->
                  <div></div>
                </div>
              </template>

              <!-- =========================== -->
              <!-- กรณีมีหน่วยงานรองแต่ไม่มีหน่วยงานย่อย -->
              <!-- =========================== -->
              <template v-if="hasAnySub && !hasSub2">
                <!-- แถวที่ 3: หน่วยงานรอง | กองทุน -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      หน่วยงานรอง <span class="text-red-500">*</span>
                    </label>
                    <Selects
                      v-model="subCategory"
                      :options="sub1OptionsForSelect"
                           option-label="label"  
                      option-value="value"  
                      placeholder="เลือกหน่วยงานรอง"
                      value-type="string"
                    />
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
                </div>

                <!-- แถวที่ 4: ขอนำส่งเงิน | รหัสโครงการ -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      class="mt-[2.5px]"
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
                      v-model="formData.projectCode"
                      placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    />
                  </div>
                </div>
              </template>

              <!-- =========================== -->
              <!-- กรณีมีหน่วยงานรองและหน่วยงานย่อย -->
              <!-- =========================== -->
              <template v-if="hasSub2">
                <!-- แถวที่ 3: หน่วยงานรอง | หน่วยงานย่อย -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      หน่วยงานรอง <span class="text-red-500">*</span>
                    </label>
                    <Selects
                      v-model="subCategory"
                      :options="sub1OptionsForSelect"
                          option-label="label"
    option-value="value"
                      placeholder="เลือกหน่วยงานรอง"
                      value-type="string"
                    />
                    <span v-if="errors.subCategory" class="text-red-600 text-xs">
                      {{ errors.subCategory }}
                    </span>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      หน่วยงานย่อย <span class="text-red-500">*</span>
                    </label>
                    <Selects
                      v-model="subCategory2"
                      :options="sub2OptionsForSelect"
                          option-label="label"
    option-value="value"
                      placeholder="เลือกหน่วยงานย่อย"
                      value-type="string"
                    />
                    <span v-if="errors.subCategory2" class="text-red-600 text-xs">
                      {{ errors.subCategory2 }}
                    </span>
                  </div>
                </div>

                <!-- แถวที่ 4: กองทุน | ขอนำส่งเงิน -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      รหัสโครงงาน <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="formData.projectCode"
                      placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    />
                  </div>
                  <div></div>
                </div>
              </template>
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
                class="hidden sm:grid sm:grid-cols-[0.3fr_0.6fr_1.5fr_0.7fr_0.6fr_0.2fr] gap-3 px-2 pb-2 border-b border-white/40 items-center text-center"
              >
                <div class="text-base font-semibold text-slate-600 uppercase">ลำดับ</div>
                <div class="text-base font-semibold text-slate-600 uppercase">เลขที่อ้างอิง</div>
                <div class="text-base font-semibold text-slate-600 uppercase">รายการ</div>
                <div class="text-base font-semibold text-slate-600 uppercase">ประเภท</div>
                <div class="text-base font-semibold text-slate-600 uppercase">จำนวนเงิน</div>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  class="bg-white/20 rounded-xl p-4 border border-white/50 transition-all"
                >
                  <div
                    class="grid grid-cols-1 sm:grid-cols-[0.2fr_1fr_2.5fr_1fr_1fr_auto] gap-3 items-start"
                  >
                    <div class="flex items-center justify-center ml-2 mr-5">
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
  @input="(value) => handleItemNameChange(index, value)"
  :input-id="`itemName-${index}`"
  waybill-type="all"
  department="general"
/>

                      <span
                        v-if="errors.rows?.[index]?.itemName"
                        class="text-red-600 text-xs ml-32"
                      >
                        {{ errors.rows[index].itemName }}
                      </span>
                    </div>

                    <div class="flex items-center justify-center mt-6 -ml-5">
                      <label class="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          v-model="row.isExpense"
                          @change="() => handleExpenseToggle(index)"
                          class="w-5 h-5 rounded border-2 border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer transition-all"
                        />
                        <span
                          class="text-sm font-medium transition-colors"
                          :class="row.isExpense ? 'text-red-600' : 'text-gray-500'"
                        >
                          รายจ่าย
                        </span>
                      </label>
                    </div>

                    <div class="flex flex-col gap-1.5 mt-2">
                      <div class="flex flex-col gap-1.5">
                        <InputText
                          :model-value="formatDisplayAmount(row.amount)"
                          @input="(e) => handleAmountInput(index, e)"
                          @blur="() => formatAmountOnBlur(index)"
                          placeholder="จำนวนเงิน"
                        />
                        <span
                          v-if="errors.rows?.[index]?.amount"
                          class="text-red-600 text-xs -mt-1 ml-8"
                        >
                          {{ errors.rows[index].amount }}
                        </span>
                      </div>
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
                  class="border-2 border-dashed text-xl  border-[#7E22CE] rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
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
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
      <span class="w-1 h-6 bg-red-500 rounded-full"></span>ส่วนที่ 3: การนำส่งเงิน
    </h2>
    <span class="text-xs text-slate-600 bg-white/60 px-3 py-1 rounded-full">
      {{ bankTransferCount + (paymentMethods.cash.checked ? 1 : 0) + (paymentMethods.check.checked ? 1 : 0) + (paymentMethods.debtor.checked ? 1 : 0) + (paymentMethods.other.checked ? 1 : 0) }} รายการ
    </span>
  </div>

  <div class="space-y-4">
    <!-- 🏦 รายการธนาคาร (Dynamic) -->
<div
  v-for="(bank, index) in bankTransfers"
  :key="bank.id"
  class="bg-white/40 rounded-xl p-4 border border-white/50 transition-all"
>
  <div
    class="grid grid-cols-[1.2fr_1.2fr_1fr_0.2fr] gap-3 items-start"
  >
    <!-- เลขบัญชี -->
    <div class="flex flex-col gap-1.5">
      <BankAccountSelect
      placeholder="กรอกเลขบัญชี"
        v-model="bank.accountData"
        :input-id="`bank-account-${bank.id}`"
        :error-message="errors.bankTransfers?.[index]?.accountNumber"
        :bank-account-options="bankAccountOptions"
        @change="() => clearBankError(index, 'accountNumber', errors)"
      />
    </div>

    <!-- จำนวนเงิน -->
    <div class="flex items-center gap-2 whitespace-nowrap ml-10 mt-3">
      <span class="text-sm text-slate-700">จำนวนเงิน</span>
      <InputText
        :model-value="formatDisplayPaymentAmount(bank.amount)"
        @input="(e) => handleBankAmountInput(index, e)"
        @blur="() => formatBankAmountOnBlur(index)"
        placeholder="0.00"
        class="w-40"
      />
      <span class="text-sm text-slate-700">บาท</span>
    </div>

    <!-- ปุ่มลบ -->
    <button
      @click="removeBankTransfer(index)"
      class="px-3 py-2 mt-5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 self-start"
      title="ลบรายการ"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
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


    <!-- ปุ่มเพิ่มรายการธนาคาร -->
    <button
      @click="addBankTransfer"
      class="w-full border-2 border-dashed border-red-500 rounded-lg py-3 text-gray-600 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      เพิ่มรายการธนาคาร
    </button>

    <!-- เส้นแบ่ง -->
    <div class="border-t border-white/40 my-4"></div>

    <!-- เงินสด -->
    <div class="bg-white/40 rounded-xl p-4 border border-white/50">
      <div class="flex items-start gap-3">
        <input
          type="checkbox"
          v-model="paymentMethods.cash.checked"
          class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <div class="flex-1 space-y-2">
          <div class="font-medium text-slate-800">เงินสด</div>
          <div class="flex items-center justify-between gap-4">
            <div class="text-sm text-slate-600">ชำระเป็นเงินสด</div>
            <div class="flex flex-col items-end whitespace-nowrap">
              <div class="flex items-center gap-2">
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
                  class="w-40 transition-all duration-200"
                />
                <span class="text-sm text-slate-700">บาท</span>
              </div>
              <span
                v-if="errors.paymentMethods?.cash?.amount"
                class="text-red-600 text-xs text-right mr-16"
              >
                {{ errors.paymentMethods.cash.amount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- เช็ค -->
    <div class="bg-white/40 rounded-xl p-4 border border-white/50">
      <div class="flex gap-3">
        <input
          type="checkbox"
          v-model="paymentMethods.check.checked"
          class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <div class="flex-1 space-y-3">
          <div class="font-medium text-slate-800">เช็ค</div>
          <div class="flex gap-3">
            <div class="lg:col-span-2 w-60 gap-1">
              <label class="text-xs font-medium text-gray-600">ชื่อธนาคาร</label>
              <Selects
                v-model="paymentMethods.check.bankName"
                :options="bankOptions"
                option-label="label"
                option-value="value"
                :disabled="!paymentMethods.check.checked"
                placeholder="เลือกธนาคาร"
                value-type="string"
                :class="{
                  'opacity-50 cursor-not-allowed pointer-events-none':
                    !paymentMethods.check.checked,
                }"
                class="mb-2"
              />
              <span
                v-if="errors.paymentMethods?.check?.bankName"
                class="text-red-600 text-xs"
              >
                {{ errors.paymentMethods.check.bankName }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-600">เลขที่เช็ค</label>
              <InputText
                v-model="paymentMethods.check.checkNumber"
                :readonly="!paymentMethods.check.checked"
                :class="{
                  'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                    !paymentMethods.check.checked,
                }"
                placeholder="ระบุเลขที่เช็ค"
                @keypress="allowOnlyDigits"
              />
              <span
                v-if="errors.paymentMethods?.check?.checkNumber"
                class="text-red-600 text-xs"
              >
                {{ errors.paymentMethods.check.checkNumber }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-600">เลขที่ในเช็ค</label>
              <InputText
                v-model="paymentMethods.check.NumIncheck"
                :readonly="!paymentMethods.check.checked"
                :class="{
                  'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                    !paymentMethods.check.checked,
                }"
                placeholder="ระบุเลขที่ในเช็ค"
              />
              <span
                v-if="errors.paymentMethods?.check?.NumIncheck"
                class="text-red-600 text-xs"
              >
                {{ errors.paymentMethods.check.NumIncheck }}
              </span>
            </div>
            <div class="flex flex-col items-end whitespace-nowrap ml-[65px] mt-5">
              <div class="flex items-center gap-2">
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
                  class="w-40 transition-all duration-200"
                />
                <span class="text-sm text-slate-700">บาท</span>
              </div>
              <span
                v-if="errors.paymentMethods?.check?.amount"
                class="text-red-600 text-xs text-right mr-16"
              >
                {{ errors.paymentMethods.check.amount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ลูกหนี้ -->
    <div class="bg-white/40 rounded-xl p-4 border border-white/50">
      <div class="flex items-center gap-3">
        <input
          type="checkbox"
          v-model="paymentMethods.debtor.checked"
          class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <div class="flex-1 font-medium text-slate-800">ลูกหนี้</div>
        <div class="flex flex-col items-end whitespace-nowrap">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-700">จำนวนเงิน</span>
            <InputText
              :model-value="formatDisplayPaymentAmount(paymentMethods.debtor.amount)"
              @input="(e) => handlePaymentAmountInput('debtor', e)"
              @blur="() => formatPaymentAmountOnBlur('debtor')"
              :readonly="!paymentMethods.debtor.checked"
              :class="{
                'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                  !paymentMethods.debtor.checked,
              }"
              placeholder="0.00"
              class="w-40 transition-all duration-200"
            />
            <span class="text-sm text-slate-700">บาท</span>
          </div>
          <span
            v-if="errors.paymentMethods?.debtor?.amount"
            class="text-red-600 text-xs text-right mr-16"
          >
            {{ errors.paymentMethods.debtor.amount }}
          </span>
        </div>
      </div>
    </div>

    <!-- อื่น ๆ -->
    <div class="bg-white/40 rounded-xl p-4 border border-white/50">
      <div class="flex items-start gap-3">
        <input
          type="checkbox"
          v-model="paymentMethods.other.checked"
          class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <div class="font-medium text-slate-800 whitespace-nowrap">อื่น ๆ</div>
        <div class="flex flex-col gap-1">
          <InputText
            v-model="paymentMethods.other.name"
            :disabled="!paymentMethods.other.checked"
            placeholder="ระบุประเภท"
            class="w-56"
            :class="{
              'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100':
                !paymentMethods.other.checked,
            }"
          />
          <span v-if="errors.paymentMethods?.other?.name" class="text-red-600 text-xs">
            {{ errors.paymentMethods.other.name }}
          </span>
        </div>
        <div class="ml-auto flex flex-col items-end whitespace-nowrap">
          <div class="flex items-center gap-2">
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
              class="w-40 transition-all duration-200"
            />
            <span class="text-sm text-slate-700">บาท</span>
          </div>
          <span
            v-if="errors.paymentMethods?.other?.amount"
            class="text-red-600 text-xs text-right mr-16"
          >
            {{ errors.paymentMethods.other.amount }}
          </span>
        </div>
      </div>
    </div>

    <!-- สรุปยอดเงินรวม -->
    <div class="bg-red-500 rounded-xl p-4 mt-4">
      <div class="flex justify-between items-center">
        <span class="text-lg font-bold text-white">ยอดเงินนำส่งทั้งสิ้น</span>
        <span class="text-2xl font-bold text-white">{{ formattedPaymentTotal }} บาท</span>
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
        @click="showSaveDialog = true"
        class="flex items-center mr-[742px] gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
      >
        <i class="ph ph-floppy-disk text-lg"></i>
        <span class="text-base font-medium">บันทึก Template</span>
      </button>
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

<!-- 💾 Dialog บันทึก Template -->
<div v-if="showSaveDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="glass-panel rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-slate-800">บันทึก Template</h3>
      <button @click="showSaveDialog = false; templateName = ''" class="text-slate-500 hover:text-slate-700">
        <i class="ph ph-x text-2xl"></i>
      </button>
    </div>
    
    <div class="space-y-4">
      <!-- ✅ แสดงข้อมูล User -->
      <div class="bg-purple-50 rounded-lg p-3 text-sm">
        <p class="font-semibold text-purple-900 mb-1">👤 บันทึกสำหรับ:</p>
        <p class="text-purple-800">{{ authStore.user?.fullName }}</p>
        <p class="text-purple-700 text-xs">{{ authStore.user?.affiliation }}</p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อ Template</label>
        <InputText
          v-model="templateName"
          placeholder="เช่น: งานการเงิน - ทันตแพทย์"
          class="w-full"
          @keyup.enter="saveTemplate"
        />
      </div>
      
      <!-- แสดงข้อมูลที่จะบันทึก -->
      <div class="bg-blue-50 rounded-lg p-3 text-sm">
        <p class="font-semibold text-blue-900 mb-2">📋 ข้อมูลที่จะบันทึก:</p>
        <ul class="space-y-1 text-blue-800">
          <li>✓ ชื่อ-นามสกุล</li>
          <li>✓ เบอร์โทร</li>
          <li>✓ หน่วยงาน (ทั้ง 3 ระดับ)</li>
          <li>✓ กองทุน</li>
          <li>✓ ขอนำส่งเงิน</li>
          <li>✓ รหัสโครงการ</li>
            <li>✓ รายการนำส่งเงิน ({{ morelist.filter(r => r.itemName).length }} รายการ)</li>
        </ul>
      </div>
      
      <div class="flex gap-3">
        <button
          @click="showSaveDialog = false; templateName = ''"
          class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
        >
          ยกเลิก
        </button>
        <button
          @click="saveTemplate"
          class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
        >
          บันทึก
        </button>
      </div>
    </div>
  </div>
</div>


<!-- 📂 Dialog โหลด Template -->
<div v-if="showLoadDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="glass-panel rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-slate-800">โหลด Template</h3>
      <button @click="showLoadDialog = false; searchTerm = ''" class="text-slate-500 hover:text-slate-700">
        <i class="ph ph-x text-2xl"></i>
      </button>
    </div>
    
    <!-- ช่องค้นหา -->
    <div class="mb-4">
      <div class="relative">
        <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="ค้นหา Template..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
    
    <!-- ✅ รายการ Templates (เพิ่ม overflow-y-auto) -->
    <div class="flex-1 overflow-y-auto space-y-3 pr-2">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="bg-white/40 rounded-xl p-4 border border-white/50 hover:bg-white/60 transition-all group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h4 class="font-semibold text-slate-800">{{ template.name }}</h4>
              <!-- ✅ แสดงคณะ -->
              <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {{ template.affiliationName || authStore.user?.affiliation }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div><span class="font-medium">ชื่อ:</span> {{ template.data.fullName || '-' }}</div>
              <div><span class="font-medium">เบอร์:</span> {{ template.data.phone || '-' }}</div>
              <div><span class="font-medium">หน่วยงาน:</span> {{ template.data.mainCategory || '-' }}</div>
              <div><span class="font-medium">กองทุน:</span> {{ template.data.fundName || '-' }}</div>
              <div class="col-span-2">
                <span class="font-medium">รายการ:</span> 
                {{ template.data.receiptItems?.length || 0 }} รายการ
                <span v-if="template.data.receiptItems?.length > 0" class="text-xs text-gray-500">
                  ({{ template.data.receiptItems.map(r => r.itemName).join(', ').substring(0, 50) }}...)
                </span>
              </div>
            </div>
            
            <!-- ✅ แสดงใครสร้าง -->
            <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>
                <i class="ph ph-user"></i> {{ template.userName || authStore.user?.fullName }}
              </span>
              <span>
                <i class="ph ph-calendar"></i> {{ new Date(template.createdAt).toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) }}
              </span>
            </div>
          </div>
          
          <div class="flex gap-2 ml-4">
            <button
              @click="loadTemplate(template)"
              class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              title="โหลด Template"
            >
              <i class="ph ph-download-simple"></i>
            </button>
            <button
              @click="deleteTemplate(template.id)"
              class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              title="ลบ Template"
            >
              <i class="ph ph-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- แสดงเมื่อไม่มี Template -->
      <div v-if="filteredTemplates.length === 0" class="text-center py-8 text-gray-500">
        <i class="ph ph-folder-open text-4xl mb-2"></i>
        <p>{{ searchTerm ? 'ไม่พบ Template ที่ค้นหา' : 'ยังไม่มี Template' }}</p>
      </div>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick ,reactive} from 'vue'
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
import { departmentOptions } from '@/components/data/TSdepartments'
import { getAllOptions , isReceivableItem ,getItemByName,getItemById } from '@/components/data/ItemNameOption'
import { useReceiptStore } from '@/stores/recipt'
import { useRowManager } from '@/components/Function/FuncForm'
import { useBankTransferManager } from '@/components/Function/FuncBank'
import { setupAxiosMock } from '@/fake/mockAxios'
import { useAuthStore } from '@/stores/auth'
import BankAccountSelect from '@/components/TomSelect/BankAccountSelect.vue'
// Initialize
const route = useRoute()
const router = useRouter()
const reciptStore = useReceiptStore()
setupAxiosMock()
const authStore = useAuthStore()
// Check if edit mode
const isEditMode = computed(() => !!route.params.id)
const receiptId = computed(() => route.params.id)
const isLoading = ref(false)
const mainCategory = ref('')
const subCategory = ref('')
const subCategory2 = ref('')
const mainCategoryId = ref('')
const subCategoryId = ref('')
const subCategoryId2 = ref('')
const subId = ref('')

const { allowOnlyDigits, updateItemId, morelist, addRow, removeRow, handleTypeChange, formattedTotalAmount } =
  useRowManager()

const {
  // States
  bankTransfers,
  formatBankAmountOnBlur,
  // Actions
  addBankTransfer,
  removeBankTransfer,
  handleBankAmountInput,
  loadBankTransfers,
  getBankTransfersData,
  clearBankError,
  bankTransferCount,
  totalBankAmount,
} = useBankTransferManager()
// Form data
const formData = ref({
  waybillNumber: '',
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
const form = reactive({
  mainId: '',
  mainName: '',
  subId: '',
  subName: '',
  sub2Id: '',
  sub2Name: '',
})
const bankOptions = [
  { label: 'ธนาคารกรุงไทย', value: 'ธนาคารกรุงไทย' },
  { label: 'ธนาคารกสิกรไทย', value: 'ธนาคารกสิกรไทย' },
  { label: 'ธนาคารไทยพาณิชย์', value: 'ธนาคารไทยพาณิชย์' },
  { label: 'ธนาคารกรุงเทพ', value: 'ธนาคารกรุงเทพ' },
  { label: 'ธนาคารทหารไทยธนชาต', value: 'ธนาคารทหารไทยธนชาต' },
]
const bankAccountOptions = ref([
  {
    accountNumber: '671-2-90667-9',
    bankName: 'ธนาคารกรุงไทย',
    accountName: 'โรงพยาบาลมหาวิทยาลัยพะเยา',
  },
  {
    accountNumber: '671-2-90668-9',
    bankName: 'ธนาคารกรุงไทย',
    accountName: 'มหาวิทยาลัยพะเยา (กองทุนทั่วไป)',
  },
  {
    accountNumber: '662-0-96023-5',
    bankName: 'ธนาคารกรุงไทย',
    accountName: 'กองทุนเพื่อการจัดตั้งธนาคารเลือด',
  },
  {
    accountNumber: '123-4-56789-0',
    bankName: 'ธนาคารไทยพาณิชย์',
    accountName: 'มหาวิทยาลัยพะเยา',
  },
])
const sub1OptionsForSelect = computed(() =>
  sub1OptionsArray.value.map(opt => ({
    label: opt.name,   // โชว์
    value: opt.id     // เก็บ
  }))
)
const sub2OptionsForSelect = computed(() => {
  return sub2OptionsArray.value.map(opt => ({
    label: opt.name,
    value: opt.id ?? opt.name,
  }))
})
const mainCategoryOptions = computed(() => {
  if (!departmentOptions) return []
  return Object.keys(departmentOptions)
})

watch(subId, (id) => {
  const found = sub1OptionsArray.value.find(o => o.id === id)
  form.subName = found?.name ?? ''
})
const handleItemNameChange = (index, itemName) => {
  morelist.value[index].itemName = itemName
  
  // ✅ อัพเดท itemId เมื่อเลือกรายการ
  const item = getItemByName(itemName)
  if (item) {
    updateItemId(index, item.id)
    console.log(`📝 Item selected: ${item.name} (ID: ${item.id})`)
  } else {
    updateItemId(index, null)
  }
  
  clearRowError(index, 'itemName')
  updateDebtorAmount()
}
watch(
  () => morelist.value.map(row => ({ 
    id: row.id, 
    itemId: row.itemId, 
    itemName: row.itemName 
  })),
  (newVal) => {
    console.log('📋 MoreList State:', newVal)
  },
  { deep: true }
)

watch(
  () => ({ 
    mainId: mainCategoryId.value, 
    mainName: mainCategory.value,
    subId: subCategoryId.value,
    subName: subCategory.value,
    sub2Id: subCategoryId2.value,
    sub2Name: subCategory2.value
  }),
  (newVal) => {
    console.log('🏢 Categories State:', newVal)
  },
  { deep: true }
)
//ส่วนของtemplate --------------------------------------------------------------------------


const templates = ref([])
const showSaveDialog = ref(false)
const showLoadDialog = ref(false)
const templateName = ref('')
const searchTerm = ref('')

const getTemplateStorageKey = () => {
  if (!authStore.user) return null
  // ใช้ affiliationId + userId เป็น key
  return `waybill_templates_${authStore.user.affiliationId}_${authStore.user.id}`
}

onMounted(() => {
  const saved = localStorage.getItem('waybill_templates')
  if (saved) {
    templates.value = JSON.parse(saved)
  }
})

// ✅ บันทึก Template (รวมรายการนำส่งเงิน)
const saveTemplate = () => {
  if (!templateName.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณาตั้งชื่อ Template',
      confirmButtonColor: '#7E22CE'
    })
    return
  }

  // ✅ ตรวจสอบว่า Login อยู่หรือไม่
  if (!authStore.user) {
    Swal.fire({
      icon: 'error',
      title: 'กรุณา Login ก่อน',
      confirmButtonColor: '#DC2626'
    })
    return
  }

  // ✅ เก็บเฉพาะชื่อรายการที่มีข้อมูล (ไม่เอาเลขที่อ้างอิงและจำนวนเงิน)
  const receiptItems = morelist.value
    .filter(row => row.itemName && row.itemName.trim() !== '')
    .map(row => ({
      itemName: row.itemName,
      isExpense: row.isExpense || false
    }))

  const template = {
    id: Date.now(),
    name: templateName.value.trim(),
    data: {
      fullName: formData.value.fullName,
      phone: formData.value.phone,
      mainCategoryId: mainCategoryId.value,
      mainCategory: mainCategory.value,
      subCategoryId: subCategoryId.value,
      subCategory: subCategory.value,
      subCategoryId2: subCategoryId2.value,
      subCategory2: subCategory2.value,
      fundName: formData.value.fundName,
      sendmoney: formData.value.sendmoney,
      projectCode: formData.value.projectCode,
            receiptItems: receiptItems.map(item => ({
        itemId: getItemByName(item.itemName)?.id,
        itemName: item.itemName,
        isExpense: item.isExpense
      }))
    },
    userId: authStore.user.id,
    userName: authStore.user.fullName,
    affiliationId: authStore.user.affiliationId,
    affiliationName: authStore.user.affiliation,
    createdAt: new Date().toISOString()
  }

  templates.value.push(template)
  
  // ✅ บันทึกลง localStorage ของ User นี้
  const storageKey = getTemplateStorageKey()
  if (storageKey) {
    localStorage.setItem(storageKey, JSON.stringify(templates.value))
  }
  
  templateName.value = ''
  showSaveDialog.value = false
  
  Swal.fire({
    icon: 'success',
    title: 'บันทึก Template สำเร็จ!',
    text: `สำหรับ ${authStore.user.affiliation}`,
    timer: 1500,
    showConfirmButton: false
  })
}

// ✅ โหลด Template (รวมรายการนำส่งเงิน)
const loadTemplate = async (template) => {
  formData.value.fullName = template.data.fullName
  formData.value.phone = template.data.phone
  formData.value.fundName = template.data.fundName
  formData.value.sendmoney = template.data.sendmoney
  formData.value.projectCode = template.data.projectCode
  
  if (template.data.mainCategoryId) {
    mainCategoryId.value = template.data.mainCategoryId
    mainCategory.value = template.data.mainCategory
    await nextTick()
  }
  
  if (template.data.subCategoryId) {
    subCategoryId.value = template.data.subCategoryId
    subCategory.value = template.data.subCategoryId
    await nextTick()
  }
  
  if (template.data.subCategoryId2) {
    subCategoryId2.value = template.data.subCategoryId2
    subCategory2.value = template.data.subCategoryId2
    await nextTick()
  }
  
  // ✅ ล้าง morelist เก่าทิ้งก่อน
  morelist.value = []
  await nextTick()
  
  // ✅ โหลดรายการนำส่งเงิน (เฉพาะชื่อรายการ)
  if (template.data.receiptItems && template.data.receiptItems.length > 0) {
    morelist.value = template.data.receiptItems.map((item, index) => {
      const itemData = item.itemId ? getItemById(item.itemId) : getItemByName(item.itemName)
      return {
        id: index + 1,
        referenceNo: '',
        itemName: itemData?.name || item.itemName,
        itemId: itemData?.id,
        note: '',
        amount: '',
        type: item.isExpense ? 'expense' : 'income',
        isExpense: item.isExpense || false
      }
    })
  } else {
    // ✅ ถ้าไม่มีรายการใน template ให้สร้างแถวว่าง 2 แถว (เหมือนตอนเริ่มต้น)
    addRow()
    addRow()
  }
  
  showLoadDialog.value = false
  
  Swal.fire({
    icon: 'success',
    title: 'โหลด Template สำเร็จ!',
    timer: 1500,
    showConfirmButton: false
  })
}

// ✅ ลบ Template
const deleteTemplate = (id) => {
  Swal.fire({
    title: 'ยืนยันการลบ?',
    text: 'คุณต้องการลบ Template นี้หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      templates.value = templates.value.filter(t => t.id !== id)
      
      // ✅ อัพเดท localStorage ของ User นี้
      const storageKey = getTemplateStorageKey()
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(templates.value))
      }
      
      Swal.fire({
        icon: 'success',
        title: 'ลบ Template สำเร็จ!',
        timer: 1500,
        showConfirmButton: false
      })
    }
  })
}

// ✅ กรอง Template
const filteredTemplates = computed(() => {
  if (!searchTerm.value) return templates.value
  return templates.value.filter(t => 
    t.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})


//--------------------------------------------------------------------------------------------

const handleExpenseToggle = (index) => {
  // เมื่อ toggle checkbox จะเปลี่ยน type
  morelist.value[index].type = morelist.value[index].isExpense ? 'expense' : 'income'
}

const paymentMethods = ref({
  krungthai1: { checked: false, amount: '' },
  krungthai2: { checked: false, amount: '' },
  krungthai3: { checked: false, amount: '' },
  cash: { checked: false, amount: '' },
  check: {
    checked: false,
    amount: '',
    bankName: '', // ✅ เพิ่ม
    checkNumber: '', // ✅ เพิ่ม
    NumIncheck: '', // ✅ เพิ่ม
  },
  debtor: { checked: false, amount: '' },
  other: { checked: false, name: '', amount: '' },
})

//เกี่ยวกับคณะที่เลือกเองตามสิทธิ
const mapAffiliationToMainCategory = (affiliationId) => {
  const mapping = {
    ENG: 'คณะวิศวกรรมศาสตร์',
    NUR: 'คณะพยาบาลศาสตร์',
    DEN: 'คณะทันตแพทยศาสตร์',
    HOS: 'โรงพยาบาลมหาวิทยาลัยพะเยา',
    MED: 'คณะแพทยศาสตร์',
    PHA: 'คณะเภสัชศาสตร์',
    FIN: '', // กองคลัง ไม่ต้องเลือกให้
    UP: '', // มหาวิทยาลัย ไม่ต้องเลือกให้
  }

  return mapping[affiliationId] || ''
}
const updateDebtorAmount = () => {
  if (!morelist.value?.length || !paymentMethods.value?.debtor) return
  
  const totalDebtor = morelist.value
    .filter(row => row?.itemName && isReceivableItem(row.itemName))
    .reduce((sum, row) => {
      const amount = parseFloat(String(row.amount || '0').replace(/,/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  
  paymentMethods.value.debtor.checked = totalDebtor > 0
  paymentMethods.value.debtor.amount = totalDebtor > 0 ? 
    totalDebtor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
}

// ✅ Watch รายการเพื่ออัพเดทลูกหนี้
watch(
  () => morelist.value.map(row => ({ itemName: row.itemName, amount: row.amount })),
  () => {
    nextTick(() => {
      updateDebtorAmount()
    })
  },
  { deep: true, flush: 'post' } // ⭐ เพิ่ม flush: 'post'
)
onMounted(async () => {
  // ✅ ถ้าเป็น edit mode ให้โหลดข้อมูล
  if (isEditMode.value) {
    await loadReceiptData()
  } else {
    // ✅ ถ้าเป็นโหมดสร้างใหม่และมี affiliationId
    if (authStore.user?.affiliationId) {
      const defaultCategory = mapAffiliationToMainCategory(authStore.user.affiliationId)
      if (defaultCategory) {
        mainCategory.value = defaultCategory
        const categoryData = departmentOptions[defaultCategory]
        mainCategoryId.value = categoryData?.id || ''
        await nextTick()
      }
    }
    
    // ✅ เพิ่มแถวว่าง 2 แถว
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
  updateDebtorAmount()

  loadUserTemplates()
})


const loadUserTemplates = () => {
  const storageKey = getTemplateStorageKey()
  if (!storageKey) return

  const saved = localStorage.getItem(storageKey)
  if (saved) {
    try {
      templates.value = JSON.parse(saved)
    } catch (error) {
      console.error('Error loading templates:', error)
      templates.value = []
    }
  }
}
// เพิ่ม computed สำหรับคำนวณยอดรวมส่วนที่ 3
const paymentTotal = computed(() => {
  let total = totalBankAmount.value // จากธนาคาร

  Object.keys(paymentMethods.value).forEach((key) => {
    const method = paymentMethods.value[key]
    if (method.checked && method.amount) {
      const cleanAmount = String(method.amount).replace(/,/g, '')
      const numAmount = Number(cleanAmount)
      if (!isNaN(numAmount)) {
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
  updateDebtorAmount()
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
  updateDebtorAmount()
}
const itemNameInstances = ref({})
const errors = ref({
  paymentMethods: {},
  bankTransfers: {},
})
const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

// ✅ Computed Properties
const sub1OptionsArray = computed(() => {
  if (!mainCategory.value) return []

  const data = departmentOptions[mainCategory.value]

  if (!data || !Array.isArray(data.main)) {
    return []
  }

  return data.main
})

const sub2OptionsArray = computed(() => {
  if (!mainCategory.value || !subCategory.value) return []

  const data = departmentOptions[mainCategory.value]

  if (!data || !Array.isArray(data.subs)) {
    return []
  }

  return data.subs
})


const hasAnySub = computed(() => {
  if (!mainCategory.value) return false
  const data = departmentOptions[mainCategory.value]
  if (!data) return false

  const main = data.main
  return main !== null && (typeof main === 'string' || (Array.isArray(main) && main.length > 0))
})

const hasSub2 = computed(() => {
  if (!mainCategory.value || !subCategory.value) return false
  const data = departmentOptions[mainCategory.value]
  if (!data) return false

  const subs = data.subs
  return Array.isArray(subs) && subs.length > 0
})


watch(mainCategory, (newVal) => {
  const data = departmentOptions[newVal]
  mainCategoryId.value = data?.id || ''
  subCategory.value = ''
  subCategoryId.value = ''
  subCategory2.value = ''
  subCategoryId2.value = ''
})

watch(subCategory, (newVal) => {
  if (!newVal) {
    subCategoryId.value = ''
    subCategory2.value = ''
    subCategoryId2.value = ''
    return
  }
  subCategoryId.value = newVal
  subCategory2.value = ''
  subCategoryId2.value = ''
  console.log('🏢 subCategory changed:', { id: newVal, name: sub1OptionsArray.value.find(o => o.id === newVal)?.name })
})

watch(subCategory2, (newVal) => {
  if (!newVal) {
    subCategoryId2.value = ''
    return
  }
  subCategoryId2.value = newVal
  console.log('🏢 subCategory2 changed:', { id: newVal, name: sub2OptionsArray.value.find(o => o.id === newVal)?.name })
})

const gotomainpage = () => {
  router.push('/indexwaybill')
}

const loadReceiptData = async () => {
  if (!receiptId.value) return

  isLoading.value = true
  try {
    // ✅ เปลี่ยนจาก /getReceipt เป็น /findOneReceipt
    const response = await axios.get(`/findOneReceipt/${receiptId.value}`)
    
    // ✅ ข้อมูลจะอยู่ใน response.data โดยตรง (ไม่ใช่ array)
    const data = response.data

    if (!data) throw new Error('Receipt not found')

    console.log('📦 Loaded receipt data:', data)

    // 1. ล้างค่าเก่า
    mainCategory.value = ''
    subCategory.value = ''
    subCategory2.value = ''
    formData.value.sendmoney = ''

    // ✅ ล้างค่า paymentMethods อย่างถูกต้อง (ย้ายมาไว้ก่อน section อื่น)
    paymentMethods.value = {
      cash: { checked: false, amount: '' },
      check: { checked: false, amount: '', bankName: '', checkNumber: '', NumIncheck: '' },
      debtor: { checked: false, amount: '' },
      other: { checked: false, name: '', amount: '' },
    }

    morelist.value = []
    await nextTick()

    // 2-5. โหลดข้อมูลพื้นฐาน
    formData.value.waybillNumber = data.waybillNumber || ''
    formData.value.fullName = data.fullName || ''
    formData.value.phone = data.phone || ''
    formData.value.fundName = data.fundName || ''
    formData.value.projectCode = data.projectCode || ''
    formData.value.sendmoney = data.sendmoney || data.moneyType || ''

    // 3-5. โหลด categories
    if (data.mainAffiliationId && data.mainAffiliationName) {
      mainCategoryId.value = data.mainAffiliationId
      mainCategory.value = data.mainAffiliationName
      console.log('✅ Load mainCategory:', { id: mainCategoryId.value, name: mainCategory.value })
      await nextTick()
    } else if (data.mainAffiliationName) {
      // fallback: หา id จาก name
      mainCategory.value = data.mainAffiliationName
      const categoryData = departmentOptions[data.mainAffiliationName]
      mainCategoryId.value = categoryData?.id || ''
      await nextTick()
    }

    if (data.subAffiliationId1) {
      subCategoryId.value = data.subAffiliationId1
      subCategory.value = data.subAffiliationId1
      console.log('✅ Load subCategory:', { id: subCategoryId.value, value: subCategory.value })
      await nextTick()
    } else if (data.subAffiliationName1) {
      const found = sub1OptionsArray.value.find(opt => opt.name === data.subAffiliationName1)
      if (found) {
        subCategoryId.value = found.id
        subCategory.value = found.id
        console.log('✅ Load subCategory (fallback):', { id: found.id, name: found.name })
      }
      await nextTick()
    }

    if (data.subAffiliationId2) {
      subCategoryId2.value = data.subAffiliationId2
      subCategory2.value = data.subAffiliationId2
      console.log('✅ Load subCategory2:', { id: subCategoryId2.value, value: subCategory2.value })
      await nextTick()
    } else if (data.subAffiliationName2) {
      const found = sub2OptionsArray.value.find(opt => opt.name === data.subAffiliationName2)
      if (found) {
        subCategoryId2.value = found.id
        subCategory2.value = found.id
        console.log('✅ Load subCategory2 (fallback):', { id: found.id, name: found.name })
      }
      await nextTick()
    }

    // ✅ 6. โหลด paymentMethods พร้อม debug (แก้ไขส่วนนี้)
    console.log('📦 Payment Methods from API:', data.paymentMethods)

    if (data.paymentMethods && typeof data.paymentMethods === 'object') {
      Object.keys(data.paymentMethods).forEach((key) => {
        const methodData = data.paymentMethods[key]

        // ✅ ตรวจสอบว่า key นี้มีใน paymentMethods.value หรือไม่
        if (!paymentMethods.value[key]) {
          console.warn(`⚠️ Unknown payment method: ${key}`)
          return
        }

        if (!methodData || typeof methodData !== 'object') return

        if (methodData.checked === true) {
          paymentMethods.value[key].checked = true

          const amount = methodData.amount || 0
          if (amount > 0) {
            const numAmount =
              typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount)

            if (!isNaN(numAmount)) {
              paymentMethods.value[key].amount = numAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }
          }

          // ✅ โหลดข้อมูลเฉพาะสำหรับ check
          if (key === 'check') {
            paymentMethods.value[key].bankName = methodData.bankName || ''
            paymentMethods.value[key].checkNumber = methodData.checkNumber || ''
            paymentMethods.value[key].NumIncheck = methodData.NumIncheck || ''
          }

          // ✅ โหลดข้อมูลเฉพาะสำหรับ other
          if (key === 'other' && methodData.name) {
            paymentMethods.value[key].name = methodData.name
          }

          console.log(`✅ Loaded ${key}:`, paymentMethods.value[key])
        }
      })

      await nextTick()
    }

    // ✅ 7. โหลดข้อมูลธนาคาร
    console.log('🏦 Bank Transfers from API:', data.bankTransfers)
    
    if (data.bankTransfers && Array.isArray(data.bankTransfers) && data.bankTransfers.length > 0) {
      bankTransfers.value = []
      await nextTick()
      
      loadBankTransfers(data.bankTransfers)
      await nextTick()
      
      console.log('✅ Bank transfers loaded:', bankTransfers.value)
    }

    // 8. โหลด receiptList
    if (data.receiptList && Array.isArray(data.receiptList) && data.receiptList.length > 0) {
      morelist.value = data.receiptList.map((item, index) => {
        let itemData
        if (item.itemId) {
          itemData = getItemById(item.itemId)
        } else if (item.itemName) {
          itemData = getItemByName(item.itemName)
        }

        return {
          id: index + 1,
          referenceNo: item.referenceNo || '',
          itemId: itemData?.id || item.itemId,
          itemName: itemData?.name || item.itemName || '',
          note: item.note || '',
          amount: item.amount || 0,
          type: item.type || 'income',
          isExpense: item.type === 'expense',
        }
      })

      await nextTick()

      morelist.value.forEach((row) => {
        if (row.amount && row.amount > 0) {
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

      await nextTick()
      morelist.value.forEach((_, i) => {
        initItemNameTomSelect(i)
      })
    } else {
      addRow()
    }

    console.log('✅ Load complete:', {
      mainCategory: mainCategory.value,
      subCategory: subCategory.value,
      subCategory2: subCategory2.value,
      sendmoney: formData.value.sendmoney,
      paymentMethods: paymentMethods.value,
      receiptList: morelist.value,
      bankTransfers: bankTransfers.value,
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
      router.push('/indexwaybill')
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
      // ✅ ถ้าเป็นรายจ่าย ให้ลบ, ถ้าเป็นรายรับให้บวก
      if (row.type === 'expense') {
        total -= cleanAmount
      } else {
        total += cleanAmount
      }
    }
  })
  return total
})
// ✅ แก้ไข Watch ให้ปลอดภัยขึ้น
Object.keys(paymentMethods.value).forEach((key) => {
  watch(
    () => paymentMethods.value[key]?.checked, // ✅ เพิ่ม optional chaining
    (checked) => {
      // ✅ ตรวจสอบว่า key มีอยู่จริง
      if (!paymentMethods.value[key]) return

      if (!checked) {
        // ล้างค่า amount และ name
        paymentMethods.value[key].amount = ''
        if ('name' in paymentMethods.value[key]) {
          paymentMethods.value[key].name = ''
        }

        // ✅ ล้างค่าเฉพาะสำหรับ check
        if (key === 'check') {
          paymentMethods.value[key].bankName = ''
          paymentMethods.value[key].checkNumber = ''
          paymentMethods.value[key].NumIncheck = ''
        }

        // ✅ เคลียร์ error ทั้งหมดของ payment method นี้
        if (errors.value.paymentMethods?.[key]) {
          delete errors.value.paymentMethods[key]
        }
      }
    },
  )
})

watch(
  () => paymentMethods.value,
  (newVal) => {
    Object.keys(newVal).forEach((key) => {
      const method = newVal[key]

      // ✅ ตรวจสอบว่า method มีอยู่จริง
      if (!method || typeof method !== 'object') return

      if (method.checked) {
        // เคลียร์ error amount เมื่อกรอกจำนวนเงิน
        if (method.amount && errors.value.paymentMethods?.[key]?.amount) {
          delete errors.value.paymentMethods[key].amount

          // ถ้าไม่มี error อื่นแล้ว ให้ลบ key ทั้งหมด
          if (Object.keys(errors.value.paymentMethods[key]).length === 0) {
            delete errors.value.paymentMethods[key]
          }
        }

        // เคลียร์ error สำหรับ check
        if (key === 'check') {
          if (method.bankName && errors.value.paymentMethods?.[key]?.bankName) {
            delete errors.value.paymentMethods[key].bankName
          }
          if (method.checkNumber && errors.value.paymentMethods?.[key]?.checkNumber) {
            delete errors.value.paymentMethods[key].checkNumber
          }
          if (method.NumIncheck && errors.value.paymentMethods?.[key]?.NumIncheck) {
            delete errors.value.paymentMethods[key].NumIncheck
          }

          // ถ้าไม่มี error อื่นแล้ว ให้ลบ key ทั้งหมด
          if (
            errors.value.paymentMethods?.[key] &&
            Object.keys(errors.value.paymentMethods[key]).length === 0
          ) {
            delete errors.value.paymentMethods[key]
          }
        }

        // เคลียร์ error name สำหรับ other
        if (key === 'other' && method.name && errors.value.paymentMethods?.[key]?.name) {
          delete errors.value.paymentMethods[key].name

          // ถ้าไม่มี error อื่นแล้ว ให้ลบ key ทั้งหมด
          if (Object.keys(errors.value.paymentMethods[key]).length === 0) {
            delete errors.value.paymentMethods[key]
          }
        }
      }
    })
  },
  { deep: true },
)

// ✅ แก้ไข Validation Logic
// ✅ แก้ไข Validation Logic
const saveData = async () => {
  errors.value = {
    paymentMethods: {},
    bankTransfers: {}, // ✅ เพิ่มบรรทัดนี้
  }
  let hasError = false

  // ========== Basic validation ==========
  if (!formData.value.fullName) {
    errors.value.fullName = 'กรุณากรอก "ชื่อ"'
    hasError = true
  }
  if (!formData.value.waybillNumber) {
    errors.value.waybillNumber = 'กรุณากรอก "เลขที่นำส่ง"'
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
  if (hasAnySub.value && !subCategory.value) {
    errors.value.subCategory = 'กรุณาเลือก "หน่วยงานรอง"'
    hasError = true
  }
  if (hasSub2.value && !subCategory2.value) {
    errors.value.subCategory2 = 'กรุณาเลือก "หน่วยงานย่อย"'
    hasError = true
  }
  if (!formData.value.sendmoney) {
    errors.value.sendmoney = 'กรุณาเลือก "ขอนำส่งเงิน"'
    hasError = true
  }
  // ========== Row validation ==========
  errors.value.rows = {}
  const validRows = []

  // ✅ ตรวจสอบรายการธนาคาร
  errors.value.bankTransfers = {}

  bankTransfers.value.forEach((bank, index) => {
    const hasAnyData = bank.accountData.accountNumber || 
                       bank.accountData.bankName || 
                       bank.accountData.accountName || 
                       bank.amount

    if (hasAnyData) {
      if (!bank.accountData.accountNumber) {
        if (!errors.value.bankTransfers[index]) errors.value.bankTransfers[index] = {}
        errors.value.bankTransfers[index].accountNumber = 'กรุณาเลือกเลขบัญชี'
        hasError = true
      }
      
      const cleanAmount = bank.amount ? parseFloat(String(bank.amount).replace(/,/g, '')) : 0
      if (!bank.amount || cleanAmount <= 0) {
        if (!errors.value.bankTransfers[index]) errors.value.bankTransfers[index] = {}
        errors.value.bankTransfers[index].amount = 'กรุณากรอกจำนวนเงิน'
        hasError = true
      }
    }
  })

  morelist.value.forEach((row, index) => {
    const hasItemName = row.itemName && row.itemName.trim() !== ''
    const cleanAmount = parseFloat(String(row.amount || '').replace(/,/g, ''))
    const hasAmount = cleanAmount && cleanAmount > 0

    if (!hasItemName && !hasAmount) {
      return
    }

    const rowErrors = {}

    if (!hasItemName) {
      rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"'
    }

    if (!hasAmount) {
      rowErrors.amount = 'กรุณากรอก "จำนวนเงิน"'
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.value.rows[index] = rowErrors
      hasError = true
    } else {
      validRows.push({
        itemName: row.itemName || '',
        note: row.note || '',
        referenceNo: row.referenceNo || '',
        amount: cleanAmount,
        type: row.type || 'income',
        subtotal: cleanAmount,
      })
    }
  })

  if (validRows.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่มีรายการนำส่ง',
      text: 'กรุณากรอกรายการนำส่งเงินอย่างน้อย 1 รายการ',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
    })
    return
  }

  // ========== ✅ Payment Methods Validation ==========
  const totalSection2 = netTotalAmount.value
  let totalSection3 = 0
  
  bankTransfers.value.forEach((bank) => {
    if (bank.amount) {
      const cleanAmount = parseFloat(String(bank.amount).replace(/,/g, ''))
      if (!isNaN(cleanAmount) && cleanAmount > 0) {
        totalSection3 += cleanAmount
      }
    }
  })

  const hasAnyPaymentMethod = 
    bankTransfers.value.some(bank => bank.accountData.accountNumber && bank.amount) || 
    Object.keys(paymentMethods.value).some((key) => paymentMethods.value[key].checked)

  Object.keys(paymentMethods.value).forEach((key) => {
    const method = paymentMethods.value[key]
    if (method.checked) {
      // ✅ สร้าง object ก่อนใช้งาน
      if (!errors.value.paymentMethods[key]) {
        errors.value.paymentMethods[key] = {}
      }

      const amount = method.amount
      const cleanAmount = amount ? parseFloat(amount.toString().replace(/,/g, '')) : 0
    if (key !== 'debtor') {
      if (!amount || cleanAmount <= 0) {
        errors.value.paymentMethods[key].amount = 'กรุณากรอกจำนวนเงิน'
        hasError = true
      } else {
        totalSection3 += cleanAmount
      }
    } else {
      // สำหรับลูกหนี้ แค่เพิ่มยอดเข้าไป
      if (cleanAmount > 0) {
        totalSection3 += cleanAmount
      }
    }
      // ✅ ตรวจสอบข้อมูลเช็ค
      if (key === 'check') {
        if (!method.bankName || method.bankName.trim() === '') {
          errors.value.paymentMethods[key].bankName = 'กรุณาเลือกธนาคาร'
          hasError = true
        }
        if (!method.checkNumber || method.checkNumber.trim() === '') {
          errors.value.paymentMethods[key].checkNumber = 'กรุณากรอกเลขที่เช็ค'
          hasError = true
        }
        if (!method.NumIncheck || method.NumIncheck.trim() === '') {
          errors.value.paymentMethods[key].NumIncheck = 'กรุณากรอกเลขที่ในเช็ค'
          hasError = true
        }
      }

      // ✅ ตรวจสอบชื่อ "อื่น ๆ"
      if (key === 'other') {
        if (!method.name || method.name.trim() === '') {
          errors.value.paymentMethods[key].name = 'กรุณาระบุประเภท'
          hasError = true
        }
      }

      // ลบ key ถ้าไม่มี error
      if (Object.keys(errors.value.paymentMethods[key]).length === 0) {
        delete errors.value.paymentMethods[key]
      }
    }
  })

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

  // ✅ ตรวจสอบยอดเงินตรงกันหรือไม่
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
            ✓ ยอดรวมรายการ (ด้านบน):
            <span style="float: right;">${totalSection2.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} บาท</span>
          </p>
          <p style="font-weight: 600; color: #DC2626; margin-bottom: 8px;">
            ✗ ยอดเงินนำส่ง (ด้านล่าง):
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

  Object.keys(paymentMethods.value).forEach((key) => {
    if (paymentMethods.value[key].checked) {
      const cleanAmount = parseFloat(
        String(paymentMethods.value[key].amount || '0').replace(/,/g, ''),
      )

      const methodData = {
        checked: true,
        amount: cleanAmount,
      }

      if (key === 'check') {
        methodData.bankName = paymentMethods.value[key].bankName || ''
        methodData.checkNumber = paymentMethods.value[key].checkNumber || ''
        methodData.NumIncheck = paymentMethods.value[key].NumIncheck || ''
      }

      if (key === 'other') {
        methodData.name = paymentMethods.value[key].name || ''
      }

      paymentMethodsData[key] = methodData
    }
  })
if (!isEditMode.value) {
  try {
    const checkResponse = await axios.get(`/checkwaybillNumber/${formData.value.waybillNumber}`)
    if (checkResponse.data.exists) {
      Swal.fire({
        icon: 'error',
        title: 'เลขที่นำส่งซ้ำ',
        text: `เลขที่นำส่ง "${formData.value.waybillNumber}" มีอยู่ในระบบแล้ว กรุณาใช้เลขที่อื่น`,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#DC2626',
      })
      return
    }
  } catch (err) {
    console.error('Error checking waybillNumber:', err)
  }
}
  const bankTransfersData = getBankTransfersData()
    const getSubName1 = () => {
    if (!subCategoryId.value) return ''
    const found = sub1OptionsArray.value.find(opt => opt.id === subCategoryId.value)
    return found?.name || ''
  }

  const getSubName2 = () => {
    if (!subCategoryId2.value) return ''
    const found = sub2OptionsArray.value.find(opt => opt.id === subCategoryId2.value)
    return found?.name || ''
  }
  const payload = {
    waybillNumber: formData.value.waybillNumber,
    fullName: formData.value.fullName,
    moneyTypeNote: 'Waybill',
    phone: formData.value.phone,
    mainAffiliationId: mainCategoryId.value,
    mainAffiliationName: mainCategory.value,
    subAffiliationId1: subCategoryId.value,
    subAffiliationName1: getSubName1(),
    subAffiliationId2: subCategoryId2.value,
    subAffiliationName2: getSubName2(),
    fundName: formData.value.fundName,
    moneyType: formData.value.sendmoney,
    projectCode: formData.value.projectCode,
    sendmoney: formData.value.sendmoney,
    netTotalAmount: totalSection2,
    paymentMethods: paymentMethodsData,
    totalPaymentAmount: totalSection3,
        receiptList: validRows.map(row => {
      const item = getItemByName(row.itemName)
      return {
        ...row,
        itemId: item?.id
      }
    }),
    affiliationId: authStore.user?.affiliationId || '',
    affiliationName: authStore.user?.affiliation || mainCategory.value,
    bankTransfers: bankTransfersData,
  }

  if (isEditMode.value) {
    payload.id = formData.value.waybillNumber // ✅ ใช้ waybillNumber แทน
    payload.updatedAt = currentDateTime
  } else {
    payload.id = formData.value.waybillNumber  // ✅ ใช้ waybillNumber แทน
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

    await nextTick()
    localStorage.setItem('receipts_last_update', Date.now().toString())
    window.dispatchEvent(
      new CustomEvent('receipts-updated', {
        detail: { action: isEditMode.value ? 'update' : 'create' },
      }),
    )
    
await Swal.fire({
  icon: 'success',
  title: isEditMode.value ? 'อัพเดตสำเร็จ!' : 'บันทึกสำเร็จ!',
  text: `${isEditMode.value ? 'อัพเดต' : 'บันทึก'}ใบนำส่งเงินเลขที่ ${formData.value.waybillNumber} เรียบร้อยแล้ว`,
  confirmButtonText: 'ตกลง',
  confirmButtonColor: '#7E22CE',
  timer: 2000,
  timerProgressBar: true,
})

    router.push('/indexwaybill')
  } catch (err) {
    console.error('Error:', err)
    let errorMessage = isEditMode.value
      ? 'เกิดข้อผิดพลาดในการอัพเดตข้อมูล'
      : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'

    if (err.response) {
      if (err.response.status === 409) {
        errorMessage = 'เลขที่นำส่งนี้มีอยู่ในระบบแล้ว กรุณาใช้เลขที่อื่น'
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
/* Animation สำหรับ Dialog */
.fixed {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.glass-panel {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
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
.row-options-container {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* แสดงเมื่อ hover หรือเป็นรายจ่าย */
.group:hover .row-options-container,
.row-options-container.is-active {
  opacity: 1;
}

/* ซ่อนเมื่อ print */
@media print {
  .no-print {
    display: none !important;
  }

  /* แสดงข้อความ (หัก) เมื่อ print */
  .expense-print-label::after {
    content: ' (หัก)';
    color: #dc2626;
    font-size: 10px;
    font-weight: bold;
  }
}

/* Style สำหรับ TomSelect เมื่อเป็นรายจ่าย */
.text-red-600 :deep(.ts-control) {
  color: #dc2626 !important;
}

.text-red-600 :deep(.ts-control input) {
  color: #dc2626 !important;
}
</style>
