<template>
  <Head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/dheereshagrwal/colored-icons@1.6.0/ci.css"
    />
  </Head>

  <main class="text-white font-inter p-4">
    <Login class="mb-10" />
    <Navbar />
    <div
      v-if="store.showSearch"
      class="flex items-center tabs mb-10 overflow-x-auto"
    >
      <div
        v-for="(watchlist, index) in watchlists"
        :key="index"
        :class="{
          'mt-1 border-b-4 border-violet-500 text-violet-400 font-semibold':
            currentWatchlistIndex === index,
          'p-4': true,
        }"
        @click="switchWatchlist(index)"
      >
        <div class="flex">
          <span v-if="watchlist.editingName">
            <input
              type="text"
              v-model="watchlist.newName"
              class="bg-black text-white mr-2 p-2"
              @keydown.enter="renameWatchlist(index)"
              @blur="renameWatchlist(index)"
            />
          </span>
          <button
            v-if="watchlist.editingName & store.showDelete"
            @click="cancelWatchlistNameEdit(index)"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex flex-col md:flex-row gap-2">
          <button class="text-sm md:text-base" v-if="!watchlist.editingName">
            {{ watchlist.name }}
          </button>
          <div class="flex gap-3 justify-center">
            <button
              v-if="!watchlist.editingName & store.showDelete"
              @click="editWatchlistName(index)"
            >
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button
              v-if="!watchlist.editingName & store.showDelete"
              @click="deleteWatchlist(index)"
              class="cursor-pointer"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="cursor-pointer ml-5 bg-violet-900 px-3" @click="addWatchlist">
        <i class="fa-solid fa-plus"></i>
      </div>
    </div>

    <div
      v-if="!store.showSearch"
      class="flex items-center gap-4 justify-center my-8"
    >
      <input
        type="text"
        placeholder="Search"
        class="w-11/12 bg-black p-3"
        :value="searchText"
        @input="searchText = $event.target.value"
      />
      <i
        @click="searchText = ''"
        class="fa-solid fa-xmark fa-xl cursor-pointer"
      ></i>
    </div>
    <div class="flex flex-col items-center">
      <div
        v-if="store.showSearch"
        v-for="(watchlist, watchlistIndex) in watchlists"
        :key="watchlistIndex"
      >
        <div v-if="watchlistIndex === currentWatchlistIndex">
          <div
            class="flex items-baseline gap-4"
            v-for="(ticker, tickerIndex) in watchlist.tickers"
            :key="tickerIndex"
          >
            <button
              v-if="!watchlist.editingName & store.showDelete"
              @click="deleteTicker(watchlistIndex, tickerIndex)"
              class="bg-violet-800 p-2 rounded-xl flex items-center"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
            <StockRSI :ticker="ticker.name" class="mb-2" />
          </div>
        </div>
      </div>
      <div
        v-if="!store.showSearch"
        v-for="(
          filteredWatchlist, filteredWatchlistIndex
        ) in filteredWatchlists"
        :key="filteredWatchlistIndex"
      >
        <div
          v-for="(ticker, tickerIndex) in filteredWatchlist.tickers"
          :key="tickerIndex"
        >
          <StockRSI :ticker="ticker.name" class="mb-2" />
        </div>
      </div>
      <form @submit.prevent="addTicker" class="mt-5 flex gap-2 items-center">
        <input
          placeholder="Ex. AAPL"
          class="bg-black p-3 rounded-xl"
          id="newTicker"
          v-model="newTicker"
        />
        <button
          class="bg-violet-800 p-2 rounded-xl flex items-center gap-1"
          type="submit"
        >
          <span>Add</span><i class="fa-solid fa-plus"></i>
        </button>
      </form>
    </div>
  </main>
</template>

<script>
import { useUiStore } from "~/stores/ui";
export default {
  name: "app",
  data() {
    const store = useUiStore();
    const user = useSupabaseUser();
    const client = useSupabaseClient();
    const watchlists = [
      { name: "Watchlist 1", tickers: [], editingName: false, newName: "" },
      { name: "Watchlist 2", tickers: [], editingName: false, newName: "" },
    ];
    return {
      watchlists,
      filteredWatchlists: watchlists,
      currentWatchlistIndex: 0,
      newTicker: "",
      searchText: "",
      store,
      user,
      client,
    };
  },
  watch: {
    searchText: {
      handler: "searchWatchlists",
      immediate: true,
    },
    user: {
      handler: "loadWatchlistsFromDB",
      immediate: true,
    },
  },
  mounted() {
    this.loadWatchlistsFromDB();
  },
  methods: {
    async loadWatchlistsFromDB() {
      console.log("loadWatchlistsFromDB");
      if (!this.user) {
        this.watchlists = [
          { name: "Watchlist 1", tickers: [], editingName: false, newName: "" },
          { name: "Watchlist 2", tickers: [], editingName: false, newName: "" },
        ];
        return;
      }
      //check if the this.user is already in the database
      const { data: existingWatchlists, error } = await this.client
        .from("watchlists")
        .select("*")
        .eq("user_id", this.user.id);

      if (existingWatchlists.length > 0) {
        this.watchlists = existingWatchlists[0].data;
      }
    },

    async addWatchlistsToDB() {
      if (!this.user) return;
      //check if the this.user is already in the database
      const { data: existingWatchlists, error } = await this.client
        .from("watchlists")
        .select("*")
        .eq("user_id", this.user.id);

      if (existingWatchlists.length === 0) {
        //if not, add it
        const { data, error } = await this.client
          .from("watchlists")
          .insert([{ user_id: this.user.id, data: this.watchlists }]);
      } else {
        //if yes, update it
        // this.watchlists = existingWatchlists[0].data;
        const { data, error } = await this.client
          .from("watchlists")
          .update({ data: this.watchlists })
          .eq("user_id", this.user.id);
        console.log(data, error);
      }
    },
    
    deleteTicker(watchlistIndex, tickerIndex) {
      this.watchlists[watchlistIndex].tickers.splice(tickerIndex, 1);
      this.saveWatchlists();
    },

    searchWatchlists() {
      if (this.searchText !== "") {
        this.searchText = this.searchText.toUpperCase();
        console.log("searching watchlists", this.searchText);
        this.filteredWatchlists = this.watchlists.map((watchlist) => {
          const filteredTickers = watchlist.tickers.filter((ticker) => {
            return ticker.name.toUpperCase().includes(this.searchText);
          });
          return { ...watchlist, tickers: filteredTickers };
        });
        console.log("filteredWatchlists", this.filteredWatchlists);
      } else {
        this.filteredWatchlists = this.watchlists;
      }
    },

    addTicker() {
      if (!this.user) {
        alert("You must be logged in to add a ticker");
        return;
      }
      if (this.newTicker) {
        this.newTicker = this.newTicker.toUpperCase();
        const tickerObject = {
          name: this.newTicker,
        };
        this.currentWatchlist.tickers.push(tickerObject);
        this.newTicker = "";
        this.saveWatchlists();
      }
    },

    saveWatchlists() {
      //each watchlist should have a tickers array of unique ticker objects
      const uniqueWatchlists = this.watchlists.map((watchlist) => {
        const uniqueTickers = Array.from(
          new Set(watchlist.tickers.map((ticker) => ticker.name))
        ).map((tickerName) =>
          watchlist.tickers.find((ticker) => ticker.name === tickerName)
        );

        return { ...watchlist, tickers: uniqueTickers };
      });
      this.watchlists = uniqueWatchlists;
      this.addWatchlistsToDB();
    },
    deleteTicker(index) {
      this.currentWatchlist.tickers.splice(index, 1);
      this.saveWatchlists();
    },
    addWatchlist() {
      const watchlistName = `Watchlist ${this.watchlists.length + 1}`;
      const newWatchlist = {
        name: watchlistName,
        tickers: [],
        editingName: false,
        newName: "",
      };
      this.watchlists.push(newWatchlist);
      this.currentWatchlistIndex = this.watchlists.length - 1;
      this.saveWatchlists();
    },
    deleteWatchlist(index) {
      if (this.watchlists.length > 1) {
        const watchlistToDelete = this.watchlists[index];
        if (
          confirm(`Are you sure you want to delete ${watchlistToDelete.name}?`)
        ) {
          this.watchlists.splice(index, 1);
          this.saveWatchlists();
          if (index === this.currentWatchlistIndex) {
            this.currentWatchlistIndex = 0; // Reset currentWatchlistIndex if the last watchlist is deleted
          }
        }
      }
    },
    editWatchlistName(index) {
      const watchlist = this.watchlists[index];
      watchlist.newName = watchlist.name;
      watchlist.editingName = true;
    },
    cancelWatchlistNameEdit(index) {
      const watchlist = this.watchlists[index];
      watchlist.editingName = false;
    },
    renameWatchlist(index) {
      const watchlist = this.watchlists[index];
      if (watchlist.newName.trim()) {
        watchlist.name = watchlist.newName;
        watchlist.newName = "";
        watchlist.editingName = false;
        this.saveWatchlists();
      } else {
        watchlist.newName = "";
        watchlist.editingName = false;
      }
    },
    switchWatchlist(index) {
      if (index >= 0 && index < this.watchlists.length) {
        this.currentWatchlistIndex = index;
      }
    },
  },
  computed: {
    currentWatchlist() {
      return this.watchlists[this.currentWatchlistIndex];
    },
  },
};
</script>
