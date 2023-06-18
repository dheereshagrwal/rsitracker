export const useMainStore = defineStore({
  id: "mainStore",
  state: () => ({
    currentViewIndex: 0,
    viewOptions: ["RSI 1d", "RSI 5min", "Price"],
  }),
  actions: {
    toggleView() {
      this.currentViewIndex =
        (this.currentViewIndex + 1) % this.viewOptions.length;
    },
  },
  getters: {
    currentView(): string {
      return this.viewOptions[this.currentViewIndex];
    },
  },
});
