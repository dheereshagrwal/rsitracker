module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      width: {
        "screen-1/12": "8.333333vw",
        "screen-2/12": "16.666667vw",
        "screen-3/12": "25vw",
        "screen-4/12": "33.333333vw",
        "screen-5/12": "41.666667vw",
        "screen-6/12": "50vw",
        "screen-7/12": "58.333333vw",
        "screen-8/12": "66.666667vw",
        "screen-9/12": "75vw",
        "screen-10/12": "83.333333vw",
        "screen-11/12": "91.666667vw",
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require("@tailwindcss/typography"),
    // require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/container-queries"),
  ],
};
