<!-- src/pages/Login.vue -->

<template>
  <div class="p-6 max-w-sm mx-auto">
    <h1 class="text-2xl font-bold mb-4">Login (Mock)</h1>

    <div class="space-y-3">
      <input v-model="email" class="w-full border p-2 rounded" placeholder="email" />
      <input v-model="password" type="password" class="w-full border p-2 rounded" placeholder="password" />
      <button @click="onLogin" class="w-full bg-black text-white p-2 rounded">
        Login
      </button>

      <p v-if="err" class="text-red-600 text-sm">{{ err }}</p>

      <div class="text-xs text-slate-600">
        <div>user@up.ac.th / 1234</div>
        <div>treasury@up.ac.th / 1234</div>
        <div>admin@up.ac.th / 1234</div>
        <div>superadmin@up.ac.th / 1234</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('user@up.ac.th')
const password = ref('1234')
const err = ref<string | null>(null)

async function onLogin() {
  err.value = null
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push({ name: 'main' })
  } catch (e: any) {
    err.value = e?.message ?? 'Login failed'
  }
}
</script>
