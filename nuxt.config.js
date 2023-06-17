// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@pinia/nuxt"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  pinia: {
    autoImports: [
      // automatically imports `defineStore`
      "defineStore", // import { defineStore } from 'pinia'
    ],
  },
  axios: {
    proxy: true, // Can be also an object with default options
  },
  proxy: {
    "/api/": {
      target: "https://query1.finance.yahoo.com",
      pathRewrite: { "^/api/": "/v7/finance/chart" },
    },
  },
});
