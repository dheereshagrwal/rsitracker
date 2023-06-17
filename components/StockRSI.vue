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
    const store = useMainStore();
    const rsi = ref(0);
    const currentPrice = ref(null);
    const previousPrice = ref(null);
    const percentage = ref(null);
    const fetchData = async (req, res) => {
      try {
        let interval = "1d";
        let range = "2y";
        if (store.currentView === "RSI 5min") {
          interval = "5m";
          range = "5d";
        }
        const response = await axios.get(
          `api/${ticker}?range=${range}&interval=${interval}`
        );
        console.log("response data", response.data);
        const data = response.data.chart.result[0];
        const prices = data.indicators.quote[0];
        const closes = prices.close;
        rsi.value = RSI.calculate({ values: closes, period: 14 });
        rsi.value = rsi.value[rsi.value.length - 1];

        const currentClose = closes[closes.length - 1];
        const previousClose = closes[closes.length - 2];
        currentPrice.value = currentClose.toFixed(2);
        previousPrice.value = previousClose.toFixed(2);

        const priceDiff = currentClose - previousClose;
        const percentageDiff = (priceDiff / previousClose) * 100;
        percentage.value = percentageDiff.toFixed(2);
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
      if (percentage.value > 0) {
        return `+${percentage.value}%`;
      } else {
        return `${percentage.value}%`;
      }
    });
    return {
      rsi,
      currentPrice,
      previousPrice,
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
