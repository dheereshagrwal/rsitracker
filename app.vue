<template>
  <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
  <h1 style="margin-left: 18px">
    RSI Tracker
    <span style="position: absolute; right: 30px">
      <i
        @click="showSearch = !showSearch"
        :class="
          showSearch
            ? 'fa-solid fa-search fa-xs'
            : 'fa-solid fa-arrow-trend-up fa-xs'
        "
        style="margin: 0px 25px"
      >
      </i>
      <i
        @click="showDel = !showDel"
        class="fa-solid fa-pen-to-square fa-xs"
      ></i>
    </span>
  </h1>

  <div v-if="showSearch" class="tabs">
    <div
      v-for="(watchlist, index) in watchlists"
      :key="index"
      :class="{ active: currentWatchlistIndex === index }"
      @click="switchWatchlist(index)"
    >
      <span v-if="!watchlist.editingName">{{ watchlist.name }}</span>
      <span v-if="watchlist.editingName">
        <input
          type="text"
          v-model="watchlist.newName"
          @keydown.enter="renameWatchlist(index)"
          @blur="renameWatchlist(index)"
        />
      </span>
      <span
        class="edit-icon"
        v-if="!watchlist.editingName & showDel"
        @click="editWatchlistName(index)"
      >
        <i class="fa-solid fa-pencil"></i>
      </span>
      <span
        class="edit-icon"
        v-if="watchlist.editingName & showDel"
        @click="cancelWatchlistNameEdit(index)"
      >
        <i class="fa-solid fa-times"></i>
      </span>
      <span
        class="delete-icon"
        v-if="!watchlist.editingName & showDel"
        @click="deleteWatchlist(index)"
      >
        <i class="fa-solid fa-trash-can"></i>
      </span>
    </div>
    <div class="add-icon" @click="addWatchlist">
      <i class="fa-solid fa-plus"></i>
    </div>
  </div>

  <div v-if="!showSearch" class="FullTextSearch">
    <input
      type="text"
      placeholder="Search"
      class="searchBar"
      :value="searchText"
      @input="searchText = $event.target.value"
    />
    <i @click="searchText = ''" class="fa-solid fa-times closeSearch"></i>
  </div>
  <div class="ticker-list">
    <div
      v-for="(ticker, index) in showSearch
        ? currentWatchlist.tickers
        : filteredTickers.filteredTickers"
      :key="ticker"
    >
      <div v-if="!showSearch" style="margin: 20px 0px">
        <span
          class="badge"
          v-for="(watchlist, keyIndex) in filteredTickers.tickerWatchlistMap[
            ticker
          ]"
          :key="keyIndex"
        >
          {{ watchlist }}
        </span>
      </div>
      <div @click="saveNotes()" class="ticker-item-top">
        <div class="bin" v-if="showDel">
          <i
            @click="deleteTicker(index)"
            class="fa-solid fa-trash-can fa-lg"
          ></i>
        </div>
        <StockRSI :ticker="ticker" />
      </div>
      <div
        v-if="showNotes != ticker"
        @click="showNotes = ticker"
        class="ticker-item-bottom"
        style="color: rgb(119, 119, 119)"
      >
        {{
          notes.hasOwnProperty(ticker)
            ? notes[ticker].split("\n")[0].slice(0, 35) +
              (notes[ticker].split("\n")[0].length > 50 ? "..." : "")
            : "Write something about the company"
        }}
      </div>
      <div v-if="showNotes == ticker">
        <textarea
          v-model="notes[ticker]"
          class="ticker-item-bottom"
          placeholder="Write something about the company"
          id="ticker"
          rows="10"
        ></textarea>
      </div>
    </div>
    <form @submit.prevent="addTicker" class="add-ticker-form">
      <input
        placeholder="Ex. RELIANCE.NS"
        id="new-ticker"
        v-model="newTicker"
      />
      <button class="add" type="submit">Add</button>
    </form>
  </div>
</template>

<script>
import StockRSI from "./components/StockRSI.vue";

export default {
  name: "App",
  components: {
    StockRSI,
  },
  data() {
    return {
      watchlists: [
        { name: "Watchlist 1", tickers: [], editingName: false, newName: "" },
        { name: "Watchlist 2", tickers: [], editingName: false, newName: "" },
      ],
      currentWatchlistIndex: 0,
      newTicker: "",
      searchText: "",
      showDel: false,
      showSearch: true,
      notes: {},
      showNotes: false,
    };
  },
  mounted() {
    // Load tickers from local storage
    const storedWatchlists = localStorage.getItem(`watchlists`);
    const storedNotes = localStorage.getItem(`Notes`);
    if (storedWatchlists) {
      this.watchlists = JSON.parse(storedWatchlists);
      this.watchlists.forEach((watchlist) => {
        watchlist.editingName = false;
        watchlist.newName = "";
      });
    }
    if (storedNotes) {
      this.notes = JSON.parse(storedNotes);
    }
    // Load tickers for current watchlist from local storage
    this.loadTickers();
  },
  methods: {
    addTicker() {
      if (this.newTicker) {
        this.currentWatchlist.tickers.push(this.newTicker.toUpperCase());
        this.newTicker = "";
        this.saveTickers();
      }
    },
    deleteTicker(index) {
      this.currentWatchlist.tickers.splice(index, 1);
      this.saveTickers();
      this.showDel = false;
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
      this.saveTickers();
    },
    deleteWatchlist(index) {
      if (this.watchlists.length > 1) {
        const watchlistToDelete = this.watchlists[index];
        if (
          confirm(`Are you sure you want to delete ${watchlistToDelete.name}?`)
        ) {
          this.watchlists.splice(index, 1);
          localStorage.setItem(`watchlists`, JSON.stringify(this.watchlists));
          const localStorageKey = `tickers-${watchlistToDelete.name}`;
          localStorage.removeItem(localStorageKey);
          if (index === this.currentWatchlistIndex) {
            this.currentWatchlistIndex = 0; // reset currentWatchlistIndex if last watchlist is deleted
            this.loadTickers();
          }
          this.saveTickers();
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
        this.saveTickers();
        localStorage.setItem(`watchlists`, JSON.stringify(this.watchlists));
      } else {
        watchlist.newName = "";
        watchlist.editingName = false;
      }
    },
    switchWatchlist(index) {
      if (index >= 0 && index < this.watchlists.length) {
        this.currentWatchlistIndex = index;
        this.loadTickers();
      }
    },
    loadTickers() {
      if (this.currentWatchlistIndex >= 0) {
        const currentWatchlist = this.watchlists[this.currentWatchlistIndex];
        if (currentWatchlist) {
          // Load tickers from local storage
          const storedTickers = localStorage.getItem(
            `tickers-${currentWatchlist.name}`
          );
          if (storedTickers) {
            currentWatchlist.tickers = JSON.parse(storedTickers);
          }
        }
      } else {
        this.tickers = [];
      }
    },
    saveTickers() {
      // Save tickers for current watchlist to local storage
      const currentWatchlist = this.currentWatchlist;
      localStorage.setItem(
        `tickers-${currentWatchlist.name}`,
        JSON.stringify(currentWatchlist.tickers)
      );
    },
    saveNotes() {
      localStorage.setItem(`Notes`, JSON.stringify(this.notes));
      this.showNotes = "";
    },
  },
  computed: {
    currentWatchlist() {
      return this.watchlists[this.currentWatchlistIndex];
    },
    filteredTickers() {
      const searchText = this.searchText.toLowerCase().trim();
      const filteredTickers = [];
      const tickerWatchlistMap = {};
      const currentIndex = this.currentWatchlistIndex;
      for (let index = 0; index < this.watchlists.length; index++) {
        this.switchWatchlist(index);
      }
      this.switchWatchlist(currentIndex);
      for (const watchlist of this.watchlists) {
        for (const ticker of watchlist.tickers) {
          if (!tickerWatchlistMap[ticker]) {
            tickerWatchlistMap[ticker] = [];
          }
          tickerWatchlistMap[ticker].push(watchlist.name);
          if (
            ticker.toLowerCase().includes(searchText) &&
            !filteredTickers.includes(ticker)
          ) {
            filteredTickers.push(ticker);
          }
        }
      }
      return {
        tickerWatchlistMap,
        filteredTickers,
      };
    },
  },
};
</script>

<style>
:root {
  background-color: rgb(16, 21, 25);
  color: white;
  font-family: "Roboto", sans-serif;
}

.tabs {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-bottom: 30px;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tabs div {
  padding: 10px;
  cursor: pointer;
  font-size: 18px;
  margin-right: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
}

.tabs div.active {
  border-bottom: 3px solid rgb(160, 150, 250);
  color: rgb(160, 150, 250);
}

.ticker-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.FullTextSearch {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.searchBar {
  width: 85vw;
}

.closeSearch {
  position: absolute;
  right: 8vw;
}

.ticker-item-top {
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 15px 20px 0px 20px;
  border-radius: 12px 12px 0px 0px;
  width: 85vw;
  background-color: rgb(30, 33, 36);
}

.ticker-item-bottom {
  font-size: 16px;
  color: rgb(162, 162, 162);
  display: flex;
  margin-bottom: 10px;
  justify-content: start;
  align-items: center;
  padding: 10px 20px 20px 20px;
  border-radius: 0px 0px 12px 12px;
  width: 85vw;
  border: none;
  background-color: rgb(30, 33, 36);
  font-family: "Roboto", sans-serif;
  outline: none;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
}

.ticker-item-bottom:active {
  outline: none;
}

.ticker-item button {
  margin-left: 10px;
}

.add-ticker-form {
  margin-top: 20px;
  margin-bottom: 20px;
}

.add-ticker-form label {
  margin-right: 10px;
}

.bin {
  margin-right: 20px;
  padding: 15px;
  border-radius: 12px;
  background-color: rgb(38, 37, 48);
  color: rgb(102, 101, 215);
}

.add {
  padding: 10px;
  border-radius: 12px;
  background-color: rgb(35, 40, 46);
  color: rgb(160, 150, 250);
  border: none;
  font-size: 18px;
  margin-left: 10px;
}

input {
  background-color: rgb(30, 33, 36);
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  color: white;
  font-size: 18px;
  width: 68vw;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}

.badge {
  background-color: rgb(35, 40, 46);
  color: rgb(160, 150, 250);
  padding: 5px 10px;
  margin-right: 5px;
  border-radius: 15px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}

.edit-icon,
.delete-icon,
.add-icon {
  display: inline-block;
  margin-left: 10px;
  cursor: pointer;
}
</style>
