// src/pages/Document/Waybill/index.vue
<template>
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full flex h-screen overflow-hidden">
      <div class="mesh-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <sidebar />
      <main class="flex-1 flex flex-col relative z-10">
        <header
          class="h-auto lg:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-8 pt-4 pb-2 gap-3"
        >
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
                  <div v-if="!isApprovedMode" class="flex gap-2">
                    <button
                      @click="showLoadDialog = true"
                      class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <i class="ph ph-folder-open text-lg"></i>
                      <span class="text-base font-medium">โหลด Template</span>
                    </button>
                  </div>
                </div>
              </div>
              <!-- แถวที่ 1: เลขที่นำส่ง | ชื่อ (แสดงเสมอ) -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    เลขที่นำส่ง <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    :disabled="isApprovedMode"
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
                    :disabled="isApprovedMode"
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
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    เบอร์โทรติดต่อ <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    :disabled="isApprovedMode"
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
                    :disabled="isApprovedMode"
                    :readonly="isApprovedMode"
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
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      กองทุน <span class="text-red-500">*</span>
                    </label>
                    <Selects
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
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
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
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
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      รหัสโครงงาน <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="formData.projectCode"
                      placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
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
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
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
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
                    />
                    <span v-if="errors.fundName" class="text-red-600 text-xs">
                      {{ errors.fundName }}
                    </span>
                  </div>
                </div>

                <!-- แถวที่ 4: ขอนำส่งเงิน | รหัสโครงการ -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
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
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
                    />
                  </div>
                </div>
              </template>

              <!-- =========================== -->
              <!-- กรณีมีหน่วยงานรองและหน่วยงานย่อย -->
              <!-- =========================== -->
              <template v-if="hasSub2">
                <!-- แถวที่ 3: หน่วยงานรอง | หน่วยงานย่อย -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
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
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
                    />
                    <span v-if="errors.subCategory2" class="text-red-600 text-xs">
                      {{ errors.subCategory2 }}
                    </span>
                  </div>
                </div>

                <!-- แถวที่ 4: กองทุน | ขอนำส่งเงิน -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      กองทุน <span class="text-red-500">*</span>
                    </label>
                    <Selects
                      v-model="formData.fundName"
                      :options="['กองทุนทั่วไป', 'กองทุนพิเศษ']"
                      placeholder="เลือกกองทุน"
                      value-type="string"
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
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
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
                    />
                    <span v-if="errors.sendmoney" class="text-red-600 text-xs">
                      {{ errors.sendmoney }}
                    </span>
                  </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      รหัสโครงงาน <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="formData.projectCode"
                      placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                      :disabled="isApprovedMode"
                      :readonly="isApprovedMode"
                    />
                  </div>
                  <div></div>
                </div>
              </template>
            </div>

            <!-- 3. ส่วนที่ 2: เพิ่ม checkbox ยกเลิกและ disable การเพิ่ม/ลบ -->
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                  ส่วนที่ 2: รายการนำส่งเงิน
                  <!-- ✅ แจ้งเตือนถ้าเป็น approved mode -->
                  <span
                    v-if="isApprovedMode"
                    class="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium"
                  >
                    <i class="ph ph-info text-sm mr-1"></i>
                    สามารถยกเลิกรายการได้
                  </span>
                </h2>
                <span class="text-xs text-slate-600 bg-white/60 px-3 py-1 rounded-full">
                  {{ morelist.filter((r) => !r.isCancelled).length }} รายการ
                </span>
              </div>

              <!-- Header ของตาราง -->
              <div
                class="hidden sm:grid gap-3 px-2 pb-2 border-b border-white/40 items-center text-center"
                :class="
                  isApprovedMode
                    ? 'sm:grid-cols-[0.15fr_0.3fr_0.6fr_1.5fr_0.7fr_0.6fr_0.2fr]'
                    : 'sm:grid-cols-[0.3fr_0.6fr_1.5fr_0.7fr_0.6fr_0.2fr]'
                "
              >
                <!-- ✅ คอลัมน์ checkbox ยกเลิก (แสดงเฉพาะ approved mode) -->
                <div v-if="isApprovedMode" class="text-base font-semibold text-slate-600 uppercase">
                  ยกเลิก
                </div>
                <div class="text-base font-semibold text-slate-600 uppercase">ลำดับ</div>
                <div class="text-base font-semibold text-slate-600 uppercase">
                  เล่มที่/เลขที่ใบเสร็จ
                </div>
                <div class="text-base font-semibold text-slate-600 uppercase">รายการ</div>
                <div class="text-base font-semibold text-slate-600 uppercase">ประเภท</div>
                <div class="text-base font-semibold text-slate-600 uppercase">จำนวนเงิน</div>
              </div>

              <!-- รายการ -->
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  class="bg-white/20 rounded-xl p-4 border transition-all"
                  :class="{
                    'border-red-300 bg-red-50/30': row.isCancelled,
                    'border-white/50': !row.isCancelled,
                  }"
                >
                  <div
                    class="grid grid-cols-1 gap-3 items-start"
                    :class="
                      isApprovedMode
                        ? 'sm:grid-cols-[0.15fr_0.2fr_1fr_2.5fr_1fr_1fr_auto]'
                        : 'sm:grid-cols-[0.2fr_1fr_2.5fr_1fr_1fr_auto]'
                    "
                  >
                    <!-- ✅ Checkbox ยกเลิก (แสดงเฉพาะ approved mode) -->
                    <div v-if="isApprovedMode" class="flex items-center justify-center">
                      <label class="flex items-center justify-center cursor-pointer group">
                        <input
                          type="checkbox"
                          v-model="row.isCancelled"
                          @change="() => handleCancelToggle(index)"
                          class="w-5 h-5 rounded border-2 border-red-300 text-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer transition-all"
                        />
                      </label>
                    </div>

                    <!-- ลำดับ -->
                    <div class="flex items-center justify-center ml-2 mr-5">
                      <span
                        class="-mr-3 text-white rounded-full text-lg font-bold mt-3 w-10 h-10 flex items-center justify-center"
                        :class="row.isCancelled ? 'bg-gray-400' : 'bg-purple-500'"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>

                    <!-- เลขที่ใบเสร็จ -->
                    <!-- เลขที่ใบเสร็จ -->
                    <div class="flex flex-col gap-1.5 mt-2 -mr-2 ml-2">
                      <div class="relative">
                        <InputText
                          v-model="row.referenceNo"
                          :placeholder="row.isCancelled ? 'ยกเลิก' : '(เล่มที่/เลขที่ใบเสร็จ)'"
                          :disabled="isApprovedMode"
                          @keypress="allowOnlyDigits"
                          @input="() => clearRowError(index, 'referenceNo')"
                          :class="row.isCancelled ? 'opacity-50' : ''"
                        />
                        <!-- ✅ แสดง "(ยกเลิก)" แม้ว่าจะไม่มี referenceNo -->
                        <span
                          v-if="row.isCancelled"
                          class="-mt-1 absolute right-3 top-1/2 -translate-y-1/2 text-red-600 font-bold text-sm pointer-events-none"
                        >
                          {{ row.referenceNo ? '(ยกเลิก)' : 'ยกเลิก' }}
                        </span>
                      </div>
                    </div>

                    <!-- รายการ -->
                    <div
                      class="flex flex-col gap-2 mt-[13px]"
                      :class="row.isCancelled ? 'opacity-50' : ''"
                    >
                      <ItemNameSelect
                        v-model="row.itemName"
                        @input="(value) => handleItemNameChange(index, value)"
                        :input-id="`itemName-${index}`"
                        :disabled="isApprovedMode"
                        :readonly="isApprovedMode"
                        waybill-type="all"
                        department="general"
                      />
                        <span v-if="errors.rows?.[index]?.itemName" class="text-red-600 text-xs">
    {{ errors.rows[index].itemName }}
  </span>
                    </div>

                    <!-- ประเภท (รายจ่าย) -->
                    <div
                      class="flex items-center justify-center mt-6 -ml-5"
                      :class="row.isCancelled ? 'opacity-50' : ''"
                    >
                      <label class="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          v-model="row.isExpense"
                          :disabled="isApprovedMode"
                          @change="() => handleExpenseToggle(index)"
                          class="w-5 h-5 rounded border-2 border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2 transition-all"
                        />
                        <span
                          class="text-sm font-medium transition-colors"
                          :class="row.isExpense ? 'text-red-600' : 'text-gray-500'"
                        >
                          รายจ่าย
                        </span>
                      </label>
                    </div>

                    <!-- จำนวนเงิน -->
                    <div
                      class="flex flex-col gap-1.5 mt-2"
                      :class="row.isCancelled ? 'opacity-50 line-through' : ''"
                    >
                      <InputText
                        :model-value="formatDisplayAmount(row.amount)"
                        @input="(e) => handleAmountInput(index, e)"
                        @blur="() => formatAmountOnBlur(index)"
                        :disabled="isApprovedMode || hasAnyPaymentType(index)"
                        :readonly="hasAnyPaymentType(index)"
                        placeholder="จำนวนเงิน"
                        :class="hasAnyPaymentType(index)"
                      />
                        <span v-if="errors.rows?.[index]?.amount" class="text-red-600 text-xs">
    {{ errors.rows[index].amount }}
  </span>
                    </div>

                    <!-- ปุ่มลบ (ซ่อนใน approved mode) -->
                    <button
                      v-if="morelist.length > 1 && !isApprovedMode"
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

                    <!-- ส่วนประเภทการชำระ (disabled ใน approved mode) -->
                    <div
                      class="col-span-full mt-2 mb-1"
                      :class="row.isCancelled ? 'opacity-30 pointer-events-none' : ''"
                    >
                      <div class="flex gap-4 items-center px-2">
                        <span class="text-sm font-medium text-gray-600 ml-16">ประเภทการชำระ:</span>

                        <!-- เงินสด -->
                        <label
                          class="flex items-center gap-2"
                          :class="
                            isReceivableItem(row.itemName)
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer'
                          "
                        >
                          <input
                            type="checkbox"
                            :checked="row.paymentTypes?.cash"
                            :disabled="
                              isApprovedMode ||
                              row.isCancelled ||
                              isReceivableItem(row.itemName) ||
                              isExpenseRow(index)
                            "
                            @change="
                              (e) => handlePaymentTypeChange(index, 'cash', e.target.checked)
                            "
                            class="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span class="text-sm text-gray-700">เงินสด</span>
                        </label>

                        <!-- เช็ค -->
                        <label
                          class="flex items-center gap-2"
                          :class="
                            isReceivableItem(row.itemName)
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer'
                          "
                        >
                          <input
                            type="checkbox"
                            :checked="row.paymentTypes?.check"
                            :disabled="
                              isApprovedMode ||
                              row.isCancelled ||
                              isReceivableItem(row.itemName) ||
                              isExpenseRow(index)
                            "
                            @change="
                              (e) => handlePaymentTypeChange(index, 'check', e.target.checked)
                            "
                            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span class="text-sm text-gray-700">เช็ค</span>
                        </label>

                        <!-- เงินโอน -->
                        <label
                          class="flex items-center gap-2"
                          :class="
                            isReceivableItem(row.itemName)
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer'
                          "
                        >
                          <input
                            type="checkbox"
                            :checked="row.paymentTypes?.transfer"
                            :disabled="
                              isApprovedMode ||
                              row.isCancelled ||
                              isReceivableItem(row.itemName) ||
                              isExpenseRow(index)
                            "
                            @change="
                              (e) => handlePaymentTypeChange(index, 'transfer', e.target.checked)
                            "
                            class="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span class="text-sm text-gray-700">เงินโอน</span>
                        </label>

                        <!-- ✅ แสดงไอคอนแจ้งเตือนเมื่อเป็นลูกหนี้ -->
                        <span
                          v-if="isReceivableItem(row.itemName)"
                          class="text-xs text-orange-600 font-medium ml-2"
                        >
                          <i class="ph ph-info text-sm"></i>
                          (รายการลูกหนี้)
                        </span>
                        <span
                          v-else-if="isExpenseRow(index)"
                          class="text-xs text-red-600 font-medium ml-2"
                        >
                          <i class="ph ph-info text-sm"></i>
                          (รายจ่าย ไม่ต้องระบุช่องทาง)
                        </span>
                      </div>

                      <!-- แสดง error เฉพาะรายการที่ไม่ใช่ลูกหนี้ -->
                      <div
                        v-if="errors.rows?.[index]?.paymentTypes && !isReceivableItem(row.itemName)"
                        class="px-2 mt-2"
                      >
                        <span class="text-red-600 text-xs ml-16">
                          {{ errors.rows[index].paymentTypes }}
                        </span>
                      </div>
                      <transition
                        enter-active-class="transition-all duration-300 ease-out"
                        leave-active-class="transition-all duration-200 ease-in"
                        enter-from-class="opacity-0 max-h-0"
                        enter-to-class="opacity-100 max-h-32"
                        leave-from-class="opacity-100 max-h-32"
                        leave-to-class="opacity-0 max-h-0"
                      >
                        <div
                          v-if="row.paymentTypes?.cash"
                          class="mt-3 px-2 bg-red-100 rounded-lg p-3 border border-blue-200"
                        >
                          <div class="flex items-center gap-[705px]">
                            <div class="text-sm font-medium ml-3">เงินสด</div>
                            <div class="w-52">
                              <InputText
                                :model-value="formatDisplayAmount(row.cashDetails?.amount || '')"
                                @input="(e) => handlePaymentAmountInput(index, 'cash', e)"
                                @blur="() => formatPaymentAmountOnBlur(index, 'cash')"
                                placeholder="จำนวนเงินสด"
                                :disabled="isApprovedMode"
                              />
                                    <span v-if="errors.rows?.[index]?.cashAmount" class="text-red-600 text-xs mt-1 block">
        {{ errors.rows[index].cashAmount }}
      </span>
                            </div>
                          </div>
                        </div>
                      </transition>
                      <!-- ฟิลด์เพิ่มเติมสำหรับเช็ค (แสดงแต่ disable ถ้าเป็นลูกหนี้) -->
                      <transition
                        enter-active-class="transition-all duration-300 ease-out"
                        leave-active-class="transition-all duration-200 ease-in"
                        enter-from-class="opacity-0 max-h-0"
                        enter-to-class="opacity-100 max-h-40"
                        leave-from-class="opacity-100 max-h-40"
                        leave-to-class="opacity-0 max-h-0"
                      >
                        <div
                          v-if="row.paymentTypes?.check"
                          class="mt-3 px-2 bg-blue-100 rounded-lg p-3 border border-blue-200"
                          :class="isReceivableItem(row.itemName) ? 'opacity-50' : ''"
                        >
                          <div class="grid grid-cols-4 gap-3">
                            <!-- ธนาคาร -->
                            <div class="flex flex-col gap-1">
                              <label class="text-xs font-medium text-gray-600">ธนาคาร</label>
                              <Selects
                                v-model="row.checkDetails.bankName"
                                :options="bankOptions"
                                option-label="label"
                                option-value="value"
                                placeholder="เลือกธนาคาร"
                                value-type="string"
                                class="text-sm w-10"
                                :disabled="isApprovedMode || isReceivableItem(row.itemName)"
                                :readonly="isApprovedMode || isReceivableItem(row.itemName)"
                                @change="() => clearRowError(index, 'checkBankName')"
                              />
      <span v-if="errors.rows?.[index]?.checkBankName" class="text-red-600 text-xs">
        {{ errors.rows[index].checkBankName }}
      </span>
                            </div>
                            <!-- เลขที่เช็ค -->
                            <div class="flex flex-col gap-1 ml-2">
                              <label class="text-xs font-medium text-gray-600">เลขที่เช็ค</label>
                              <InputText
                                v-model="row.checkDetails.checkNumber"
                                placeholder="ระบุเลขที่เช็ค"
                                @keypress="allowOnlyDigits"
                                class="text-sm w-52"
                                :disabled="isApprovedMode || isReceivableItem(row.itemName)"
                                :readonly="isApprovedMode || isReceivableItem(row.itemName)"
                                @input="() => clearRowError(index, 'checkNumber')"
                              />
      <span v-if="errors.rows?.[index]?.checkNumber" class="text-red-600 text-xs">
        {{ errors.rows[index].checkNumber }}
      </span>
                            </div>
                            <div class="flex flex-col gap-1 -ml-7 mr-12">
                              <label class="text-xs font-medium text-gray-600">เลขที่ในเช็ค</label>
                              <InputText
                                v-model="row.checkDetails.numInCheck"
                                placeholder="ระบุเลขที่ในเช็ค"
                                class="text-sm w-52"
                                :disabled="isApprovedMode || isReceivableItem(row.itemName)"
                                :readonly="isApprovedMode || isReceivableItem(row.itemName)"
                                @input="() => clearRowError(index, 'checkNumInCheck')"
                              />
      <span v-if="errors.rows?.[index]?.checkNumInCheck" class="text-red-600 text-xs">
        {{ errors.rows[index].checkNumInCheck }}
      </span>
                            </div>
                            <div class="flex flex-col gap-1 -ml-10">
                              <label class="text-xs font-medium text-gray-600">จำนวนเงิน</label>
                              <InputText
                                :model-value="formatDisplayAmount(row.checkDetails?.amount || '')"
                                @input="(e) => handlePaymentAmountInput(index, 'check', e)"
                                @blur="() => formatPaymentAmountOnBlur(index, 'check')"
                                placeholder="จำนวนเงิน"
                                class="w-52"
                                :disabled="isApprovedMode || isReceivableItem(row.itemName)"
                              />
     <span v-if="errors.rows?.[index]?.checkAmount" class="text-red-600 text-xs">
        {{ errors.rows[index].checkAmount }}
      </span>
                            </div>
                          </div>
                        </div>
                      </transition>

                      <!-- ฟิลด์เพิ่มเติมสำหรับเงินโอน (แสดงแต่ disable ถ้าเป็นลูกหนี้) -->
                      <transition
                        enter-active-class="transition-all duration-300 ease-out"
                        leave-active-class="transition-all duration-200 ease-in"
                        enter-from-class="opacity-0 max-h-0"
                        enter-to-class="opacity-100 max-h-40"
                        leave-from-class="opacity-100 max-h-40"
                        leave-to-class="opacity-0 max-h-0"
                      >
                        <div
                          v-if="row.paymentTypes?.transfer"
                          class="mt-3 px-2 bg-purple-100 rounded-lg p-3 border border-purple-200"
                          :class="isReceivableItem(row.itemName) ? 'opacity-50' : ''"
                        >
                          <div class="flex gap-4 items-end">
                            <!-- เลือกบัญชีธนาคาร -->
                            <div class="flex flex-col gap-1 w-[740px]">
                              <label class="text-xs font-medium text-gray-600">
                                เลือกบัญชีธนาคาร
                              </label>
                              <BankAccountSelect
                                v-model="row.transferDetails.accountData"
                                :input-id="`transfer-bank-${index}`"
                                placeholder="เลือกบัญชีธนาคาร"
                                :disabled="isApprovedMode || isReceivableItem(row.itemName)"
                                :readonly="isApprovedMode || isReceivableItem(row.itemName)"
                                @change="() => clearRowError(index, 'transferAccount')"
                              />
      <span v-if="errors.rows?.[index]?.transferAccount" class="text-red-600 text-xs">
        {{ errors.rows[index].transferAccount }}
      </span>
                            </div>

                            <!-- จำนวนเงิน -->
                            <div class="w-52 -mb-2">
                              <label class="text-xs font-medium text-gray-600">จำนวนเงิน</label>
                              <InputText
                                :model-value="
                                  formatDisplayAmount(row.transferDetails?.amount || '')
                                "
                                @input="(e) => handlePaymentAmountInput(index, 'transfer', e)"
                                @blur="() => formatPaymentAmountOnBlur(index, 'transfer')"
                                placeholder="จำนวนเงิน"
                                :disabled="isApprovedMode || isReceivableItem(row.itemName)"
                              />
      <span v-if="errors.rows?.[index]?.transferAmount" class="text-red-600 text-xs">
        {{ errors.rows[index].transferAmount }}
      </span>
                            </div>
                          </div>
                        </div>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ปุ่มเพิ่มรายการ (ซ่อนใน approved mode) -->
              <button
                v-if="!isApprovedMode"
                @click="addRow"
                class="w-full h-14 border-2 border-dashed text-xl border-[#7E22CE] rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
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

              <!-- ✅ แสดงข้อความแจ้งเตือนใน approved mode -->
              <div
                v-if="isApprovedMode"
                class="bg-blue-50/80 backdrop-blur-sm border border-blue-300 rounded-xl p-4 shadow-sm"
              >
                <p class="text-sm text-blue-900 m-0 flex items-start gap-2">
                  <i class="ph ph-info text-xl flex-shrink-0 mt-0.5"></i>
                  <span class="mt-1">
                    <strong>โหมดแก้ไขแบบจำกัด:</strong>
                    ใบนำส่งนี้ได้รับการอนุมัติเรียบร้อยแล้ว
                    ท่านสามารถยกเลิกรายการได้โดยทำเครื่องหมายถูกในช่อง “ยกเลิก”
                    รายการที่ถูกยกเลิกจะไม่นำมาคำนวณรวมในยอดเงินสุทธิ
                    และเมื่อดำเนินการยกเลิกรายการแล้ว จะไม่สามารถยกเลิกการยกเลิกได้อีก
                  </span>
                </p>
              </div>
            </div>
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span class="w-1 h-6 bg-red-500 rounded-full"></span>ส่วนที่ 3:
                  รายละเอียดประเภทการชำระ
                </h2>
                <span class="text-xs text-slate-600 bg-white/60 px-3 py-1 rounded-full">
                  {{ totalPaymentTypesCount }} ประเภท
                </span>
              </div>

              <div class="space-y-4">
                <!-- 🏦 เงินโอน (รวมยอด) -->
                <div
                  v-if="transferTotalAmount > 0"
                  class="bg-purple-50 rounded-xl p-4 border border-purple-200"
                >
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      :checked="true"
                      disabled
                      class="w-5 h-5 rounded border-gray-300 text-purple-600 opacity-60 cursor-not-allowed"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">เงินโอน</div>
                      <div class="text-sm text-slate-600 mt-1">
                        รวมจาก {{ transferCount }} รายการ
                      </div>
                    </div>
                    <div class="text-xl font-bold text-purple-600">
                      {{ formatCurrency(transferTotalAmount) }} บาท
                    </div>
                  </div>
                </div>

                <!-- 📝 เช็ค (รวมยอด) -->
                <div
                  v-if="checkTotalAmount > 0"
                  class="bg-blue-50 rounded-xl p-4 border border-blue-200"
                >
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      :checked="true"
                      disabled
                      class="w-5 h-5 rounded border-gray-300 text-blue-600 opacity-60 cursor-not-allowed"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">เช็ค</div>
                      <div class="text-sm text-slate-600 mt-1">รวมจาก {{ checkCount }} รายการ</div>
                    </div>
                    <div class="text-xl font-bold text-blue-600">
                      {{ formatCurrency(checkTotalAmount) }} บาท
                    </div>
                  </div>
                </div>

                <!-- 💵 เงินสด (รวมยอด) -->
                <div
                  v-if="cashTotalAmount > 0"
                  class="bg-green-50 rounded-xl p-4 border border-green-200"
                >
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      :checked="true"
                      disabled
                      class="w-5 h-5 rounded border-gray-300 text-green-600 opacity-60 cursor-not-allowed"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">เงินสด</div>
                      <div class="text-sm text-slate-600 mt-1">รวมจาก {{ cashCount }} รายการ</div>
                    </div>
                    <div class="text-xl font-bold text-green-600">
                      {{ formatCurrency(cashTotalAmount) }} บาท
                    </div>
                  </div>
                </div>

                <!-- 📋 ลูกหนี้ (รวมยอด - คำนวณอัตโนมัติ) -->
                <div
                  v-if="debtorTotalAmount > 0"
                  class="bg-orange-50 rounded-xl p-4 border border-orange-200"
                >
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      :checked="true"
                      disabled
                      class="w-5 h-5 rounded border-gray-300 text-orange-600 opacity-60 cursor-not-allowed"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">📋 ลูกหนี้</div>
                      <div class="text-sm text-slate-600 mt-1">ผลรวมรายการลูกหนี้ทั้งหมด</div>
                    </div>
                    <div class="text-xl font-bold text-orange-600">
                      {{ formatCurrency(debtorTotalAmount) }} บาท
                    </div>
                  </div>
                </div>
                <div
                  v-if="expenseTotalAmount > 0"
                  class="bg-red-50 rounded-xl p-4 border border-red-200"
                >
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      :checked="true"
                      disabled
                      class="w-5 h-5 rounded border-gray-300 text-red-600 opacity-60 cursor-not-allowed"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">รายจ่าย (หักออก)</div>
                      <div class="text-sm text-slate-600 mt-1">
                        รวมจาก {{ expenseCount }} รายการ
                      </div>
                    </div>
                    <div class="text-xl font-bold text-red-600">
                      -{{ formatCurrency(expenseTotalAmount) }} บาท
                    </div>
                  </div>
                </div>
                <!-- ⚠️ แสดงเมื่อยังไม่มีข้อมูล -->
                <div v-if="totalPaymentTypesCount === 0" class="text-center py-12 text-gray-400">
                  <i class="ph ph-wallet text-5xl mb-3 opacity-50"></i>
                  <p class="text-sm font-medium">กรุณาเลือกประเภทการชำระเงินในส่วนที่ 2</p>
                  <p class="text-xs mt-1">Tick checkbox ที่ต้องการในแต่ละรายการ</p>
                </div>
              </div>
            </div>
            <div class="bg-[#7E22CE] border rounded-lg py-6 px-3">
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-white">ยอดสุทธิทั้งหมด</span>
                <span class="text-3xl font-bold text-white"> {{ formattedNetTotal }} บาท </span>
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
                v-if="!isApprovedMode"
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
    <div
      v-if="showSaveDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="glass-panel rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-800">บันทึก Template</h3>
          <button
            @click="
              showSaveDialog = false;
              templateName = ''"
            class="text-slate-500 hover:text-slate-700"
          >
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
              <li>✓ รายการนำส่งเงิน ({{ morelist.filter((r) => r.itemName).length }} รายการ)</li>
            </ul>
          </div>

          <div class="flex gap-3">
            <button
              @click="
                showSaveDialog = false;
                templateName = ''
              "
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
    <div
      v-if="showLoadDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        class="glass-panel rounded-2xl p-6 w-full max-w-3xl mx-4 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-800">โหลด Template</h3>
          <button
            @click="
              showLoadDialog = false;
              searchTerm = ''
              expandedTemplates = {}
            "
            class="text-slate-500 hover:text-slate-700"
          >
            <i class="ph ph-x text-2xl"></i>
          </button>
        </div>

        <!-- ช่องค้นหา -->
        <div class="mb-4">
          <div class="relative">
            <i
              class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            ></i>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="ค้นหา Template..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- ✅ รายการ Templates -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-2">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="bg-white/40 rounded-xl border border-white/50 hover:bg-white/60 transition-all group overflow-hidden"
          >
            <!-- Header - แสดงเสมอ -->
            <div class="p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-bold text-lg text-slate-800">{{ template.name }}</h4>
                    <span
                      class="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                    >
                      {{ template.affiliationName || authStore.user?.affiliation }}
                    </span>
                  </div>

                  <!-- ข้อมูลพื้นฐาน -->
                  <div class="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>
                      <span class="font-medium">ชื่อ:</span> {{ template.data.fullName || '-' }}
                    </div>
                    <div>
                      <span class="font-medium">เบอร์:</span> {{ template.data.phone || '-' }}
                    </div>
                    <div>
                      <span class="font-medium">หน่วยงาน:</span>
                      {{ template.data.mainCategory || '-' }}
                    </div>
                    <div>
                      <span class="font-medium">กองทุน:</span> {{ template.data.fundName || '-' }}
                    </div>
                  </div>
                </div>

                <!-- ปุ่มจัดการ -->
                <div class="flex gap-2 ml-4">
                  <button
                    @click="loadTemplate(template)"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="โหลด Template"
                  >
                    <i class="ph ph-download-simple"></i>
                    <span class="text-sm font-medium">โหลด</span>
                  </button>
                  <button
                    @click="deleteTemplate(template.id)"
                    class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                    title="ลบ Template"
                  >
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </div>

              <!-- ✅ สรุปข้อมูล - แสดงเสมอ -->
              <div class="flex flex-wrap gap-2 mb-2">
                <!-- รายการนำส่งเงิน -->
                <div
                  v-if="template.data.receiptItems?.length > 0"
                  class="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200"
                >
                  <i class="ph ph-list-bullets text-green-600"></i>
                  <span class="text-sm font-semibold text-green-800">
                    {{ template.data.receiptItems.length }} รายการนำส่ง
                  </span>
                </div>

                <!-- บัญชีธนาคาร -->
                <div
                  v-if="template.data.bankTransfers?.length > 0"
                  class="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
                >
                  <i class="ph ph-bank text-blue-600"></i>
                  <span class="text-sm font-semibold text-blue-800">
                    {{ template.data.bankTransfers.length }} บัญชีธนาคาร
                  </span>
                </div>

                <!-- วิธีการชำระ -->
                <div
                  v-if="
                    template.data.paymentMethods &&
                    Object.keys(template.data.paymentMethods).filter(
                      (k) => template.data.paymentMethods[k].checked,
                    ).length > 0
                  "
                  class="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200"
                >
                  <i class="ph ph-wallet text-purple-600"></i>
                  <span class="text-sm font-semibold text-purple-800">
                    {{
                      Object.keys(template.data.paymentMethods).filter(
                        (k) => template.data.paymentMethods[k].checked,
                      ).length
                    }}
                    วิธีชำระ
                  </span>
                </div>
              </div>

              <!-- ✅ ปุ่ม Show More/Less -->
              <button
                @click="toggleTemplateDetails(template.id)"
                class="w-full mt-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{{
                  isTemplateExpanded(template.id) ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'
                }}</span>
                <i
                  :class="isTemplateExpanded(template.id) ? 'ph ph-caret-up' : 'ph ph-caret-down'"
                  class="text-lg"
                ></i>
              </button>
            </div>

            <!-- ✅ รายละเอียดแบบเต็ม - แสดงเมื่อกด Show More -->
            <transition
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-[1000px]"
              leave-from-class="opacity-100 max-h-[1000px]"
              leave-to-class="opacity-0 max-h-0"
            >
              <div
                v-show="isTemplateExpanded(template.id)"
                class="border-t border-gray-200 bg-white/20"
              >
                <div class="p-4 space-y-3">
                  <!-- รายการนำส่งเงิน -->
                  <div v-if="template.data.receiptItems?.length > 0">
                    <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div class="flex items-center gap-2 mb-2">
                        <i class="ph ph-list-bullets text-green-600 text-lg"></i>
                        <span class="font-bold text-green-800"
                          >รายการนำส่งเงิน ({{ template.data.receiptItems.length }} รายการ)</span
                        >
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <div
                          v-for="(item, idx) in template.data.receiptItems"
                          :key="idx"
                          class="flex items-center gap-2 text-sm bg-white/60 px-3 py-2 rounded border border-green-100"
                        >
                          <span class="text-green-600 font-bold min-w-[24px]">{{ idx + 1 }}.</span>
                          <span
                            class="text-slate-800 font-medium flex-1 truncate"
                            :title="item.itemName"
                          >
                            {{ item.itemName }}
                          </span>
                          <span
                            v-if="item.isExpense"
                            class="text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded"
                            >รายจ่าย</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- บัญชีธนาคาร -->
                  <div v-if="template.data.bankTransfers?.length > 0">
                    <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div class="flex items-center gap-2 mb-2">
                        <i class="ph ph-bank text-blue-600 text-lg"></i>
                        <span class="font-bold text-blue-800"
                          >บัญชีธนาคาร ({{ template.data.bankTransfers.length }} บัญชี)</span
                        >
                      </div>
                      <div class="space-y-2">
                        <div
                          v-for="(bank, idx) in template.data.bankTransfers"
                          :key="idx"
                          class="flex items-center gap-3 bg-white/60 px-3 py-2.5 rounded border border-blue-100"
                        >
                          <span class="text-blue-600 font-bold text-lg min-w-[28px]"
                            >{{ idx + 1 }}.</span
                          >
                          <div class="flex-1">
                            <div class="font-bold text-slate-800 text-base">
                              {{ bank.accountData.bankName }}
                            </div>
                            <div class="text-sm text-slate-600 mt-0.5">
                              <span class="font-semibold">{{
                                bank.accountData.accountNumber
                              }}</span>
                              <span class="text-gray-400 mx-2">•</span>
                              <span class="text-gray-600">{{ bank.accountData.accountName }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- วิธีการชำระเงิน -->
                  <div
                    v-if="
                      template.data.paymentMethods &&
                      Object.keys(template.data.paymentMethods).filter(
                        (k) => template.data.paymentMethods[k].checked,
                      ).length > 0
                    "
                  >
                    <div class="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div class="flex items-center gap-2 mb-2">
                        <i class="ph ph-wallet text-purple-600 text-lg"></i>
                        <span class="font-bold text-purple-800">วิธีการชำระเงิน</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <template
                          v-for="key in Object.keys(template.data.paymentMethods)"
                          :key="key"
                        >
                          <div
                            v-if="template.data.paymentMethods[key].checked"
                            class="bg-white/60 px-3 py-2 rounded-lg border border-purple-100"
                          >
                            <div class="flex items-center gap-2">
                              <span class="font-semibold text-slate-800">
                                {{
                                  key === 'cash'
                                    ? '💵 เงินสด'
                                    : key === 'check'
                                      ? '🏦 เช็ค'
                                      : key === 'debtor'
                                        ? '📝 ลูกหนี้'
                                        : key === 'other'
                                          ? `📋 ${template.data.paymentMethods[key].name || 'อื่นๆ'}`
                                          : key
                                }}
                              </span>
                            </div>
                            <!-- รายละเอียดเช็ค -->
                            <div
                              v-if="key === 'check'"
                              class="text-xs text-gray-600 mt-1 space-y-0.5"
                            >
                              <div v-if="template.data.paymentMethods[key].bankName">
                                ธนาคาร:
                                <span class="font-medium">{{
                                  template.data.paymentMethods[key].bankName
                                }}</span>
                              </div>
                              <div v-if="template.data.paymentMethods[key].checkNumber">
                                เลขที่เช็ค:
                                <span class="font-medium">{{
                                  template.data.paymentMethods[key].checkNumber
                                }}</span>
                              </div>
                              <div v-if="template.data.paymentMethods[key].NumIncheck">
                                เลขที่ในเช็ค:
                                <span class="font-medium">{{
                                  template.data.paymentMethods[key].NumIncheck
                                }}</span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>

                  <!-- Footer ภายใน Details -->
                  <div
                    class="flex items-center gap-4 pt-2 text-xs text-gray-500 border-t border-gray-200"
                  >
                    <span class="flex items-center gap-1">
                      <i class="ph ph-user"></i>
                      <span class="font-medium">{{
                        template.userName || authStore.user?.fullName
                      }}</span>
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="ph ph-calendar"></i>
                      {{
                        new Date(template.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- แสดงเมื่อไม่มี Template -->
          <div v-if="filteredTemplates.length === 0" class="text-center py-12 text-gray-500">
            <i class="ph ph-folder-open text-6xl mb-3 opacity-50"></i>
            <p class="text-lg font-medium">
              {{ searchTerm ? 'ไม่พบ Template ที่ค้นหา' : 'ยังไม่มี Template' }}
            </p>
            <p class="text-sm mt-1">กดปุ่ม "บันทึก Template" เพื่อเริ่มต้น</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import Selects from '@/components/input/select/select.vue'
import InputText from '@/components/input/inputtext.vue'
import ItemNameSelect from '@/components/TomSelect/ItemNameSelect.vue'
import SendMoneySelect from '@/components/TomSelect/SendMoneyTomSelect.vue'
import sidebar from '@/components/bar/sidebar.vue'
import {
  getAllOptions,
  isReceivableItem,
  getItemByName,
  getItemById,
} from '@/components/data/ItemNameOption'
import { useReceiptStore } from '@/stores/recipt'
import { useRowManager } from '@/components/Function/FuncForm'
import { useBankTransferManager } from '@/components/Function/FuncBank'
import { useAuthStore } from '@/stores/auth'
import BankAccountSelect from '@/components/TomSelect/BankAccountSelect.vue'
import { bankOptions, bankAccountOptions } from '@/components/utils/bankHelpers'
import { reciptService } from '@/services/ReciptService'
import AffiliationService from '@/services/affiliation/AffiliationService'
import { departmentOptions, initializeDepartmentOptions } from '@/components/data/TSdepartments'
// Initialize
const route = useRoute()
const router = useRouter()
const reciptStore = useReceiptStore()
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
const isApprovedMode = ref(false)
const originalApprovalStatus = ref('pending')

const {
  allowOnlyDigits,
  updateItemId,
  morelist,
  addRow,
  removeRow,
  handleTypeChange,
  formattedTotalAmount,
  expenseCount,
  expenseTotalAmount,
} = useRowManager()

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
const formattedNetTotal = computed(() => {
  return formatCurrency(netTotalAmount.value)
})
const sub1OptionsForSelect = computed(() =>
  sub1OptionsArray.value.map((opt) => ({
    label: opt.name, // โชว์
    value: opt.id, // เก็บ
  })),
)
const sub2OptionsForSelect = computed(() => {
  return sub2OptionsArray.value.map((opt) => ({
    label: opt.name,
    value: opt.id ?? opt.name,
  }))
})
const mainCategoryOptions = computed(() => {
  if (!departmentOptions.value) return []
  return Object.keys(departmentOptions.value)
})

watch(subId, (id) => {
  const found = sub1OptionsArray.value.find((o) => o.id === id)
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
  () =>
    morelist.value.map((row) => ({
      id: row.id,
      itemId: row.itemId,
      itemName: row.itemName,
    })),
  (newVal) => {
    console.log('📋 MoreList State:', newVal)
  },
  { deep: true },
)

watch(
  () => ({
    mainId: mainCategoryId.value,
    mainName: mainCategory.value,
    subId: subCategoryId.value,
    subName: subCategory.value,
    sub2Id: subCategoryId2.value,
    sub2Name: subCategory2.value,
  }),
  (newVal) => {
    console.log('🏢 Categories State:', newVal)
  },
  { deep: true },
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
      confirmButtonColor: '#7E22CE',
    })
    return
  }

  if (!authStore.user) {
    Swal.fire({
      icon: 'error',
      title: 'กรุณา Login ก่อน',
      confirmButtonColor: '#DC2626',
    })
    return
  }

  const receiptItems = morelist.value
    .filter((row) => row.itemName && row.itemName.trim() !== '')
    .map((row) => ({
      itemName: row.itemName,
      isExpense: row.isExpense || false,
    }))

  const template = {
    id: Date.now(),
    name: templateName.value.trim(),
    data: {
      // ✅ เก็บข้อมูลพื้นฐาน
      fullName: formData.value.fullName,
      phone: formData.value.phone,
      fundName: formData.value.fundName,
      sendmoney: formData.value.sendmoney,
      projectCode: formData.value.projectCode,
      
      // ✅ เก็บข้อมูล Category
      mainCategoryId: mainCategoryId.value,
      mainCategory: mainCategory.value,
      subCategoryId: subCategoryId.value,
      subCategory: subCategory.value,
      subCategoryId2: subCategoryId2.value,
      subCategory2: subCategory2.value,
      
      // ✅ เก็บรายการ
      receiptItems: receiptItems.map((item) => ({
        itemId: getItemByName(item.itemName)?.id,
        itemName: item.itemName,
        isExpense: item.isExpense,
      })),
    },
    userId: authStore.user.id,
    userName: authStore.user.fullName,
    affiliationId: authStore.user.affiliationId,
    affiliationName: authStore.user.affiliation,
    createdAt: new Date().toISOString(),
  }

  templates.value.push(template)

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
    showConfirmButton: false,
  })
}

// ✅ โหลด Template (รวมรายการนำส่งเงิน)
const loadTemplate = async (template) => {
  // โหลดข้อมูลพื้นฐาน
  formData.value.fullName = template.data.fullName
  formData.value.phone = template.data.phone
  formData.value.fundName = template.data.fundName
  formData.value.sendmoney = template.data.sendmoney
  formData.value.projectCode = template.data.projectCode

  // โหลด Categories
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

  // ล้าง morelist เก่า
  morelist.value = []
  await nextTick()

  // โหลดรายการ
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
        isExpense: item.isExpense || false,
      }
    })
  } else {
    addRow()
    addRow()
  }
  
  await nextTick()

  showLoadDialog.value = false

  Swal.fire({
    icon: 'success',
    title: 'โหลด Template สำเร็จ!',
    timer: 1500,
    showConfirmButton: false,
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
    cancelButtonText: 'ยกเลิก',
  }).then((result) => {
    if (result.isConfirmed) {
      templates.value = templates.value.filter((t) => t.id !== id)

      // ✅ อัพเดท localStorage ของ User นี้
      const storageKey = getTemplateStorageKey()
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(templates.value))
      }

      Swal.fire({
        icon: 'success',
        title: 'ลบ Template สำเร็จ!',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  })
}

// ✅ กรอง Template
const filteredTemplates = computed(() => {
  if (!searchTerm.value) return templates.value
  return templates.value.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

const expandedTemplates = ref({})

const toggleTemplateDetails = (templateId) => {
  expandedTemplates.value[templateId] = !expandedTemplates.value[templateId]
}

const isTemplateExpanded = (templateId) => {
  return expandedTemplates.value[templateId] || false
}

//--------------------------------------------------------------------------------------------

const handleExpenseToggle = (index) => {
  // เมื่อ toggle checkbox จะเปลี่ยน type
  morelist.value[index].type = morelist.value[index].isExpense ? 'expense' : 'income'

  // ✅ ถ้าเป็นรายจ่าย ให้ล้างข้อมูลการชำระเงินทั้งหมด
  if (morelist.value[index].isExpense) {
    morelist.value[index].paymentTypes = {
      cash: false,
      check: false,
      transfer: false,
    }
    morelist.value[index].checkDetails = {
      bankName: '',
      checkNumber: '',
      numInCheck: '',
    }
    morelist.value[index].transferDetails = {
      accountData: {
        accountNumber: '',
        bankName: '',
        accountName: '',
      },
    }
  }
}

const isExpenseRow = (index) => {
  if (!morelist.value[index]) return false
  return morelist.value[index].isExpense === true || morelist.value[index].type === 'expense'
}

// ✅ ฟังก์ชันจัดการเมื่อเปลี่ยนประเภทการชำระเงิน
const handlePaymentTypeChange = (index, type, checked) => {
  // เริ่มต้น object ถ้ายังไม่มี
  if (!morelist.value[index].paymentTypes) {
    morelist.value[index].paymentTypes = {
      cash: false,
      check: false,
      transfer: false,
    }
  }

  // เริ่มต้น checkDetails ถ้ายังไม่มี
  if (!morelist.value[index].checkDetails) {
    morelist.value[index].checkDetails = {
      bankName: '',
      checkNumber: '',
      numInCheck: '',
    }
  }

  // เริ่มต้น transferDetails ถ้ายังไม่มี
  if (!morelist.value[index].transferDetails) {
    morelist.value[index].transferDetails = {
      accountData: {
        accountNumber: '',
        bankName: '',
        accountName: '',
      },
    }
  }

  // อัพเดทสถานะ checkbox
  morelist.value[index].paymentTypes[type] = checked

  // ✅ ล้างข้อมูลเมื่อ uncheck
  if (!checked) {
    if (type === 'check') {
      morelist.value[index].checkDetails = {
        bankName: '',
        checkNumber: '',
        numInCheck: '',
      }
    }
    if (type === 'transfer') {
      morelist.value[index].transferDetails = {
        accountData: {
          accountNumber: '',
          bankName: '',
          accountName: '',
        },
      }
    }
  }
}

const transferTotalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    if (row.isCancelled) return sum
    if (row.paymentTypes?.transfer && row.transferDetails?.amount) {
      const amount = parseFloat(String(row.transferDetails.amount).replace(/,/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }
    return sum
  }, 0)
})

// ✅ นับจำนวนรายการเงินโอน
const transferCount = computed(() => {
  return morelist.value.filter((row) => row.paymentTypes?.transfer && row.amount).length
})

// ✅ คำนวณยอดรวมเช็ค
const checkTotalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    if (row.isCancelled) return sum
    if (row.paymentTypes?.check && row.checkDetails?.amount) {
      const amount = parseFloat(String(row.checkDetails.amount).replace(/,/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }
    return sum
  }, 0)
})

// ✅ นับจำนวนรายการเช็ค
const checkCount = computed(() => {
  return morelist.value.filter((row) => row.paymentTypes?.check && row.amount).length
})

// ✅ คำนวณยอดรวมเงินสด
const cashTotalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    if (row.isCancelled) return sum
    if (row.paymentTypes?.cash && row.cashDetails?.amount) {
      const amount = parseFloat(String(row.cashDetails.amount).replace(/,/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }
    return sum
  }, 0)
})

// ✅ นับจำนวนรายการเงินสด
const cashCount = computed(() => {
  return morelist.value.filter((row) => row.paymentTypes?.cash && row.amount).length
})

// ✅ คำนวณยอดรวมลูกหนี้ (อัตโนมัติ)
const debtorTotalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    if (row.isCancelled) return sum // ✅ ข้ามรายการที่ยกเลิก
    if (row.itemName && isReceivableItem(row.itemName) && row.amount) {
      const amount = parseFloat(String(row.amount).replace(/,/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }
    return sum
  }, 0)
})

// ✅ 5. ฟังก์ชันจัดการการยกเลิกรายการ
const handleCancelToggle = (index) => {
  const row = morelist.value[index]

  if (!isApprovedMode.value) {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่สามารถใช้งานได้',
      text: 'ฟีเจอร์นี้ใช้ได้เฉพาะโหมดแก้ไขใบนำส่งที่อนุมัติแล้วเท่านั้น',
      confirmButtonColor: '#F59E0B',
    })
    row.isCancelled = false
    return
  }

  // ✅ ถ้ากำลังจะยกเลิก (tick)
  if (row.isCancelled) {
    Swal.fire({
      title: 'ยืนยันการยกเลิกรายการ?',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>รายการ:</strong> ${row.itemName}</p>
          <p class="mb-2"><strong>จำนวนเงิน:</strong> ${formatCurrency(parseFloat(String(row.amount || '0').replace(/,/g, '')))} บาท</p>
          <p class="mt-3 text-sm text-amber-600">⚠️ รายการนี้จะถูกทำเครื่องหมาย "ยกเลิก" และไม่นับรวมในยอดเงิน</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✓ ยืนยันยกเลิกรายการ',
      confirmButtonColor: '#DC2626',
      cancelButtonText: 'ไม่ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) {
        row.isCancelled = false
      }
    })
  }
  // ✅ ถ้ากำลังจะยกเลิกการยกเลิก (untick)
  else {
    Swal.fire({
      title: 'ยกเลิกการยกเลิกรายการ?',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>รายการ:</strong> ${row.itemName}</p>
          <p class="mb-2"><strong>จำนวนเงิน:</strong> ${formatCurrency(parseFloat(String(row.amount || '0').replace(/,/g, '')))} บาท</p>
          <p class="mt-3 text-sm text-blue-600">ℹ️ รายการนี้จะกลับมานับรวมในยอดเงินอีกครั้ง</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✓ ยืนยัน',
      confirmButtonColor: '#3B82F6',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) {
        row.isCancelled = true // ✅ ให้กลับไปเป็น cancelled ถ้าไม่ confirm
      }
    })
  }
}
// ✅ นับจำนวนประเภททั้งหมด
const totalPaymentTypesCount = computed(() => {
  let count = 0
  if (transferTotalAmount.value > 0) count++
  if (checkTotalAmount.value > 0) count++
  if (cashTotalAmount.value > 0) count++
  if (debtorTotalAmount.value > 0) count++
  if (expenseTotalAmount.value > 0) count++
  return count
})

// ✅ ยอดรวมทั้งหมด
const grandTotalAmount = computed(() => {
  return (
    transferTotalAmount.value +
    checkTotalAmount.value +
    cashTotalAmount.value +
    debtorTotalAmount.value
  )
})

// ✅ Format currency
const formatCurrency = (value) => {
  if (!value) return '0.00'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
watch(
  () =>
    morelist.value.map((row) => ({
      amount: row.amount,
      paymentTypes: row.paymentTypes,
    })),
  () => {
    nextTick(() => {
      updateDebtorAmount()
    })
  },
  { deep: true, flush: 'post' },
)
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
    ENE: 'คณะพลังงานและสิ่งแวดล้อม',
    FIN: '', // กองคลัง ไม่ต้องเลือกให้
    UP: '', // มหาวิทยาลัย ไม่ต้องเลือกให้
  }

  return mapping[affiliationId] || ''
}
const updateDebtorAmount = () => {
  if (!morelist.value?.length || !paymentMethods.value?.debtor) return

  const totalDebtor = morelist.value
    .filter((row) => row?.itemName && isReceivableItem(row.itemName))
    .reduce((sum, row) => {
      const amount = parseFloat(String(row.amount || '0').replace(/,/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

  paymentMethods.value.debtor.checked = totalDebtor > 0
  paymentMethods.value.debtor.amount =
    totalDebtor > 0
      ? totalDebtor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ''
}

// ✅ Watch รายการเพื่ออัพเดทลูกหนี้
watch(
  () => morelist.value.map((row) => ({ itemName: row.itemName, amount: row.amount })),
  () => {
    nextTick(() => {
      updateDebtorAmount()
    })
  },
  { deep: true, flush: 'post' }, // ⭐ เพิ่ม flush: 'post'
)
onMounted(async () => {
  // โหลด department options จาก Service
  await loadDepartmentOptions()
  console.log('📋 Department options after loading:', departmentOptions.value)
  // ✅ ถ้าเป็น edit mode ให้โหลดข้อมูล
  if (isEditMode.value) {
    await loadReceiptData()
  } else {
    // ✅ ถ้าเป็นโหมดสร้างใหม่และมี affiliationId
    if (authStore.user?.affiliationId) {
      const defaultCategory = mapAffiliationToMainCategory(authStore.user.affiliationId)
      if (defaultCategory) {
        mainCategory.value = defaultCategory
        const categoryData = departmentOptions.value[defaultCategory]
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
const isLoadingDepartments = ref(false)
const loadDepartmentOptions = async () => {
  isLoadingDepartments.value = true
  try {
    console.log('🔄 Loading department options from AffiliationService...')

    // ✅ เรียกใช้ generateDepartmentOptions เพื่อสร้างข้อมูลใหม่
    const options = await AffiliationService.generateDepartmentOptions()

    // ✅ ตรวจสอบว่ามีข้อมูลหรือไม่
    if (!options || Object.keys(options).length === 0) {
      console.warn('⚠️ No department options generated, using fallback')
      // ✅ ลอง re-initialize
      initializeDepartmentOptions()
    }

    console.log(
      '✅ Loaded department options:',
      Object.keys(departmentOptions.value).length,
      'faculties',
    )
  } catch (error) {
    console.error('❌ Error loading department options:', error)

    // ✅ Fallback: ลอง initialize ใหม่
    try {
      console.log('🔄 Trying to initialize department options again...')
      initializeDepartmentOptions()
      console.log('✅ Successfully initialized department options')
    } catch (fallbackError) {
      console.error('❌ Failed to initialize:', fallbackError)
      departmentOptions.value = {}
    }
  } finally {
    isLoadingDepartments.value = false
  }
}

watch(
  () => departmentOptions.value,
  (newVal) => {
    console.log('🔍 departmentOptions changed:', {
      keys: Object.keys(newVal),
      count: Object.keys(newVal).length,
      data: newVal,
    })
  },
  { deep: true, immediate: true },
)

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

// ฟังก์ชันจัดการ input จำนวนเงินส่วนที่ 3
const handlePaymentAmountInput = (index, type, event) => {
  const value = event.target.value.replace(/[^0-9.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) return

  // อัพเดทค่าตาม type
  if (type === 'cash') {
    if (!morelist.value[index].cashDetails) {
      morelist.value[index].cashDetails = { amount: '' }
    }
    morelist.value[index].cashDetails.amount = value
    clearRowError(index, 'cashAmount') // ✅ เพิ่ม clear error
  } else if (type === 'check') {
    if (!morelist.value[index].checkDetails) {
      morelist.value[index].checkDetails = {
        amount: '',
        bankName: '',
        checkNumber: '',
        numInCheck: '',
      }
    }
    morelist.value[index].checkDetails.amount = value
    clearRowError(index, 'checkAmount') // ✅ เพิ่ม clear error
  } else if (type === 'transfer') {
    if (!morelist.value[index].transferDetails) {
      morelist.value[index].transferDetails = {
        amount: '',
        accountData: {
          accountNumber: '',
          bankName: '',
          accountName: '',
        },
      }
    }
    morelist.value[index].transferDetails.amount = value
    clearRowError(index, 'transferAmount') // ✅ เพิ่ม clear error
  }
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

const formatPaymentAmountOnBlur = (index, type) => {
  let value = ''

  if (type === 'cash') {
    value = morelist.value[index].cashDetails?.amount
  } else if (type === 'check') {
    value = morelist.value[index].checkDetails?.amount
  } else if (type === 'transfer') {
    value = morelist.value[index].transferDetails?.amount
  }

  if (!value) return

  const cleanValue = value.toString().replace(/,/g, '')
  const numValue = parseFloat(cleanValue)

  if (isNaN(numValue)) {
    // ล้างค่าถ้าไม่ใช่ตัวเลข
    if (type === 'cash' && morelist.value[index].cashDetails) {
      morelist.value[index].cashDetails.amount = ''
    } else if (type === 'check' && morelist.value[index].checkDetails) {
      morelist.value[index].checkDetails.amount = ''
    } else if (type === 'transfer' && morelist.value[index].transferDetails) {
      morelist.value[index].transferDetails.amount = ''
    }
    return
  }

  const formatted = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // อัพเดทค่า formatted
  if (type === 'cash' && morelist.value[index].cashDetails) {
    morelist.value[index].cashDetails.amount = formatted
  } else if (type === 'check' && morelist.value[index].checkDetails) {
    morelist.value[index].checkDetails.amount = formatted
  } else if (type === 'transfer' && morelist.value[index].transferDetails) {
    morelist.value[index].transferDetails.amount = formatted
  }
}
const hasAnyPaymentType = (index) => {
  const row = morelist.value[index]
  if (!row) return true // ✅ default ให้ปิด

  // ✅ ถ้าเป็นลูกหนี้หรือรายจ่าย → คืนค่า false (เปิดให้กรอก)
  if (isReceivableItem(row.itemName) || isExpenseRow(index)) {
    return false
  }

  // ✅ รายการทั่วไป → คืนค่า true เสมอ (ปิดช่อง)
  return true
}

// ✅ คำนวณยอดรวมจากประเภทการชำระ
const calculatePaymentTotal = (index) => {
  const row = morelist.value[index]
  if (!row) return 0

  let total = 0

  if (row.paymentTypes?.cash && row.cashDetails?.amount) {
    total += parseFloat(String(row.cashDetails.amount).replace(/,/g, '')) || 0
  }
  if (row.paymentTypes?.check && row.checkDetails?.amount) {
    total += parseFloat(String(row.checkDetails.amount).replace(/,/g, '')) || 0
  }
  if (row.paymentTypes?.transfer && row.transferDetails?.amount) {
    total += parseFloat(String(row.transferDetails.amount).replace(/,/g, '')) || 0
  }

  return total
}
// ✅ คำนวณยอดรวมของแต่ละรายการจากประเภทการชำระ
const calculateRowTotal = (index) => {
  const row = morelist.value[index]
  if (!row) return 0

  let total = 0

  // รวมจากเงินสด
  if (row.paymentTypes?.cash && row.cashDetails?.amount) {
    const cashAmount = parseFloat(String(row.cashDetails.amount).replace(/,/g, ''))
    if (!isNaN(cashAmount)) total += cashAmount
  }

  // รวมจากเช็ค
  if (row.paymentTypes?.check && row.checkDetails?.amount) {
    const checkAmount = parseFloat(String(row.checkDetails.amount).replace(/,/g, ''))
    if (!isNaN(checkAmount)) total += checkAmount
  }

  // รวมจากเงินโอน
  if (row.paymentTypes?.transfer && row.transferDetails?.amount) {
    const transferAmount = parseFloat(String(row.transferDetails.amount).replace(/,/g, ''))
    if (!isNaN(transferAmount)) total += transferAmount
  }

  return total
}

// ✅ Watch เพื่ออัพเดทยอดรวมของแต่ละรายการเมื่อมีการเปลี่ยนแปลง
watch(
  () =>
    morelist.value.map((row) => ({
      cashAmount: row.cashDetails?.amount,
      checkAmount: row.checkDetails?.amount,
      transferAmount: row.transferDetails?.amount,
      paymentTypes: row.paymentTypes,
    })),
  () => {
    morelist.value.forEach((row, index) => {
      // ✅ คำนวณเฉพาะรายการที่มี payment types
      if (hasAnyPaymentType(index)) {
        const total = calculatePaymentTotal(index)
        if (total > 0) {
          row.amount = total.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        } else {
          row.amount = ''
        }
      }
      // ✅ ถ้าไม่มี payment types (ลูกหนี้/รายจ่าย) ให้กรอกเองได้
    })
  },
  { deep: true },
)

const handleAmountInput = (index, event) => {
  // ✅ ถ้ามี payment types แล้ว ไม่ให้แก้ไขช่องนี้
  if (hasAnyPaymentType(index)) {
    return
  }

  // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
  const value = event.target.value.replace(/[^0-9.]/g, '')

  // ป้องกันจุดทศนิยมมากกว่า 1 จุด
  const parts = value.split('.')
  if (parts.length > 2) {
    return
  }

  morelist.value[index].amount = value
  clearRowError(index, 'amount')
  updateDebtorAmount()
}

const formatDisplayAmount = (value) => {
  if (value === null || value === undefined || value === '') return ''

  const clean = String(value).replace(/,/g, '').trim()

  if (clean === '') return ''

  const num = Number(clean)

  if (isNaN(num)) return ''

  return num.toLocaleString('en-US')
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
  if (!mainCategory.value || !departmentOptions.value) return []

  const data = departmentOptions.value[mainCategory.value]

  if (!data || !Array.isArray(data.main)) {
    return []
  }

  return data.main
})

const sub2OptionsArray = computed(() => {
  if (!mainCategory.value || !subCategory.value || !departmentOptions.value) return []

  const data = departmentOptions.value[mainCategory.value]

  if (!data || !Array.isArray(data.subs)) {
    return []
  }

  return data.subs
})

const hasAnySub = computed(() => {
  if (!mainCategory.value || !departmentOptions.value) return false
  const data = departmentOptions.value[mainCategory.value]
  if (!data) return false

  const main = data.main
  return main !== null && (typeof main === 'string' || (Array.isArray(main) && main.length > 0))
})

const hasSub2 = computed(() => {
  if (!mainCategory.value || !subCategory.value || !departmentOptions.value) return false
  const data = departmentOptions.value[mainCategory.value]
  if (!data) return false

  const subs = data.subs
  return Array.isArray(subs) && subs.length > 0
})

watch(mainCategory, (newVal) => {
  if (!departmentOptions.value) return
  const data = departmentOptions.value[newVal]
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
  console.log('🏢 subCategory changed:', {
    id: newVal,
    name: sub1OptionsArray.value.find((o) => o.id === newVal)?.name,
  })
})

watch(subCategory2, (newVal) => {
  if (!newVal) {
    subCategoryId2.value = ''
    return
  }
  subCategoryId2.value = newVal
  console.log('🏢 subCategory2 changed:', {
    id: newVal,
    name: sub2OptionsArray.value.find((o) => o.id === newVal)?.name,
  })
})

const gotomainpage = () => {
  router.push('/indexwaybill')
}
// ========================================
// ✅ loadReceiptData() - เวอร์ชันสุดท้ายที่รองรับลูกหนี้และรายจ่าย
// ========================================

const loadReceiptData = async () => {
  if (!receiptId.value) {
    console.warn('⚠️ No receipt ID provided')
    return
  }

  isLoading.value = true

  try {
    console.log('🔄 Loading receipt:', receiptId.value)
    const data = await reciptService.getById(receiptId.value)

    if (!data) {
      throw new Error('ไม่พบข้อมูลใบนำส่ง')
    }

    console.log('📦 Loaded receipt data:', data)

    // ✅ 1. เก็บสถานะเดิม
    originalApprovalStatus.value = data.approvalStatus || 'pending'
    isApprovedMode.value = data.approvalStatus === 'approved'

    // ✅ 2. โหลดข้อมูลพื้นฐานจาก profile
    formData.value.waybillNumber = data.waybillNumber || data.id || ''
    
    // ✅ อ่านจาก profile object (รองรับทั้งโครงสร้างเก่าและใหม่)
    formData.value.fullName = data.profile?.fullName || data.fullName || ''
    formData.value.phone = data.profile?.phone || data.phone || ''
    formData.value.fundName = data.profile?.fundName || data.fundName || ''
    formData.value.projectCode = data.profile?.projectCode || data.projectCode || ''
    formData.value.sendmoney = data.profile?.sendmoney || data.profile?.moneyType || data.sendmoney || data.moneyType || ''

    // ✅ 3. โหลด Main Category
    const mainAffId = data.profile?.mainAffiliationId || data.mainAffiliationId
    const mainAffName = data.profile?.mainAffiliationName || data.mainAffiliationName
    
    if (mainAffId && mainAffName) {
      mainCategoryId.value = mainAffId
      mainCategory.value = mainAffName
      await nextTick()
      console.log('✅ Loaded main category:', mainCategory.value)
    }

    // ✅ 4. โหลด Sub Category 1
    const subAffId1 = data.profile?.subAffiliationId1 || data.subAffiliationId1
    
    if (subAffId1) {
      subCategoryId.value = subAffId1
      subCategory.value = subAffId1
      await nextTick()
      console.log('✅ Loaded sub category 1:', subCategory.value)
    }

    // ✅ 5. โหลด Sub Category 2
    const subAffId2 = data.profile?.subAffiliationId2 || data.subAffiliationId2
    
    if (subAffId2) {
      subCategoryId2.value = subAffId2
      subCategory2.value = subAffId2
      await nextTick()
      console.log('✅ Loaded sub category 2:', subCategory2.value)
    }

    // ✅ 6. โหลด receiptList พร้อมการจัดการข้อมูลครบถ้วน
    if (data.receiptList && Array.isArray(data.receiptList) && data.receiptList.length > 0) {
      console.log('📋 Raw receiptList from service:', JSON.stringify(data.receiptList, null, 2))

      morelist.value = data.receiptList.map((item, index) => {
        let itemData = null
        if (item.itemId) {
          itemData = getItemById(item.itemId)
        }
        if (!itemData && item.itemName) {
          itemData = getItemByName(item.itemName)
        }

        const itemName = itemData?.name || item.itemName || ''
        const isReceivable = isReceivableItem(itemName)
        const isExpense = item.type === 'expense'

        console.log(`🔍 Item ${index + 1}: "${itemName}"`, {
          isReceivable,
          isExpense,
          amount: item.amount,
          paymentTypes: item.paymentTypes,
        })

        const row = {
          id: index + 1,
          referenceNo: item.referenceNo || '',
          itemId: itemData?.id || item.itemId || null,
          itemName: itemName,
          note: item.note || '',
          amount: item.amount || 0,
          type: item.type || 'income',
          isExpense: isExpense,
          isCancelled: item.isCancelled || false,

          paymentTypes: {
            cash: item.paymentTypes?.cash || false,
            check: item.paymentTypes?.check || false,
            transfer: item.paymentTypes?.transfer || false,
          },

          cashDetails: {
            amount: item.cashDetails?.amount || '',
          },

          checkDetails: {
            amount: item.checkDetails?.amount || '',
            bankName: item.checkDetails?.bankName || '',
            checkNumber: item.checkDetails?.checkNumber || '',
            numInCheck: item.checkDetails?.numInCheck || '',
          },

          transferDetails: {
            amount: item.transferDetails?.amount || '',
            accountData: {
              accountNumber: item.transferDetails?.accountData?.accountNumber || '',
              bankName: item.transferDetails?.accountData?.bankName || '',
              accountName: item.transferDetails?.accountData?.accountName || '',
            },
          },
        }

        console.log(`📝 Created row ${index + 1}:`, {
          itemName: row.itemName,
          itemId: row.itemId,
          amount: row.amount,
          isReceivable,
          isExpense,
          paymentTypes: row.paymentTypes,
        })

        return row
      })

      await nextTick()
      
      // ✅ 7. Format amount สำหรับทุกช่องทาง
      morelist.value.forEach((row, index) => {
        const isReceivable = isReceivableItem(row.itemName)
        const isExpense = row.isExpense

        console.log(`🔍 Before format row ${index + 1}:`, {
          itemName: row.itemName,
          isReceivable,
          isExpense,
          rawAmount: row.amount,
          cashAmount: row.cashDetails?.amount,
          checkAmount: row.checkDetails?.amount,
          transferAmount: row.transferDetails?.amount,
          paymentTypes: row.paymentTypes,
        })

        // Format amount หลัก
        if (row.amount !== undefined && row.amount !== null && row.amount !== '') {
          const numAmount =
            typeof row.amount === 'string'
              ? parseFloat(row.amount.replace(/,/g, ''))
              : Number(row.amount)

          if (!isNaN(numAmount)) {
            row.amount = numAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            console.log(`💰 Main amount formatted: ${numAmount} → ${row.amount}`)
          } else {
            row.amount = '0.00'
          }
        }

        // Format cashDetails.amount
        if (
          !isReceivable &&
          !isExpense &&
          row.cashDetails?.amount !== undefined &&
          row.cashDetails?.amount !== ''
        ) {
          const cashAmount =
            typeof row.cashDetails.amount === 'string'
              ? parseFloat(String(row.cashDetails.amount).replace(/,/g, ''))
              : Number(row.cashDetails.amount)

          if (!isNaN(cashAmount)) {
            row.cashDetails.amount = cashAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            console.log(`💵 Cash formatted: ${cashAmount} → ${row.cashDetails.amount}`)
          } else {
            row.cashDetails.amount = ''
          }
        }

        // Format checkDetails.amount
        if (
          !isReceivable &&
          !isExpense &&
          row.checkDetails?.amount !== undefined &&
          row.checkDetails?.amount !== ''
        ) {
          const checkAmount =
            typeof row.checkDetails.amount === 'string'
              ? parseFloat(String(row.checkDetails.amount).replace(/,/g, ''))
              : Number(row.checkDetails.amount)

          if (!isNaN(checkAmount)) {
            row.checkDetails.amount = checkAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            console.log(`📝 Check formatted: ${checkAmount} → ${row.checkDetails.amount}`)
          } else {
            row.checkDetails.amount = ''
          }
        }

        // Format transferDetails.amount
        if (
          !isReceivable &&
          !isExpense &&
          row.transferDetails?.amount !== undefined &&
          row.transferDetails?.amount !== ''
        ) {
          const transferAmount =
            typeof row.transferDetails.amount === 'string'
              ? parseFloat(String(row.transferDetails.amount).replace(/,/g, ''))
              : Number(row.transferDetails.amount)

          if (!isNaN(transferAmount)) {
            row.transferDetails.amount = transferAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            console.log(`🏦 Transfer formatted: ${transferAmount} → ${row.transferDetails.amount}`)
          } else {
            row.transferDetails.amount = ''
          }
        }

        console.log(`✅ After format row ${index + 1}:`, {
          itemName: row.itemName,
          isReceivable,
          isExpense,
          amount: row.amount,
          cashAmount: row.cashDetails?.amount,
          checkAmount: row.checkDetails?.amount,
          transferAmount: row.transferDetails?.amount,
        })
      })

      await nextTick()

      // ✅ 8. Init TomSelect สำหรับแต่ละแถว
      morelist.value.forEach((_, i) => {
        initItemNameTomSelect(i)
      })

      console.log('✅ Loaded morelist:', morelist.value.length, 'items')
    } else {
      console.log('ℹ️ No receipt items, adding empty row')
      addRow()
    }

    await nextTick()

    // ✅ 9. อัพเดทยอดลูกหนี้
    updateDebtorAmount()

    // ✅ 10. แสดง alert ถ้าเป็นโหมด approved
    if (isApprovedMode.value) {
      await Swal.fire({
        icon: 'info',
        title: 'โหมดแก้ไขแบบจำกัด',
        html: `
          <div class="text-left">
            <p class="mb-2">ใบนำส่งนี้ได้รับการอนุมัติแล้ว</p>
            <p class="mb-2 font-semibold text-blue-600">คุณสามารถยกเลิกรายการได้เท่านั้น</p>
            <p class="mb-2 text-red-500">* เนื่องจากใบนำส่งนี้ได้รับการอนุมัติแล้วจึงไม่สามารถแก้ไขข้อมูลผู้บันทึกหรือข้อมูลรายการใดๆได้ทั้งนั้น
               นอกจากการยกเลิกรายการเท่านั้น</p>
            </ul>
          </div>
        `,
        confirmButtonText: 'เข้าใจแล้ว',
        confirmButtonColor: '#3B82F6',
      })
    }

    // ✅ 11. แสดงข้อความสำเร็จ
    await Swal.fire({
      icon: 'success',
      title: 'โหลดข้อมูลสำเร็จ',
      text: `ใบนำส่งเลขที่ ${formData.value.waybillNumber}`,
      timer: 1500,
      showConfirmButton: false,
    })

    console.log('✅ Load receipt completed successfully')
  } catch (err) {
    console.error('❌ Load error:', err)

    await Swal.fire({
      icon: 'error',
      title: 'ไม่สามารถโหลดข้อมูลได้',
      text: err.message || 'กรุณาลองใหม่อีกครั้ง',
      confirmButtonColor: '#DC2626',
    })

    router.push('/indexwaybill')
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
    // ✅ ข้ามรายการที่ยกเลิก
    if (row.isCancelled) return

    const cleanAmount = parseFloat(String(row.amount || '0').replace(/,/g, ''))

    if (!isNaN(cleanAmount)) {
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
const saveData = async () => {
  errors.value = {
    paymentMethods: {},
    bankTransfers: {},
    rows: {}
  }
  let hasError = false

  // ✅ โหมด approved: validate แค่การยกเลิก
  if (isApprovedMode.value) {
    const hasCancelledItems = morelist.value.some((row) => row.isCancelled)

    const confirmResult = await Swal.fire({
      title: hasCancelledItems ? 'ยืนยันการบันทึกการเปลี่ยนแปลง?' : 'ยืนยันการบันทึก?',
      html: hasCancelledItems
        ? `<div class="text-left">
            <p class="mb-2">คุณได้ยกเลิกรายการจำนวน <strong>${morelist.value.filter((r) => r.isCancelled).length}</strong> รายการ</p>
            <p class="text-sm text-gray-600">ยอดเงินสุทธิใหม่: <strong>${formatCurrency(netTotalAmount.value)}</strong> บาท</p>
          </div>`
        : '<p>ไม่มีการเปลี่ยนแปลงรายการ คุณต้องการบันทึกต่อหรือไม่?</p>',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      confirmButtonColor: '#7E22CE',
      cancelButtonText: 'ยกเลิก',
    })

    if (!confirmResult.isConfirmed) {
      return
    }
  } else {
    // ========================================
    // ✅ กรองรายการที่ว่างเปล่าออก
    // ========================================
    const filteredRows = morelist.value.filter(row => {
      const hasItemName = row.itemName && row.itemName.trim() !== ''
      const cleanAmount = parseFloat(String(row.amount || '').replace(/,/g, ''))
      const hasAmount = cleanAmount && cleanAmount > 0
      return hasItemName || hasAmount // เก็บเฉพาะรายการที่มีข้อมูล
    })

    // ========================================
    // ✅ Validate ส่วนที่ 1: ข้อมูลพื้นฐาน
    // ========================================
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

    // ========================================
    // ✅ Validate ส่วนที่ 2: รายการนำส่งเงิน (ใช้ filteredRows)
    // ========================================
    errors.value.rows = {}
    
    // ✅ ตรวจสอบว่ามีรายการอย่างน้อย 1 รายการหลังกรองแล้ว
    if (filteredRows.length === 0) {
      errors.value.noItems = 'กรุณาเพิ่มรายการนำส่งเงินอย่างน้อย 1 รายการ'
      hasError = true
    }

    // ✅ Validate เฉพาะรายการที่มีข้อมูล (filteredRows)
    filteredRows.forEach((row) => {
      // หา index ของรายการนี้ใน morelist.value เพื่อแสดง error
      const originalIndex = morelist.value.findIndex(r => r.id === row.id)
      
      const hasItemName = row.itemName && row.itemName.trim() !== ''
      const cleanAmount = parseFloat(String(row.amount || '').replace(/,/g, ''))
      const hasAmount = cleanAmount && cleanAmount > 0

      const rowErrors = {}

      // 1. Validate ชื่อรายการ
      if (!hasItemName) {
        rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"'
      }

      // 2. Validate จำนวนเงิน
      if (!hasAmount) {
        rowErrors.amount = 'กรุณากรอก "จำนวนเงิน"'
      }

      // 3. Validate ช่องทางการชำระเงิน
      const isReceivableRow = row.itemName && isReceivableItem(row.itemName)
      const isExpense = row.type === 'expense'
      const needsPaymentType = !isExpense && !isReceivableRow

      if (needsPaymentType && hasItemName && hasAmount) {
        const hasAnyPaymentType =
          row.paymentTypes?.cash || row.paymentTypes?.check || row.paymentTypes?.transfer

        if (!hasAnyPaymentType) {
          rowErrors.paymentTypes = 'กรุณาเลือกช่องทางการชำระเงินอย่างน้อย 1 ช่องทาง'
        } else {
          // 4. Validate จำนวนเงินในแต่ละช่องทาง
          
          // 4.1 เงินสด
          if (row.paymentTypes?.cash) {
            const cashAmount = parseFloat(String(row.cashDetails?.amount || '0').replace(/,/g, ''))
            if (!cashAmount || cashAmount <= 0) {
              rowErrors.cashAmount = 'กรุณากรอกจำนวนเงินสด'
            }
          }

          // 4.2 เช็ค
          if (row.paymentTypes?.check) {
            const checkAmount = parseFloat(String(row.checkDetails?.amount || '0').replace(/,/g, ''))
            if (!checkAmount || checkAmount <= 0) {
              rowErrors.checkAmount = 'กรุณากรอกจำนวนเงินเช็ค'
            }
            if (!row.checkDetails?.bankName || row.checkDetails.bankName.trim() === '') {
              rowErrors.checkBankName = 'กรุณาเลือกธนาคาร'
            }
            if (!row.checkDetails?.checkNumber || row.checkDetails.checkNumber.trim() === '') {
              rowErrors.checkNumber = 'กรุณากรอกเลขที่เช็ค'
            }
            if (!row.checkDetails?.numInCheck || row.checkDetails.numInCheck.trim() === '') {
              rowErrors.checkNumInCheck = 'กรุณากรอกเลขที่ในเช็ค'
            }
          }

          // 4.3 เงินโอน
          if (row.paymentTypes?.transfer) {
            const transferAmount = parseFloat(String(row.transferDetails?.amount || '0').replace(/,/g, ''))
            if (!transferAmount || transferAmount <= 0) {
              rowErrors.transferAmount = 'กรุณากรอกจำนวนเงินโอน'
            }
            if (!row.transferDetails?.accountData?.accountNumber || 
                row.transferDetails.accountData.accountNumber.trim() === '') {
              rowErrors.transferAccount = 'กรุณาเลือกบัญชีธนาคาร'
            }
          }

          // 5. Validate ยอดรวมจากช่องทางการชำระ
          const totalPaymentAmount = 
            (row.paymentTypes?.cash ? parseFloat(String(row.cashDetails?.amount || '0').replace(/,/g, '')) : 0) +
            (row.paymentTypes?.check ? parseFloat(String(row.checkDetails?.amount || '0').replace(/,/g, '')) : 0) +
            (row.paymentTypes?.transfer ? parseFloat(String(row.transferDetails?.amount || '0').replace(/,/g, '')) : 0)
          
          const mainAmount = parseFloat(String(row.amount || '0').replace(/,/g, ''))
          
          if (Math.abs(totalPaymentAmount - mainAmount) > 0.01) {
            rowErrors.paymentMismatch = `ยอดรวมจากช่องทางการชำระ (${formatCurrency(totalPaymentAmount)} บาท) ไม่ตรงกับจำนวนเงินรวม (${formatCurrency(mainAmount)} บาท)`
          }
        }
      }

      // ✅ เก็บ errors ของรายการนี้ (ใช้ originalIndex เพื่อแสดง error ที่ตำแหน่งเดิม)
      if (Object.keys(rowErrors).length > 0) {
        errors.value.rows[originalIndex] = rowErrors
        hasError = true
      }
    })

    // ========================================
    // ✅ แสดง Error Message รวม (ถ้ามี error)
    // ========================================
    if (hasError) {
      const section1Errors = []
      const section2ErrorCount = Object.keys(errors.value.rows || {}).length
      
      // รวบรวม error ส่วนที่ 1
      if (errors.value.waybillNumber) section1Errors.push('เลขที่นำส่ง')
      if (errors.value.fullName) section1Errors.push('ชื่อ-นามสกุล')
      if (errors.value.phone) section1Errors.push('เบอร์โทรติดต่อ')
      if (errors.value.mainCategory) section1Errors.push('หน่วยงาน')
      if (errors.value.subCategory) section1Errors.push('หน่วยงานรอง')
      if (errors.value.subCategory2) section1Errors.push('หน่วยงานย่อย')
      if (errors.value.fundName) section1Errors.push('กองทุน')
      if (errors.value.sendmoney) section1Errors.push('ขอนำส่งเงิน')

      // รวบรวม error รายการในส่วนที่ 2
      const section2Details = []
      Object.entries(errors.value.rows || {}).forEach(([index, rowErrors]) => {
        const rowNum = parseInt(index) + 1
        const errorList = Object.values(rowErrors)
        section2Details.push(`
          <li class="mb-2">
            <strong class="text-red-600">รายการที่ ${rowNum}:</strong>
            <ul class="list-disc pl-5 mt-1">
              ${errorList.map(err => `<li class="text-sm">${err}</li>`).join('')}
            </ul>
          </li>
        `)
      })

      let errorHTML = '<div class="text-left">'
      
      // แสดง error ส่วนที่ 1
      if (section1Errors.length > 0) {
        errorHTML += `
          <div class="mb-4">
            <p class="font-semibold text-red-600 mb-2">📝 ส่วนที่ 1: ข้อมูลผู้บันทึก (${section1Errors.length} ข้อผิดพลาด)</p>
            <ul class="list-disc pl-5 text-sm space-y-1">
              ${section1Errors.map(field => `<li>กรุณากรอก "${field}"</li>`).join('')}
            </ul>
          </div>
        `
      }

      // แสดง error ส่วนที่ 2
      if (errors.value.noItems) {
        errorHTML += `
          <div class="mb-4">
            <p class="font-semibold text-red-600 mb-2">💰 ส่วนที่ 2: รายการนำส่งเงิน</p>
            <p class="text-sm text-red-600">${errors.value.noItems}</p>
          </div>
        `
      } else if (section2ErrorCount > 0) {
        errorHTML += `
          <div class="mb-4">
            <p class="font-semibold text-red-600 mb-2">💰 ส่วนที่ 2: รายการนำส่งเงิน (${section2ErrorCount} รายการมีข้อผิดพลาด)</p>
            <ul class="space-y-2">
              ${section2Details.join('')}
            </ul>
          </div>
        `
      }

      errorHTML += '<p class="mt-4 text-xs text-gray-600 border-t pt-3">💡 กรุณาตรวจสอบและแก้ไขข้อมูลที่แสดงข้อผิดพลาด (ข้อความสีแดงใต้ช่องกรอก)</p>'
      errorHTML += '</div>'

      await Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        html: errorHTML,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#7E22CE',
        width: '700px',
        customClass: {
          htmlContainer: 'text-left'
        }
      })
      
      return
    }
  }

  // ========================================
  // ✅ ดำเนินการบันทึกข้อมูล (ใช้เฉพาะรายการที่มีข้อมูล)
  // ========================================
  Swal.fire({
    title: 'กำลังบันทึกการเปลี่ยนแปลง...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  const currentDateTime = new Date().toISOString()

  // ✅ กรองเฉพาะรายการที่มีข้อมูล
  const rowsToSave = morelist.value.filter(row => {
    const hasItemName = row.itemName && row.itemName.trim() !== ''
    const cleanAmount = parseFloat(String(row.amount || '').replace(/,/g, ''))
    const hasAmount = cleanAmount && cleanAmount > 0
    return hasItemName || hasAmount
  })

  // ✅ สร้าง payload พร้อมสถานะการยกเลิก
  const validRows = rowsToSave.map((row) => {
    const cleanAmount = parseFloat(String(row.amount || '').replace(/,/g, ''))
    const item = getItemByName(row.itemName)

    // ✅ จัดการ referenceNo สำหรับรายการที่ยกเลิก
    let referenceNo = row.referenceNo || ''

    if (row.isCancelled) {
      if (referenceNo) {
        if (!referenceNo.includes('ยกเลิก')) {
          referenceNo = `${referenceNo} (ยกเลิก)`
        }
      } else {
        referenceNo = '(ยกเลิก)'
      }
    }

    return {
      itemName: row.itemName || '',
      itemId: item?.id,
      note: row.note || '',
      referenceNo: referenceNo,
      amount: cleanAmount,
      type: row.type || 'income',
      isCancelled: row.isCancelled || false,
      paymentTypes: row.paymentTypes || {
        cash: false,
        check: false,
        transfer: false,
      },
      cashDetails: row.paymentTypes?.cash
        ? {
            amount: parseFloat(String(row.cashDetails?.amount || '0').replace(/,/g, '')),
          }
        : undefined,

      checkDetails: row.paymentTypes?.check
        ? {
            amount: parseFloat(String(row.checkDetails?.amount || '0').replace(/,/g, '')),
            bankName: row.checkDetails?.bankName || '',
            checkNumber: row.checkDetails?.checkNumber || '',
            numInCheck: row.checkDetails?.numInCheck || '',
          }
        : undefined,

      transferDetails: row.paymentTypes?.transfer
        ? {
            amount: parseFloat(String(row.transferDetails?.amount || '0').replace(/,/g, '')),
            accountData: row.transferDetails?.accountData || {
              accountNumber: '',
              bankName: '',
              accountName: '',
            },
          }
        : undefined,
    }
  })

  const getSubName1 = () => {
    if (!subCategoryId.value) return ''
    const found = sub1OptionsArray.value.find((opt) => opt.id === subCategoryId.value)
    return found?.name || ''
  }

  const getSubName2 = () => {
    if (!subCategoryId2.value) return ''
    const found = sub2OptionsArray.value.find((opt) => opt.id === subCategoryId2.value)
    return found?.name || ''
  }

  const payload = {
    waybillNumber: formData.value.waybillNumber,
    profile: {
      fullName: formData.value.fullName,
      phone: formData.value.phone,
      fundName: formData.value.fundName,
      projectCode: formData.value.projectCode,
      sendmoney: formData.value.sendmoney,
      affiliationId: authStore.user?.affiliationId || '',
      affiliationName: authStore.user?.affiliation || mainCategory.value,
      mainAffiliationId: mainCategoryId.value,
      mainAffiliationName: mainCategory.value,
      subAffiliationId1: subCategoryId.value,
      subAffiliationName1: getSubName1(),
      subAffiliationId2: subCategoryId2.value,
      subAffiliationName2: getSubName2(),
    },

    netTotalAmount: netTotalAmount.value,
    receiptList: validRows,
    approvalStatus: originalApprovalStatus.value,
  }

  if (isEditMode.value) {
    payload.id = formData.value.waybillNumber
    payload.updatedAt = currentDateTime
  } else {
    payload.id = formData.value.waybillNumber
    payload.createdAt = currentDateTime
    payload.updatedAt = currentDateTime
  }

  try {
    const result = isEditMode.value
      ? await reciptService.update(receiptId.value, payload)
      : await reciptService.create(payload)

    await nextTick()
    localStorage.setItem('receipts_last_update', Date.now().toString())
    window.dispatchEvent(
      new CustomEvent('receipts-updated', {
        detail: { action: isEditMode.value ? 'update' : 'create' },
      }),
    )

    const cancelledCount = validRows.filter((r) => r.isCancelled).length

    await Swal.fire({
      icon: 'success',
      title: 'บันทึกการเปลี่ยนแปลงสำเร็จ!',
      html: isApprovedMode.value
        ? `ยกเลิกรายการจำนวน ${cancelledCount} รายการ<br>ยอดเงินสุทธิใหม่: ${formatCurrency(netTotalAmount.value)} บาท`
        : `${isEditMode.value ? 'อัพเดต' : 'บันทึก'}ใบนำส่งเงินเลขที่ ${formData.value.waybillNumber} เรียบร้อยแล้ว`,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
      timer: 2000,
      timerProgressBar: true,
    })

    router.push('/indexwaybill')
  } catch (err) {
    console.error('Error:', err)
    Swal.fire({
      icon: 'error',
      title: 'บันทึกไม่สำเร็จ',
      text: err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
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
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
input:disabled.bg-gray-100 {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
  cursor: not-allowed !important;
  border-color: #d1d5db !important;
}
/* ✅ ซ่อน scrollbar ใน transition */
.max-h-0 {
  overflow: hidden;
}

.max-h-\[1000px\] {
  overflow: visible;
}
.fixed {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.glass-panel {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
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
