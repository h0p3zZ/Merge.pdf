import { defineNuxtPlugin } from "#app";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";

import Dialog from "primevue/dialog";
import Toast from "primevue/toast";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(PrimeVue, { ripple: true });
    nuxtApp.vueApp.use(ToastService);
    nuxtApp.vueApp.component("p-dialog", Dialog);
    nuxtApp.vueApp.component("p-toast", Toast);
});