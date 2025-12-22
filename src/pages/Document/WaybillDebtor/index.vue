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
              {{ isEditMode ? 'แก้ไขใบนำส่งลูกหนี้' : 'เพิ่มใบนำส่งลูกหนี้' }}
            </h1>
            <p class="text-xs text-slate-800 mt-0.5">
              {{ isEditMode ? `รหัส: ${formData.projectCode}` : 'กรอกข้อมูลใบนำส่งลูกหนี้' }}
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

        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex justify-center items-center">
          <div class="glass-panel rounded-2xl p-8 flex flex-col items-center gap-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p class="text-slate-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>

        <!-- Form Section -->
        <div v-else class="flex-1 overflow-y-auto px-8 pb-8">
          <div class="max-w-6xl mx-auto space-y-6">
            <!-- ข้อมูลผู้บันทึก -->
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>ข้อมูลผู้บันทึก
              </h2>

              <!-- แถวที่ 1: ชื่อ | เบอร์โทร -->
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

              <!-- แถวที่ 4: กรณีมี sub1 (ไม่ว่าจะมี sub2 หรือไม่) → รหัสโครงการ | ว่าง -->
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
      <span class="w-1 h-6 bg-green-500 rounded-full"></span>รายการลูกหนี้
    </h2>
    <span class="text-xs text-slate-600 bg-white/60 px-3 py-1 rounded-full">
      {{ debtorList.length }} รายการ
    </span>
  </div>

  <div
    class="hidden sm:grid sm:grid-cols-[2fr_2fr_1.5fr_auto] gap-3 px-2 pb-2 border-b border-white/40 items-center text-center"
  >
    <div class="text-xs font-semibold text-slate-600 uppercase">รายการ</div>
    <div class="text-xs font-semibold text-slate-600 uppercase">จำนวนเงิน</div>
    <div class="text-xs font-semibold text-slate-600 uppercase">หมายเหตุ</div>
  </div>

  <div class="space-y-4">
    <div
      v-for="(row, index) in debtorList"
      :key="row.id"
      class="bg-white/20 rounded-xl p-4 border border-white/50 transition-all"
    >
      <div class="grid grid-cols-1 sm:grid-cols-[3fr_2fr_2fr_auto] gap-3 items-start">
        <div class="flex flex-col gap-2">
          <ItemNameSelect
            v-model="row.itemName"
            :input-id="`debtorItemName-${index}`"
            @input="() => clearRowError(index, 'itemName', 'debtor')"
            class="-ml-2"
          />
          <span
            v-if="errors.debtorRows?.[index]?.itemName"
            class="text-red-600 text-xs"
          >
            {{ errors.debtorRows[index].itemName }}
          </span>
        </div>

        <div class="flex flex-col gap-1.5">
          <InputText
            placeholder="จำนวนเงิน"
            v-model="row.money"
            @keypress="allowOnlyDigits"
            @input="() => clearRowError(index, 'money', 'debtor')"
          />
          <span v-if="errors.debtorRows?.[index]?.money" class="text-red-600 text-xs">
            {{ errors.debtorRows[index].money }}
          </span>
        </div>

        <div class="flex flex-col gap-1.5">
          <InputText
            v-model="row.debtornote"
            placeholder="หมายเหตุ"
            @input="() => clearRowError(index, 'debtornote', 'debtor')"
          />
          <span v-if="errors.debtorRows?.[index]?.debtornote" class="text-red-600 text-xs">
            {{ errors.debtorRows[index].debtornote }}
          </span>
        </div>

        <button
          v-if="debtorList.length > 1"
          @click="removeDebtorRow(index)"
          class="mt-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
  </div>

  <button
    @click="addDebtorRow"
    class="py-3 px-4 border-2 border-dashed border-[#7E22CE] rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
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
</div>

<!-- ⭐ สรุปรายการลูกหนี้ (เพิ่มใหม่) -->
<div
  v-if="debtorList.some((row) => row.itemName && row.money)"
  class="glass-panel rounded-2xl p-6 shadow-lg"
>
  <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
    <i class="ph ph-clipboard-text text-green-600 text-xl"></i>สรุปรายการลูกหนี้
  </h3>
  <div class="space-y-3">
    <div
      v-for="(row, index) in debtorList"
      :key="row.id"
      v-show="row.itemName && row.money"
      class="flex justify-between items-center py-3 border-b border-white/40 last:border-b-0"
    >
      <div class="flex items-center gap-3">
        <span
          class="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-semibold"
        >
          {{ index + 1 }}
        </span>
        <div>
          <div class="font-medium text-slate-800">{{ row.itemName }}</div>
          <div v-if="row.debtornote" class="text-xs text-slate-600 mt-0.5">{{ row.debtornote }}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="font-semibold text-slate-800 font-mono">
          {{ formatNumber(row.money) }} ฿
        </div>
      </div>
    </div>

    <!-- ยอดรวมลูกหนี้ -->
    <div class="border-t-2 border-green-200 pt-4 mt-4">
      <div class="flex justify-between items-center">
        <span class="text-lg font-bold text-slate-800">ยอดรวมลูกหนี้ทั้งหมด</span>
        <span class="text-2xl font-bold text-green-600">
          {{ formatNumber(totalDebtorAmount) }} ฿
        </span>
      </div>
    </div>
  </div>
</div>

            <!-- รายการเงินฝาก (แบบใหม่ - คล้ายรายการนำส่ง) -->
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span class="w-1 h-6 bg-orange-500 rounded-full"></span>รายการเงินฝาก
                </h2>
                <span class="text-xs text-slate-600 bg-white/60 px-3 py-1 rounded-full">
                  {{ depositList.length }} รายการ
                </span>
              </div>

              <div
                class="hidden sm:grid sm:grid-cols-[0.1fr_2fr_1fr_1fr_1fr_auto] gap-3 px-2 pb-2 border-b border-white/40 items-center text-center"
              >
                <div class="text-xs font-semibold text-slate-600 uppercase"></div>
                <div class="text-xs font-semibold text-slate-600 uppercase">รายการ</div>
                <div class="text-xs font-semibold text-slate-600 uppercase">จำนวนเงิน</div>
                <div class="text-xs font-semibold text-slate-600 uppercase">ค่าธรรมเนียม</div>
                <div class="text-xs font-semibold text-slate-600 uppercase">หมายเหตุ</div>
              </div>

              <div class="space-y-4">
                <div
                  v-for="(row, index) in depositList"
                  :key="row.id"
                  class="bg-white/20 rounded-xl p-4 border border-white/50 transition-all"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-[0.2fr_2fr_1fr_1fr_1fr_auto] gap-3 items-start">
                    <div class="flex items-center justify-center -mr-2">
                      <span
                        class="-mr-3 bg-purple-500 text-white rounded-full text-lg font-bold mt-3 w-10 h-10 flex items-center justify-center"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>

                    <div class="flex flex-col gap-2 mt-[13px]">
                      <ItemNameSelect
                        v-model="row.itemName"
                        :input-id="`depositItemName-${index}`"
                        @input="() => clearRowError(index, 'itemName', 'deposit')"
                        class="-mr-2"
                      />
                      <span
                        v-if="errors.depositRows?.[index]?.itemName"
                        class="text-red-600 text-xs"
                      >
                        {{ errors.depositRows[index].itemName }}
                      </span>
                    </div>

                    <div class="flex flex-col gap-2 mt-3">
                      <button
                        class="glass-button-primary px-4 py-2 rounded-xl text-sm transition-all active:scale-95 h-[42px]"
                        @click="openModalForRow(index)"
                      >
                        จำนวนเงินรวม
                      </button>
                      <span
                        v-if="errors.depositRows?.[index]?.selectedItems"
                        class="text-red-600 text-xs"
                      >
                        {{ errors.depositRows[index].selectedItems }}
                      </span>
                    </div>

                    <div class="flex flex-col gap-1.5 mt-2">
                      <InputText
                        v-model="row.fee"
                        placeholder="ค่าธรรมเนียม"
                        @keypress="allowOnlyDigits"
                        @input="() => clearRowError(index, 'fee', 'deposit')"
                      />
                    </div>

                    <div class="flex flex-col gap-1.5 mt-2">
                      <InputText
                        v-model="row.depositnote"
                        placeholder="หมายเหตุ"
                        @input="() => clearRowError(index, 'depositnote', 'deposit')"
                      />
                      <span
                        v-if="errors.depositRows?.[index]?.depositnote"
                        class="text-red-600 text-xs"
                      >
                        {{ errors.depositRows[index].depositnote }}
                      </span>
                    </div>

                    <button
                      v-if="depositList.length > 1"
                      @click="removeDepositRow(index)"
                      class="mt-0 sm:mt-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 self-start sm:self-center"
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

                  <!-- รายละเอียดแบบยุบได้ -->
                  <transition name="collapse">
                    <div v-show="row.expanded && getRowDetail(index)" class="mt-4 border-t border-white/40 pt-4">
                      <div class="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                        <h4 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <i class="ph ph-info text-blue-600"></i>รายละเอียดรายการ
                        </h4>

                        <div v-if="getRowDetail(index)?.hasItemName" class="mb-3">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-slate-600">ชื่อรายการ:</span>
                            <span class="text-sm font-medium text-slate-800">{{ getRowDetail(index).itemName }}</span>
                          </div>
                        </div>

                        <div class="space-y-2 mb-3">
                          <div
                            v-for="(item, itemIdx) in getRowDetail(index)?.items || []"
                            :key="itemIdx"
                            class="bg-white rounded p-3 text-sm shadow-sm"
                          >
                            <div class="flex justify-between items-start mb-2">
                              <span class="font-medium px-2 py-1 rounded text-xs bg-orange-100 text-orange-700">
                                {{ item.type || 'ไม่ระบุประเภท' }}
                              </span>
                              <span class="font-bold text-green-600">{{ formatNumber(item.amount) }} ฿</span>
                            </div>

                            <div class="space-y-1 text-xs text-slate-600 ml-2">
                              <div v-if="item.accountName" class="flex gap-1">
                                <span>ชื่อบัญชี:</span><span class="font-medium">{{ item.accountName }}</span>
                              </div>
                              <div v-if="item.accountNumber" class="flex gap-1">
                                <span>เลขบัญชี:</span><span class="font-medium">{{ item.accountNumber }}</span>
                              </div>
                              <div v-if="item.bankName" class="flex gap-1">
                                <span>ธนาคาร:</span><span class="font-medium">{{ item.bankName }}</span>
                              </div>
                              <div v-if="item.referenceNo" class="flex gap-1">
                                <span>เลขที่อ้างอิง:</span><span class="font-medium">{{ item.referenceNo || '–' }}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="border-t border-blue-200 pt-3 space-y-2">
                          <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-600">ยอดรวม:</span>
                            <span class="font-semibold text-green-600">{{ formatNumber(getRowDetail(index)?.subtotal) }} ฿</span>
                          </div>
                          <div v-if="getRowDetail(index)?.fee > 0" class="flex justify-between items-center text-sm">
                            <span class="text-slate-600">ค่าธรรมเนียม:</span>
                            <span class="font-semibold text-red-600">- {{ formatNumber(getRowDetail(index).fee) }} ฿</span>
                          </div>
                          <div v-if="getRowDetail(index)?.depositnote" class="flex items-center text-sm">
                            <span class="text-slate-600">หมายเหตุ:</span>
                            <span class="text-slate-700 italic">{{ getRowDetail(index)?.depositnote }}</span>
                          </div>
                          <div class="border-t border-blue-300 my-2"></div>
                          <div class="flex justify-between items-center">
                            <span class="font-bold text-slate-800">ยอดสุทธิ:</span>
                            <span
                              class="font-bold text-lg"
                              :class="(getRowDetail(index)?.netAmount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'"
                            >
                              {{ formatNumber(getRowDetail(index)?.netAmount ?? 0) }} ฿
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>

                  <div v-if="getRowDetail(index)" @click="row.expanded = !row.expanded" class="detail-toggle-bar">
                    <i :class="row.expanded ? 'ph ph-caret-up' : 'ph ph-caret-down'" class="text-base"></i>
                    <span class="text-xs">{{ row.expanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด' }}</span>
                  </div>
                </div>
              </div>

              <button
                @click="addDepositRow"
                class="py-3 px-4 border-2 border-dashed border-[#7E22CE] rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
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
            </div>

            <!-- สรุปรายการทั้งหมด -->
            <div
              v-if="depositList.some((row) => row.itemName && row.selectedItems?.some((item) => item.checked))"
              class="glass-panel rounded-2xl p-6 shadow-lg"
            >
              <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <i class="ph ph-clipboard-text text-blue-600 text-xl"></i>สรุปรายการเงินฝาก
              </h3>
              <div class="space-y-3">
                <div
                  v-for="(row, index) in depositList"
                  :key="row.id"
                  v-show="row.itemName && row.selectedItems?.some((item) => item.checked)"
                  class="flex justify-between items-center py-3 border-b border-white/40 last:border-b-0"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold"
                    >
                      {{ index + 1 }}
                    </span>
                    <div>
                      <div class="font-medium text-slate-800">{{ row.itemName }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-slate-800 font-mono">
                      {{ formatNumber(getRowDetail(index)?.netAmount || 0) }} ฿
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ยอดสุทธิทั้งหมด -->
            <div class="bg-[#7E22CE] border rounded-lg p-6">
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-white">ยอดสุทธิทั้งหมด</span>
                <span class="text-3xl font-bold text-white">{{ formatNumber(netTotalAmount) }} บาท</span>
              </div>
            </div>

            <!-- Note -->
            <div class="bg-yellow-50/80 backdrop-blur-sm border border-yellow-300 rounded-xl p-4 shadow-sm">
              <p class="text-sm text-yellow-900 m-0 flex items-start gap-2">
                <i class="ph ph-warning text-xl flex-shrink-0 mt-0.5"></i>
                <span>
                  <strong>หมายเหตุ:</strong> กรุณาตรวจสอบข้อมูลให้ถูกต้องและครบถ้วนก่อนกด{{
                    isEditMode ? 'อัพเดต' : 'บันทึก'
                  }}ข้อมูล (ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก)
                </span>
              </p>
            </div>

            <!-- Action Buttons -->
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

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal !== null" class="modal-portal-container">
        <Modal
          :show="true"
          :items="rowItems[showModal]"
          :used-accounts="getUsedAccounts(showModal)"
          @close="showModal = null"
          @input="() => clearRowError(showModal, 'selectedItems', 'deposit')"
          @update:selected="(selected) => updateSelectedItems(showModal, selected)"
        />
      </div>
    </Teleport>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'

// Components
import sidebar from '@/components/bar/sidebar.vue'
import Selects from '@/components/input/select/select.vue'
import InputText from '@/components/input/inputtext.vue'
import ItemNameSelect from '@/components/TomSelect/ItemNameSelect.vue'
import SendMoneySelect from '@/components/TomSelect/SendMoneyTomSelect.vue'
import Modal from '@/components/modal/modalwaybilldebtor.vue'

// Data & Stores
import { options } from '@/components/data/departments'
import { useReceiptStore } from '@/stores/recipt'
import { useRowManagerDebtor } from '@/components/Function/FunctionDebtor'
import { setupAxiosMock } from '@/fake/mockAxios'

// ========== Initialize ==========
const route = useRoute()
const router = useRouter()
const reciptStore = useReceiptStore()
setupAxiosMock()

// ========== State Management ==========
const isEditMode = computed(() => !!route.params.id)
const receiptId = computed(() => route.params.id)
const isLoading = ref(false)

const formData = ref({
  fullName: '',
  phone: '',
  MainAffiliationName: '',
  subAffiliationName1: '',
  subAffiliationName2: '',
  fundName: '',
  projectCode: '',
  sendmoney: '',
  receiptList: '',
})

const itemNameInstances = ref({})
const errors = ref({})

const mainCategory = ref('')
const subCategory = ref('')
const subCategory2 = ref('')

// ========== Composables ==========
const {
  allowOnlyDigits,
  initTomSelect,
  debtorList,
  addDebtorRow,
  removeDebtorRow,
  depositList,
  addDepositRow,
  removeDepositRow,
  showModal,
  rowItems,
  openModalForRow,
  updateSelectedItems,
  getUsedAccounts,
  totalDebtorAmount,
  totalDepositAmount,
  totalFee,
  netTotalAmount,
  getRowDetail,
} = useRowManagerDebtor()

// ========== Computed Properties ==========
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

// ========== Watchers ==========
watch(mainCategory, () => {
  subCategory.value = ''
  subCategory2.value = ''
})

watch(subCategory, () => {
  subCategory2.value = ''
})

// ========== Navigation ==========
const gotomainpage = () => {
  router.push('/indexwaybilldebtor')
}

// ========== Formatting ==========
const formatNumber = (num) => {
  return Number(num).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ========== TomSelect Functions ==========
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

const initItemNameTomSelect = (index, type = 'deposit') => {
  const elementId = type === 'debtor' ? `debtorItemName-${index}` : `depositItemName-${index}`

  setTimeout(() => {
    const el = document.getElementById(elementId)

    if (el && !el.tomselect) {
      const tomselect = new TomSelect(el, {
        create: true,
        placeholder: 'ระบุรายการ',
        allowEmptyOption: true,
        onChange(value) {
          if (type === 'debtor') {
            debtorList.value[index].itemName = value
          } else {
            depositList.value[index].itemName = value
          }
          clearRowError(index, 'itemName', type)
        },
      })

      applyCSSToTomSelect(el)
      itemNameInstances.value[`${type}-${index}`] = tomselect
    }
  }, 100)
}

// ========== Error Handling ==========
const clearRowError = (rowIndex, field, type = 'deposit') => {
  const errorKey = type === 'debtor' ? 'debtorRows' : 'depositRows'
  const dataList = type === 'debtor' ? debtorList : depositList

  if (errors.value[errorKey]?.[rowIndex]?.[field]) {
    if (dataList.value[rowIndex][field]) {
      delete errors.value[errorKey][rowIndex][field]

      if (Object.keys(errors.value[errorKey][rowIndex]).length === 0) {
        delete errors.value[errorKey][rowIndex]
      }
    }
  }
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

// ========== Load Data (Edit Mode) ==========
const loadReceiptData = async () => {
  if (!receiptId.value) return

  isLoading.value = true

  try {
    const response = await axios.get(`/getReceipt/${receiptId.value}`)

    let data = response.data
    if (Array.isArray(data)) {
      data = data.find(
        (r) => r.id === receiptId.value || r.projectCode === receiptId.value
      )
    }

    if (!data) throw new Error('Receipt not found')

    console.log('📥 Loaded receipt:', data)

    // ========== โหลดข้อมูลหลัก ==========
    formData.value.fullName = data.fullName ?? ''
    formData.value.phone = data.phone ?? ''
    formData.value.fundName = data.fundName ?? ''
    formData.value.projectCode = data.projectCode ?? ''
    formData.value.sendmoney = data.sendmoney ?? ''

    mainCategory.value = data.mainAffiliationName ?? ''
    await nextTick()

    subCategory.value = data.subAffiliationName1 ?? ''
    await nextTick()

    subCategory2.value = data.subAffiliationName2 ?? ''

    // ========== Clear Lists ==========
    debtorList.value = []
    depositList.value = []

    // ========== กรณีที่ 1: ข้อมูลแบบใหม่ (แยก debtorList และ depositList) ==========
    if (data.debtorList && data.depositList) {
      console.log('✅ โหลดข้อมูลแบบใหม่ (แยกแล้ว)')

      // โหลดรายการลูกหนี้
      data.debtorList.forEach((item, index) => {
        debtorList.value.push({
          id: index + 1,
          itemName: item.itemName ?? '',
          debtornote: item.debtornote ?? '',
          money: String(Number(item.amount ?? 0)),
        })
      })

      // โหลดรายการเงินฝาก
      data.depositList.forEach((item, index) => {
        const paymentDetails = Array.isArray(item.paymentDetails)
          ? item.paymentDetails
          : []

        const selectedItems =
          paymentDetails.length > 0
            ? paymentDetails.map((p) => ({
                checked: true,
                name: p.moneyType ?? 'transfer',
                amount: String(Number(p.amount ?? 0)),
                referenceNo: p.referenceNo ?? '',
                moneyType: p.moneyType ?? 'transfer',
                AccountNum: p.accountNumber ?? '',
                AccountName: p.accountName ?? '',
                BankName: p.bankName ?? '',
                accountNumber: p.accountNumber ?? '',
                accountName: p.accountName ?? '',
                bankName: p.bankName ?? '',
                type: 'ฝากเข้าบัญชี',
                paymentType: 'ฝากเข้าบัญชี',
              }))
            : JSON.parse(JSON.stringify(defaultItems))

        depositList.value.push({
          id: index + 1,
          itemName: item.itemName ?? '',
          depositnote: item.depositnote ?? '',
          fee: String(Number(item.fee ?? 0)),
          selectedItems: selectedItems,
          expanded: false,
        })
      })
    }
    // ========== กรณีที่ 2: ข้อมูลแบบเก่า (มี receiptList รวมกัน) ==========
    else if (data.receiptList) {
      console.log('⚠️ โหลดข้อมูลแบบเก่า (ยังรวมกัน) - แปลงให้แยก')

      const receiptList = Array.isArray(data.receiptList) ? data.receiptList : []

      receiptList.forEach((item, index) => {
        // โหลดลูกหนี้
        debtorList.value.push({
          id: index + 1,
          itemName: item.itemName ?? '',
          debtornote: item.debtornote ?? '',
          money: String(
            Number(item.debtorAmount ?? item.amount ?? 0)
          ),
        })

        // โหลดเงินฝาก
        const paymentDetails = Array.isArray(item.paymentDetails)
          ? item.paymentDetails
          : []

        const selectedItems =
          paymentDetails.length > 0
            ? paymentDetails.map((p) => ({
                checked: true,
                name: p.moneyType ?? 'transfer',
                amount: String(Number(p.amount ?? 0)),
                referenceNo: p.referenceNo ?? '',
                moneyType: p.moneyType ?? 'transfer',
                AccountNum: p.accountNumber ?? '',
                AccountName: p.accountName ?? '',
                BankName: p.bankName ?? '',
                accountNumber: p.accountNumber ?? '',
                accountName: p.accountName ?? '',
                bankName: p.bankName ?? '',
                type: 'ฝากเข้าบัญชี',
                paymentType: 'ฝากเข้าบัญชี',
              }))
            : JSON.parse(JSON.stringify(defaultItems))

        depositList.value.push({
          id: index + 1,
          itemName: item.itemName ?? '',
          depositnote: item.depositnote ?? '',
          fee: String(Number(item.fee ?? 0)),
          selectedItems: selectedItems,
          expanded: false,
        })
      })
    }
    // ========== กรณีที่ 3: ไม่มีรายการเลย ==========
    else {
      console.log('⚠️ ไม่พบรายการ - สร้างรายการเปล่า')
      debtorList.value.push({
        id: 1,
        itemName: '',
        note: '',
        money: '',
      })

      depositList.value.push({
        id: 1,
        itemName: '',
        note: '',
        fee: '',
        selectedItems: JSON.parse(JSON.stringify(defaultItems)),
        expanded: false,
      })
    }

    // ========== Re-init TomSelect ==========
    await nextTick()
    await nextTick()

    debtorList.value.forEach((_, i) => {
      initItemNameTomSelect(i, 'debtor')
    })

    depositList.value.forEach((_, i) => {
      initItemNameTomSelect(i, 'deposit')
    })

    Swal.fire({
      icon: 'success',
      title: 'โหลดข้อมูลสำเร็จ',
      timer: 1200,
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
      router.push('/indexwaybilldebtor')
    })
  } finally {
    isLoading.value = false
  }
}


// ========== Validation & Save ==========
const saveData = async () => {
  errors.value = {}
  let hasError = false

  // ========== Validation ฟอร์มหลัก ==========
  if (!formData.value.fullName) {
    errors.value.fullName = 'กรุณากรอก "ชื่อ"'
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

  // ========== Validation รายการลูกหนี้ ==========
  errors.value.debtorRows = {}
  debtorList.value.forEach((row, index) => {
    const rowErrors = {}
    if (!row.itemName) rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"'
    if (!row.debtornote) rowErrors.debtornote = 'กรุณากรอก "หมายเหตุ"'
    if (!row.money || Number(row.money) <= 0) rowErrors.money = 'กรุณากรอก "จำนวนเงิน"'

    if (Object.keys(rowErrors).length > 0) {
      errors.value.debtorRows[index] = rowErrors
      hasError = true
    }
  })

  // ========== Validation รายการเงินฝาก ==========
  errors.value.depositRows = {}
  depositList.value.forEach((row, index) => {
    const rowErrors = {}
    if (!row.itemName) rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"'
    if (!row.depositnote) rowErrors.depositnote = 'กรุณากรอก "หมายเหตุ"'

    if (!row.selectedItems || row.selectedItems.filter((i) => i.checked).length === 0) {
      rowErrors.selectedItems = 'กรุณาเลือก "จำนวนเงิน" อย่างน้อย 1 รายการ'
    } else if (row.selectedItems.some((i) => i.checked && (!i.amount || Number(i.amount) <= 0))) {
      rowErrors.selectedItems = 'กรุณากรอกจำนวนเงินให้ครบถ้วน'
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.value.depositRows[index] = rowErrors
      hasError = true
    }
  })

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

  // ========== แสดง Loading ==========
  Swal.fire({
    title: isEditMode.value ? 'กำลังอัพเดตข้อมูล...' : 'กำลังบันทึกข้อมูล...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  const currentDateTime = new Date().toISOString()

  // ========== สร้าง Payload แบบใหม่ - แยกลูกหนี้และเงินฝาก ==========
  const payload = {
    fullName: formData.value.fullName,
    phone: formData.value.phone,
    mainAffiliationName: mainCategory.value === 'เลือกทั้งหมด' ? '' : mainCategory.value,
    subAffiliationName1: subCategory.value === 'เลือกทั้งหมด' ? '' : subCategory.value || '',
    subAffiliationName2: subCategory2.value === 'เลือกทั้งหมด' ? '' : subCategory2.value || '',
    fundName: formData.value.fundName,
    projectCode: formData.value.projectCode,
    sendmoney: formData.value.sendmoney,
    moneyType: 'debtor',
    moneyTypeNote: 'Debtor',
    netTotalAmount: netTotalAmount.value,
    totalDebtorAmount: totalDebtorAmount.value,
    totalDepositAmount: totalDepositAmount.value,
    totalFee: totalFee.value,
    createdAt: isEditMode.value ? undefined : currentDateTime,
    updatedAt: currentDateTime,

    // ========== รายการลูกหนี้ (แยกออกมาเป็นของตัวเอง) ==========
    debtorList: debtorList.value.map((row) => ({
      itemName: row.itemName || '',
      debtornote: row.debtornote || '',
      amount: Number(row.money) || 0,
    })),

    // ========== รายการเงินฝาก (แยกออกมาเป็นของตัวเอง) ==========
    depositList: depositList.value.map((row) => {
      const paymentDetails = row.selectedItems
        ?.filter((item) => item.checked)
        .map((item) => ({
          moneyType: item.moneyType || 'transfer',
          amount: Number(item.amount) || 0,
          referenceNo: item.referenceNo || '',
          accountNumber: item.accountNumber || item.AccountNum || null,
          accountName: item.accountName || item.AccountName || null,
          bankName: item.bankName || item.BankName || null,
        })) || []

      const depositTotal = paymentDetails.reduce((sum, item) => sum + item.amount, 0)
      const depositFee = Number(row.fee) || 0
      const depositNetAmount = depositTotal - depositFee

      return {
        itemName: row.itemName || '',
        depositnote: row.depositnote || '',
        subtotal: depositTotal,
        fee: depositFee,
        netAmount: depositNetAmount,
        paymentDetails: paymentDetails,
      }
    }),
  }

  console.log('📤 Payload (แยกลูกหนี้และเงินฝาก):', JSON.stringify(payload, null, 2))

  // ========== ส่งข้อมูลไป API ==========
  try {
    let response
    if (isEditMode.value) {
      response = await axios.put(`/updateReceipt/${receiptId.value}`, payload)
    } else {
      response = await axios.post('/saveReceipt', payload)
    }

    console.log('✅ บันทึกสำเร็จ:', response.data)

    await Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'อัพเดตสำเร็จ!' : 'บันทึกสำเร็จ!',
      text: `${isEditMode.value ? 'อัพเดต' : 'บันทึก'}ใบนำส่งลูกหนี้ ${formData.value.projectCode} เรียบร้อยแล้ว`,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
      timer: 2000,
      timerProgressBar: true,
    })

    router.push('/indexwaybilldebtor')
  } catch (err) {
    console.error('❌ Error:', err)

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

// ========== Lifecycle Hooks ==========
onMounted(async () => {
  // Initialize TomSelect for rows
  debtorList.value.forEach((_, i) => {
    initItemNameTomSelect(i, 'debtor')
  })

  depositList.value.forEach((_, i) => {
    initItemNameTomSelect(i, 'deposit')
    initTomSelect(i)
  })

  await nextTick()

  // Load data if edit mode
  if (isEditMode.value) {
    await loadReceiptData()
  }
})

// ========== Watchers ==========
watch(
  debtorList,
  (newVal, oldVal) => {
    if (newVal.length > oldVal.length) {
      const newIndex = newVal.length - 1
      initItemNameTomSelect(newIndex, 'debtor')
    }
  },
  { deep: true }
)

watch(
  depositList,
  (newVal, oldVal) => {
    if (newVal.length > oldVal.length) {
      const newIndex = newVal.length - 1
      initItemNameTomSelect(newIndex, 'deposit')
      initTomSelect(newIndex)
    }
  },
  { deep: true }
)

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
  { deep: true }
)
</script>
<style scoped>
.readonly-force :deep(input) {
  pointer-events: none;
  background-color: #e9ecef;
  color: #6c757d;
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

.readonly-force :deep(input) {
  pointer-events: none;
  background-color: #e9ecef;
  color: #6c757d;
}

/* Detail Toggle Bar */
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

/* Collapse Transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
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

/* SweetAlert2 Z-index */
.swal2-container {
  z-index: 99999 !important;
}

.swal2-popup {
  z-index: 100000 !important;
}

.swal2-overlay {
  z-index: 99998 !important;
}

/* Modal Z-index */
[role='dialog'] {
  z-index: 99999 !important;
}

.modal-portal-container {
  z-index: 99999 !important;
}
</style>
