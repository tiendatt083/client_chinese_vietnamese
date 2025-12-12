
<template>
  <div class="wordlist-container">
    <!-- Main page title with gradient text style -->
    <h1 class="centered-title">
      <span style="letter-spacing:2px;">
        <span style="background: linear-gradient(90deg,#f7971e,#ffd200,#21d4fd,#b721ff);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">
          Từ vựng Trung - Việt
        </span>
      </span>
    </h1>

    <!-- Show total number of words -->
    <div class="wordlist-stats">
      <b>Total words: {{ words.length }}</b>
    </div>

    <!-- Control bar: show only favorites toggle, search box -->
    <div class="control-bar">
      <button class="ui button orange basic"
        :class="{active: showOnlyFavorite}"
        @click="showOnlyFavorite = !showOnlyFavorite"
        style="margin-right:18px;"
      >
        <span v-if="showOnlyFavorite">★ Only Favorites</span>
        <span v-else>☆ Show All</span>
      </button>
      <div class="ui input search-input">
        <input
          v-model="searchText"
          type="text"
          placeholder="Tìm tiếng Trung, pinyin hoặc tiếng Việt..."
          autocomplete="off"
        />
      </div>
    </div>

    <!-- Alphabet filter: filter by first letter, horizontally scrollable if overflow -->
    <div class="alpha-filter-row">
      <div class="alpha-filter">
        <span v-for="ch in alphabet" :key="ch">
          <button
            class="ui mini circular button"
            :class="{primary: filterLetter === ch}"
            @click="filterLetter = (filterLetter === ch ? '' : ch)"
          >{{ ch }}</button>
        </span>
        <button
          class="ui mini circular button"
          :class="{primary: !filterLetter}"
          @click="filterLetter = ''"
          style="margin-left:7px;"
        >All</button>
      </div>
    </div>

    <!-- Table of words (with actions and pronunciation button) -->
    <div class="wordlist-table-card">
      <table class="ui celled compact striped selectable table wordlist-table">
        <thead>
          <tr>
            <th>★</th>
            <th>Tiếng Trung</th>
            <th>Pinyin</th>
            <th>Loại từ</th>
            <th>Ghi chú</th>
            <th>Tiếng Việt</th>
            <th colspan="2">Menu</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loop all filtered/sorted words -->
          <tr v-for="(word, index) in filteredWords" :key="word._id">
            <!-- Favorite toggle (star) -->
            <td width="45" style="text-align:center;">
              <span
                @click="toggleFavorite(word._id)"
                style="cursor:pointer;font-size:18px;color:orange;"
                :title="favorites.includes(word._id) ? 'Unfavorite' : 'Add favorite'"
              >
                {{ favorites.includes(word._id) ? "★" : "☆" }}
              </span>
            </td>
            <!-- Chinese + pronounce button -->
            <td>
              {{ word.chinese }}
              <button class="ui icon button mini"
                title="Phát âm tiếng Trung"
                @click="speak(word.chinese, 'zh-CN')"
                style="margin-left:4px;padding:4px 6px;">
                🔊
              </button>
            </td>
            <!-- Pinyin -->
            <td>
              {{ word.pinyin }}
            </td>
            <!-- Part of speech -->
            <td>
              {{ word.pos }}
            </td>
            <!-- Note -->
            <td>
              {{ word.note || '—' }}
            </td>
            <!-- Vietnamese -->
            <td>
              {{ word.vietnamese }}
            </td>

            <!-- Edit, Delete actions -->
            <td width="75">
              <router-link
                class="ui button yellow"
                :to="{ name: 'Edit', params: { id: word._id } }"
              >Edit</router-link>
            </td>
            <td width="75">
              <a @click.prevent="onDelete(word._id)" class="ui red button">Delete</a>
            </td>
          </tr>
          <!-- Show message if no results -->
          <tr v-if="filteredWords.length === 0">
            <td colspan="8" style="text-align:center;color:#bbb;">No results found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// Import composition API and API helper functions
import { ref, computed, onMounted } from "vue";
import { viewAllWords, deleteWord } from "../helpers/api";

// List of all words fetched from server
const words = ref([]);
// Search input text
const searchText = ref("");
// List of favorite word IDs (localStorage)
const favorites = ref(JSON.parse(localStorage.getItem("vocab_favorites") || "[]"));
// Only show favorite words
const showOnlyFavorite = ref(false);
// Current filter by first letter (A-Z)
const filterLetter = ref("");

// Fetch all words when component is mounted
onMounted(async () => {
  words.value = (await viewAllWords()) || [];
});

// Handle delete word + remove from favorite if needed
const onDelete = async (id) => {
  const deleteConfirm = window.confirm("Are you sure to delete this word?");
  if (deleteConfirm) {
    await deleteWord(id);
    words.value = words.value.filter((word) => word._id !== id);
    // Remove from favorites if marked
    const idx = favorites.value.indexOf(id);
    if (idx !== -1) {
      favorites.value.splice(idx, 1);
      localStorage.setItem("vocab_favorites", JSON.stringify(favorites.value));
    }
  }
};

// Toggle favorite status for a word
const toggleFavorite = (id) => {
  const idx = favorites.value.indexOf(id);
  if (idx === -1) {
    favorites.value.push(id);
  } else {
    favorites.value.splice(idx, 1);
  }
  localStorage.setItem("vocab_favorites", JSON.stringify(favorites.value));
};

// Text-to-speech (browser built-in API)
const speak = (text, lang) => {
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "en-US";
    window.speechSynthesis.speak(u);
  }
};

// Generate A-Z alphabet
const alphabet = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));

// Helper function to remove Vietnamese diacritics (dấu)
const removeDiacritics = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// Helper function to normalize text for search (lowercase + remove diacritics)
const normalizeForSearch = (str) => {
  return removeDiacritics(str.toLowerCase());
};

// Filtered, sorted list based on search, favorite, and first letter
const filteredWords = computed(() => {
  let arr = words.value;

  // Filter by search text (case-insensitive and diacritic-insensitive)
  if (searchText.value) {
    const keyword = normalizeForSearch(searchText.value.trim());
    arr = arr.filter(
      (word) =>
        (word.chinese && normalizeForSearch(word.chinese).includes(keyword)) ||
        (word.pinyin && normalizeForSearch(word.pinyin).includes(keyword)) ||
        (word.vietnamese && normalizeForSearch(word.vietnamese).includes(keyword)) ||
        (word.pos && normalizeForSearch(word.pos).includes(keyword)) ||
        (word.note && normalizeForSearch(word.note).includes(keyword))
    );
  }

  // Filter by starting letter
  if (filterLetter.value) {
    arr = arr.filter(w =>
      (w.pinyin && w.pinyin[0]?.toUpperCase() === filterLetter.value) ||
      (w.vietnamese && w.vietnamese[0]?.toUpperCase() === filterLetter.value)
    );
  }

  // Show only favorites if enabled
  if (showOnlyFavorite.value) {
    arr = arr.filter(w => favorites.value.includes(w._id));
  }

  // Sort by English word (A-Z)
  return arr.slice().sort((a, b) => {
    const aStr = (a.pinyin || a.chinese || '').toLowerCase();
    const bStr = (b.pinyin || b.chinese || '').toLowerCase();
    return aStr.localeCompare(bStr);
  });
});
</script>

<style scoped>
/* Main container: center everything, light background */
.wordlist-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 98vh;
  background: #fafbfc;
  padding-bottom: 50px;
}

/* Title: big, bold, gradient, center */
.centered-title {
  margin-top: 36px;
  margin-bottom: 20px;
  font-size: 2.6rem;
  font-weight: bold;
  text-align: center;
  letter-spacing: 3px;
}

/* Show total words, styled */
.wordlist-stats {
  text-align: center;
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: #7b6fe0;
  font-weight: 500;
}

/* Control bar: favorite toggle + search left aligned */
.control-bar {
  display: flex;
  width: 100%;
  max-width: 830px;
  align-items: center;
  margin-bottom: 13px;
  margin-left: 0;
  justify-content: flex-start;
}

/* Search box style */
.search-input {
  margin-bottom: 0;
  margin-left: 0;
  min-width: 260px;
}

/* Alphabet filter row: scrollable horizontally */
.alpha-filter-row {
  width: 100%;
  max-width: 830px;
  overflow-x: auto;
  margin-bottom: 10px;
}
.alpha-filter {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  gap: 2px;
  min-width: 570px;
}

/* Card around table */
.wordlist-table-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 24px #0002, 0 1.5px 2px #0001;
  padding: 22px 22px 10px 22px;
  margin-top: 12px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 830px;
  overflow-x: auto;
}

/* Table style, rounded, striped, wide */
.wordlist-table {
  border-radius: 16px !important;
  overflow: hidden;
  margin: 0 auto !important;
  background: transparent;
  min-width: 710px;
}

/* Table headers: gradient, center, larger */
.wordlist-table th {
  background: linear-gradient(90deg,#ffd200,#b721ff21);
  text-align: center;
  font-size: 1.09rem;
  color: #3b368d !important;
  letter-spacing: 1.5px;
  border-bottom: 2px solid #ede6f7 !important;
  padding: 12px 0;
}

/* Row transitions & alternating colors */
.wordlist-table tr {
  transition: background 0.16s, box-shadow 0.13s;
}

.wordlist-table tbody tr {
  background: #fcfcff;
  border-radius: 11px !important;
}
.wordlist-table tbody tr:nth-child(2n) {
  background: #f6f7fd;
}

.wordlist-table tbody tr:hover {
  background: #ffeec0 !important;
  box-shadow: 0 4px 16px #fff3cd50;
  border-radius: 13px !important;
  transform: scale(1.008);
}

/* Cell style, center, more padding, middle aligned */
.wordlist-table td {
  text-align: center;
  font-size: 1.04rem;
  padding: 12px 0;
  vertical-align: middle;
}

/* Favorite star */
.wordlist-table td:first-child span {
  font-size: 22px !important;
  transition: color 0.17s, transform 0.13s;
  cursor: pointer;
  color: #f5ae2d;
  user-select: none;
}
.wordlist-table td:first-child span:hover {
  color: #e8bb5b;
  transform: scale(1.19) rotate(-7deg);
}

/* Chinese & Vietnamese text - align left, bold */
.wordlist-table td:nth-child(2), .wordlist-table td:nth-child(5) {
  text-align: left;
  padding-left: 16px;
  font-weight: 500;
  color: #2a265e;
  letter-spacing: .2px;
  background: none !important;
}

/* Pinyin column styling */
.wordlist-table td:nth-child(3) {
  font-style: italic;
  color: #505b85;
}

/* Pronounce button style */
.wordlist-table td button.ui.icon.button {
  margin-left: 5px;
  padding: 4px 8px;
  background: #f5f7fd;
  border-radius: 7px !important;
  border: none;
  box-shadow: 0 2px 8px #ccc3 !important;
  color: #505b85;
  font-size: 1rem;
  transition: background 0.15s;
}
.wordlist-table td button.ui.icon.button:hover {
  background: #ffe071;
  color: #c45c0e;
}

/* Action cell padding */
.wordlist-table td:last-child,
.wordlist-table td:nth-last-child(2),
.wordlist-table td:nth-last-child(3) {
  padding: 0 6px;
}

/* Action buttons: rounded, bold, shadow, colored hover */
.wordlist-table .ui.button {
  border-radius: 7px !important;
  font-size: 1.02rem !important;
  font-weight: 600;
  box-shadow: 0 2px 10px #fae19a33, 0 1.5px 2px #0001 !important;
  margin: 3px 0;
  border: none !important;
  transition: box-shadow 0.14s, transform 0.14s;
}
.wordlist-table .ui.button.green:hover {
  box-shadow: 0 2px 18px #b9ffc122, 0 1.5px 2px #0001 !important;
  background: #36ed65 !important;
  color: #262e29 !important;
  transform: scale(1.045);
}
.wordlist-table .ui.button.yellow:hover {
  box-shadow: 0 2px 18px #ffe97733, 0 1.5px 2px #0001 !important;
  background: #ffe38a !important;
  color: #2d2715 !important;
  transform: scale(1.045);
}
.wordlist-table .ui.button.red:hover {
  box-shadow: 0 2px 18px #ff8f8f33, 0 1.5px 2px #0001 !important;
  background: #fd6363 !important;
  color: #000000 !important;
  transform: scale(1.045);
}

/* Responsive styles for mobile/tablet */
@media (max-width: 850px) {
  .wordlist-table-card, .alpha-filter-row, .control-bar {
    max-width: 100vw;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .wordlist-table {
    min-width: 610px;
  }
}
@media (max-width: 660px) {
  .wordlist-container {
    padding-left: 0;
    padding-right: 0;
  }
  .wordlist-table-card {
    padding: 4px 2px 4px 2px;
  }
  .alpha-filter {
    min-width: 470px;
  }
}
</style>
