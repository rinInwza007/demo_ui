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

const app = createApp(App)



// if (import.meta.env.DEV && import.meta.env.VITE_USE_FAKE_API === 'true') {
//   const { setupAxiosMock } = await import('@/fake/mockAxios');
//   setupAxiosMock();
// }


app.use(VueApexCharts);
app.component('VueDatePicker', VueDatePicker)
app.use(createPinia())
app.use(router)
app.directive('tippy', tippyDirective)
app.mount('#app')
