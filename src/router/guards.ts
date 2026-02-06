// //router/guards.ts
// import { useAuthStore } from '@/stores/auth'
// import { router} from "@/router"

// router.beforeEach(async (to, from, next) => {
//   const auth = useAuthStore()

//   // ✅ ถ้าหน้าต้องการ auth
//   if (to.meta.requiresAuth) {
//     if (!auth.isLoggedIn) {
//       console.log('🔒 [Router] Not logged in, redirect to login')
//       return next('/login')
//     }

//     // ✅ Verify token เฉพาะเมื่อครบรอบ (5 นาที)
//     if (auth.shouldVerifyToken) {
//       console.log('🔍 [Router] Verifying token before navigation...')
//       const isValid = await auth.verifyToken()

//       if (!isValid) {
//         console.log('❌ [Router] Token invalid, redirect to login')
//         return next('/login')
//       }
//     }
//   }

//   next()
// })
