<template>
  <div class="p-6 max-w-sm mx-auto">
    <h1 class="text-2xl font-bold mb-4">Login</h1>

    <!-- ✅ ถ้าใช้ form ต้องมี .prevent -->
    <form @submit.prevent="onLogin" class="space-y-3">
      <input
        v-model="email"
        type="email"
        class="w-full border p-2 rounded"
        placeholder="email"
        required
      />
      <input
        v-model="password"
        type="password"
        class="w-full border p-2 rounded"
        placeholder="password"
        required
      />

      <!-- ✅ ใช้ type="submit" เพื่อให้ Enter key ทำงาน -->
      <button
        type="submit"
        class="w-full bg-black text-white p-2 rounded"
        :disabled="loading"
      >
        {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'Login' }}
      </button>

      <p v-if="err" class="text-red-600 text-sm">{{ err }}</p>

      <div class="text-xs text-slate-600">
        <div>user@up.ac.th / 1234</div>
        <div>treasury@up.ac.th / 1234</div>
        <div>admin@up.ac.th / 1234</div>
        <div>superadmin@up.ac.th / 1234</div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const err = ref<string | null>(null)
const loading = ref(false)

async function onLogin() {
  // ป้องกันการกด submit ซ้ำ
  if (loading.value) return

  err.value = null
  loading.value = true

  try {
    console.log('🔐 Starting login process...')
    console.log('📧 Email:', email.value)

    await auth.login({
      email: email.value.trim(),
      password: password.value
    })
    console.log('✅ Login successful, redirecting...')
    await router.push({ name: 'main' })

  } catch (e: any) {
    console.error('❌ Login failed:', e)
    err.value = e?.message ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
