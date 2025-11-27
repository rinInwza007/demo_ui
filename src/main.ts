import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import VueApexCharts from "vue3-apexcharts";
import { createPinia } from "pinia";
import "swiper/css/bundle";

import "./assets/css/remixicon.css";
import "./assets/style.css";

const app = createApp(App).use(router);



// Setup fake API in development mode
if (import.meta.env.DEV && import.meta.env.VITE_USE_FAKE_API === 'true') {
  const { setupAxiosMock } = await import('@/fake/mockAxios');
  setupAxiosMock();
}



app.use(VueApexCharts);
app.component("QuillEditor", QuillEditor);
app.directive("tooltip", vTooltip);
app.directive("click-to-see-code", clickToSeeCodeDirective);
app.directive("custom-popover", customPopover);
app.use(createPinia());
app.mount("#app");
