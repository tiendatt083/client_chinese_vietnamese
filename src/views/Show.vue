<template>
  <!-- Centered background & card for viewing a word -->
  <div class="showword-bg">
    <div class="showword-card">
      <h1>Chi tiết từ</h1>
      <!-- Chinese word (readonly) -->
      <div class="ui labeled input fluid">
        <div class="ui label">
          <i class="china flag"></i>
          Tiếng Trung
        </div>
        <input type="text" disabled :value="word.chinese" />
      </div>
      <br>
      <!-- Pinyin (readonly) -->
      <div class="ui labeled input fluid">
        <div class="ui label">
          <i class="font icon"></i>
          Pinyin
        </div>
        <input type="text" disabled :value="word.pinyin" />
      </div>
      <br>
      <!-- Part of speech (readonly) -->
      <div class="ui labeled input fluid">
        <div class="ui label">
          <i class="tag icon"></i>
          Loại từ
        </div>
        <input type="text" disabled :value="word.pos" />
      </div>
      <br>

      <!-- Vietnamese word (readonly) -->
      <div class="ui labeled input fluid">
        <div class="ui label">
          <i class="vietnam flag"></i>
          Tiếng Việt
        </div>
        <input type="text" disabled :value="word.vietnamese" />
      </div>
      <br>

      <!-- Edit button -->
      <div>
        <router-link :to="{ name: 'Edit', params: { id: route.params.id } }" class="ui yellow button edit-btn">
          Chỉnh sửa
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
// Vue Composition API and router
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// API for fetching word by ID
import { viewWordById } from "../helpers/api.js";

export default {
  name: "Show",
  setup() {
    // State for the word data
    const word = ref({});
    const route = useRoute();

    // Fetch word data on mount
    onMounted(async () => {
      word.value = await viewWordById(route.params.id) || "";
    });

    // Expose state and route for the template
    return {
      word,
      route
    };
  }
};
</script>

<style scoped>
/* Center page with light background */
.showword-bg {
  min-height: 94vh;
  background: #f6f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card styling: white, rounded, shadow */
.showword-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 32px #c1c5df1a, 0 1.5px 2px #e4e6fb7a;
  padding: 38px 34px 26px 34px;
  max-width: 400px;
  width: 100%;
  margin: 44px auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Title: large, centered, colorful gradient */
h1 {
  font-size: 2.1rem;
  text-align: center;
  margin-bottom: 32px;
  font-weight: 700;
  letter-spacing: 1.5px;
  background: linear-gradient(90deg,#f7971e,#ffd200,#21d4fd,#b721ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Group: label + input (readonly) */
.ui.labeled.input.fluid {
  display: flex;
  align-items: center;
  border-radius: 9px;
  border: 1.5px solid #e1e5fc;
  background: #f8f9ff;
  transition: border .15s;
  padding: 0 6px 0 0;
  width: 100%;
  max-width: 340px;
}
.ui.labeled.input.fluid .ui.label {
  background: #f7d94c2a;
  color: #6d6c8b;
  font-weight: 600;
  border-radius: 9px 0 0 9px;
  font-size: 1.07rem;
  min-width: 105px;
  padding-left: 10px;
  letter-spacing: .5px;
  border: none;
  display: flex;
  align-items: center;
  gap: 7px;
}

/* Textbox (readonly, disabled style) */
.ui.labeled.input.fluid input[type="text"] {
  border: none;
  background: transparent;
  outline: none;
  padding: 11px 12px;
  font-size: 1.07rem;
  border-radius: 0 9px 9px 0;
  flex: 1;
  color: #333;
  opacity: 0.85;
  font-style: italic;
  pointer-events: none;
}

/* Edit button style: yellow, gradient, wide */
.edit-btn {
  width: 100%;
  font-size: 1.08rem;
  border-radius: 10px !important;
  font-weight: 600;
  margin-top: 18px;
  margin-bottom: 0;
  background: linear-gradient(90deg,#ffd200,#21d4fd)!important;
  color: #2b2a41 !important;
  box-shadow: 0 2px 12px #ffe5a444;
  border: none;
  transition: box-shadow 0.14s;
  text-align: center;
}
.edit-btn:hover {
  box-shadow: 0 4px 20px #ffd20044;
  color: #252525 !important;
}

/* Responsive for small screens */
@media (max-width: 550px) {
  .showword-card {
    padding: 18px 6vw 18px 6vw;
  }
  .ui.labeled.input.fluid .ui.label {
    font-size: 0.98rem;
    min-width: 70px;
    padding-left: 4px;
  }
}
</style>
