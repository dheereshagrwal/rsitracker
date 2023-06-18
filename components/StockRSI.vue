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
    const config = useRuntimeConfig();
    const store = useMainStore();
    const rsi = ref(0);
    const currentPrice = ref(null);
    const percentage = ref(null);
    const fetchData = async (req, res) => {
      let timespan = "day";
      let limit = 1;
      if (store.currentView === "RSI 5min") {
        timespan = "minute";
        limit = 5;
      }
      console.log("timespan", timespan);
      try {
        const data = await $fetch(
          `/api/stock?ticker=${ticker}&timespan=${timespan}&limit=${limit}`
        );
        rsi.value = data?.rsi;
        percentage.value = data?.percentage;
        currentPrice.value = data?.currentPrice;
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
    <div
      class="absolute font-semibold"
      style="right: 9vw"
      @click="store.toggleView"
    >
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
