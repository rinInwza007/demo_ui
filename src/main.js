import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './index.css'
import App from './App.vue'
import router from './router'
import tippyDirective from './directives/tippy'
import { VueDatePicker } from "@vuepic/vue-datepicker";
import '@vuepic/vue-datepicker/dist/main.css'


const app = createApp(App)

app.component('VueDatePicker', VueDatePicker)
app.use(createPinia())
app.use(router)
app.directive('tippy', tippyDirective)
app.mount('#app')
