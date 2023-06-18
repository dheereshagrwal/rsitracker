<script>
import { useMainStore } from "~/stores/mainStore";
import axios from "axios";
import { RSI } from "technicalindicators";
import { computed, onMounted, ref, watch } from "vue";

export default defineComponent({
  name: "StockRSI",
  props: {
    ticker: {
      type: String,
      required: true,
    },
  },
  setup({ ticker }) {
    console.log("ticker", ticker);
    const config = useRuntimeConfig();
    const apiKey = config.public.apiKey;
    console.log("apiKey", apiKey);
    const store = useMainStore();
    const rsi = ref(0);
    const percentage = ref(null);
    const fetchData = async (req, res) => {
      try {
        let timespan = "day";
        let limit = 1;
        if (store.currentView === "RSI 5min") {
          timespan = "minute";
          limit = 5;
        }
        const response = await axios.get(
          `https://api.polygon.io/v1/indicators/rsi/${ticker}?timestamp=2023-06-16&timespan=${timespan}&adjusted=true&window=14&series_type=close&order=desc&limit=${limit}&apiKey=${apiKey}`
        );
        const values = response?.data?.results?.values;
        if (values && values.length > 0) {
          rsi.value = values[values.length - 1].value;
        }
        console.log("rsi", rsi.value);

        const response2 = await axios.get(
          `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${apiKey}`
        );
        percentage.value = response2?.data?.ticker?.todaysChangePerc;
      } catch (error) {
        console.error(error);
      }
    };

    onMounted(() => {
      fetchData();
    });

    watch(
      () => store.currentViewIndex,
      () => {
        fetchData();
      }
    );

    const formattedPercentage = computed(() => {
      if (percentage?.value > 0) {
        return `+${percentage.value}%`;
      } else {
        return `${percentage.value}%`;
      }
    });
    return {
      rsi,
      percentage,
      formattedPercentage,
      store,
    };
  },
});
</script>

<template>
  <p class="font-bold">currentViewIndex: {{ store.currentViewIndex }}</p>
  <p class="font-bold">currentView: {{ store.currentView }}</p>
  <!-- loop through store.viewOptions -->
  <div class="flex">
    <button
      v-for="(viewOption, index) in store.viewOptions"
      :key="index"
      :class="{
        'bg-blue-500 px-4 py-2 rounded-xl': store.currentViewIndex === index,
        'bg-blue-200 px-4 py-2 rounded-xl': store.currentViewIndex !== index,
      }"
      @click="store.currentViewIndex = index"
    >
      {{ viewOption }}
    </button>
  </div>
</template>
