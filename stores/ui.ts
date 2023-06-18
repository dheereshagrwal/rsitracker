export const useUiStore = defineStore({
  id: "uiStore",
  state: () => ({
    showSearch: true,
    showDelete: false,
  }),
  actions: {
    toggleSearch(): void {
      this.showSearch = !this.showSearch;
    },
    toggleDelete(): void {
      this.showDelete = !this.showDelete;
    },
  },
});
