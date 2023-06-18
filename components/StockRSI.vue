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
          rsi.value = values[values.length - 1].value;
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
  <div style="display: flex; justify-content: space-between">
    <div>
      {{ ticker }} <span style="font-size: 10px">{{ store.currentView }}</span>
    </div>
    <div style="position: absolute; right: 8vw" @click="store.toggleView">
      <div
        v-if="store.currentView !== 'Price'"
        :class="{ 'rsi-red': rsi >= 65, 'rsi-green': rsi <= 30 }"
      >
        {{ rsi }}
      </div>
      <div v-if="currentPrice !== null && store.currentView === 'Price'">
        {{ currentPrice }}
        <span
          :class="{
            'stock-increase': percentage > 0,
            'stock-decrease': percentage < 0,
          }"
        >
          ({{ formattedPercentage }})
        </span>
      </div>
    </div>
  </div>
</template>
<style>
.rsi-red {
  color: rgb(252, 75, 59);
}

.rsi-green {
  color: rgb(59, 170, 76);
}

.stock-increase {
  color: rgb(59, 170, 76);
  margin-left: 5px;
  font-size: 14px;
  font-weight: 600;
}

.stock-decrease {
  color: rgb(252, 75, 59);
  margin-left: 5px;
  font-size: 14px;
  font-weight: 600;
}
</style>
