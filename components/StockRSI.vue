<script>
import { useMainStore } from "~/stores/mainStore";
import axios from "axios";
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
    const currentPrice = ref(null);
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
          rsi.value = values[values.length - 1].value.toFixed(2);
        }
        console.log("rsi", rsi.value);

        const response2 = await axios.get(
          `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${apiKey}`
        );
        percentage.value = response2?.data?.ticker?.todaysChangePerc.toFixed(2);

        const response3 = await axios.get(
          `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/2023-06-16/2023-06-16?adjusted=true&sort=desc&limit=1&apiKey=${apiKey}`
        );
        console.log("response3", response3);
        currentPrice.value = response3?.data?.results[0]?.c;
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
        return `+${percentage.value.toFixed}%`;
      } else {
        return `${percentage.value}%`;
      }
    });
    return {
      rsi,
      percentage,
      formattedPercentage,
      store,
      currentPrice,
    };
  },
});
</script>

<template>
  <div class="flex justify-between">
    <div class="text-lg uppercase">
      {{ ticker }} <span class="text-xs">{{ store.currentView }}</span>
    </div>
    <div class="absolute font-semibold" style="right: 9vw" @click="store.toggleView">
      <div
        v-if="store.currentView !== 'Price'"
        :class="{ 'text-red-500': rsi >= 65, 'text-green-500': rsi <= 30 }"
      >
        {{ rsi }}
      </div>
      <div v-if="currentPrice !== null && store.currentView === 'Price'">
        {{ currentPrice }}
        <span
          :class="{
            'text-green-500 ml-1': percentage > 0,
            'text-red-500 ml-1': percentage < 0,
          }"
        >
          ({{ formattedPercentage }})
        </span>
      </div>
    </div>
  </div>
</template>