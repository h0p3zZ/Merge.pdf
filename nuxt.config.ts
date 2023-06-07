// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    // baseUrl: '{repo-name}'
    app: {
        baseURL: '/Merge.pdf/'
    },
    css: [
        "bootstrap/dist/css/bootstrap.min.css",
        "primevue/resources/themes/lara-light-blue/theme.css",
        "primevue/resources/primevue.css",
    ],
    build: {
        transpile: ["primevue"],
    },
})
