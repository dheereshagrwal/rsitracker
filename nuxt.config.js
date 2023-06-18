// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: "https://kit.fontawesome.com/39c9d22d07.js",
          crossorigin: "anonymous",
        },
      ],
    },
  },
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
  runtimeConfig: {
    public: { apiKey: process.env.API_KEY },
  },
});
