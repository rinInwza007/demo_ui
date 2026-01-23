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

// ⚠️ สำคัญ: Import Axios ตัวที่คุณใช้เรียก API
// ถ้าคุณสร้าง instance แยก (เช่นใน utils/axios.js) ให้ import ตัวนั้นมา
// แต่ถ้าคุณใช้ axios ธรรมดา ก็ import axios from 'axios'
import axios from 'axios'

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
app.use(pinia) // ใช้ตัวแปรที่ประกาศไว้
app.use(router)
app.directive('tippy', tippyDirective)

app.mount('#app')
