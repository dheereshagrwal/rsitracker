<template>
  <nav class="flex justify-between my-4 items-center">
    <h1 class="text-2xl font-bold">RSI Tracker</h1>
    <div class="flex gap-10 cursor-pointer">
      <i
        @click="store.toggleSearch"
        :class="
          store.showSearch
            ? 'fa-solid fa-search fa-xl'
            : 'fa-solid fa-arrow-trend-up fa-xl'
        "
      >
      </i>
      <i
        @click="store.toggleDelete"
        class="fa-solid fa-pen-to-square fa-xl"
      ></i>
    </div>
  </nav>
</template>
<script>
import { useUiStore } from "~/stores/ui";

export default {
  setup() {
    const store = useUiStore();
    return {
      store,
    };
  },
};
</script>
