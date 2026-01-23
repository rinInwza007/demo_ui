import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './index.css'
import App from './App.vue'
import router from './router'
import tippyDirective from './directives/tippy'
import { VueDatePicker } from "@vuepic/vue-datepicker";
import '@vuepic/vue-datepicker/dist/main.css'
import "hover.css";
import VueApexCharts from "vue3-apexcharts";
import '@/fake/mockAxios'
const app = createApp(App)
const pinia = createPinia()

window.testAxios = axios;

// ใช้ await import เพื่อให้ Mock โหลดเสร็จก่อน App จะเริ่ม
if (import.meta.env.VITE_USE_FAKE_API ==='true') {
  console.log('🚧 Initializing Fake API...');
  const { setupAxiosMock } = await import('@/fake/mockAxios');
  // ✅✅ ส่ง axios instance เข้าไปที่นี่! ✅✅
  setupAxiosMock(axios);


    const datagetReceipt = await axios.get('/getReceipt')
    console.log("datagetReceipt Test", datagetReceipt)


}





app.use(VueApexCharts);
app.component('VueDatePicker', VueDatePicker)
app.use(router)
app.directive('tippy', tippyDirective)

app.mount('#app')
