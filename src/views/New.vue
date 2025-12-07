<template>
  <!-- Main wrapper for the New Word page -->
  <div>
    <h1>Thêm từ mới (Trung - Việt)</h1>
    <form @submit.prevent="onSubmit">
      <!-- Chinese input field -->
      <div class="ui labeled input fluid">
        <div class="ui label"><i class="china flag"></i> Tiếng Trung</div>
        <input type="text" required v-model="word.chinese" />
      </div>
      <br />
      <!-- Part of speech -->
      <div class="ui labeled input fluid">
        <div class="ui label"><i class="tag icon"></i> Loại từ</div>
        <select v-model="word.pos" required v-if="!showCustomPosInput" @change="handlePosChange">
          <option value="">-- Chọn --</option>
          <option value="danh từ">Danh từ</option>
          <option value="động từ">Động từ</option>
          <option value="tính từ">Tính từ</option>
          <option value="trạng từ">Trạng từ</option>
          <option value="cụm từ">Cụm từ</option>
          <option value="khác">Khác</option>
        </select>
        <div v-else style="display: flex; align-items: center; flex: 1;">
          <input 
            type="text" 
            v-model="word.pos" 
            placeholder="Nhập loại từ tùy chỉnh"
            required
            style="flex: 1;"
          />
          <button 
            type="button" 
            @click="resetPosSelection"
            class="ui mini button"
            style="margin-left: 8px; padding: 8px 12px;"
            title="Quay lại chọn từ danh sách"
          >
            ↶
          </button>
        </div>
      </div>
      <br />
      <!-- Vietnamese input field -->
      <div class="ui labeled input fluid">
        <div class="ui label"><i class="vietnam flag"></i> Tiếng Việt</div>
        <input type="text" required v-model="word.vietnamese" />
      </div>
      <br />
      <div class="hint-text">
        Pinyin sẽ được tự động sinh từ nội dung tiếng Trung sau khi lưu, bạn không cần nhập.
      </div>
      <!-- Submit button -->
      <button class="ui primary button">Lưu</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { viewAllWords, addNewWord } from "../helpers/api";

const word = ref({ chinese: '', pos: '', vietnamese: '' });
const words = ref([]);
const router = useRouter();
const showCustomPosInput = ref(false);

// Handle when user selects from dropdown
const handlePosChange = () => {
  if (word.value.pos === 'khác') {
    showCustomPosInput.value = true;
    word.value.pos = ''; // Clear to allow user to type
  } else if (word.value.pos && ['danh từ', 'động từ', 'tính từ', 'trạng từ', 'cụm từ'].includes(word.value.pos)) {
    showCustomPosInput.value = false;
  }
};

// Reset to dropdown selection
const resetPosSelection = () => {
  showCustomPosInput.value = false;
  word.value.pos = '';
};

// Load all words for duplicate check
onMounted(async () => {
  words.value = await viewAllWords() || [];
});

const onSubmit = async () => {
  const { chinese, vietnamese, pos } = word.value;
  
  // If pos is empty or just "khác", don't submit
  if (!pos || pos.trim() === '') {
    alert('Vui lòng chọn hoặc nhập loại từ');
    return;
  }
  
  const norm = str => str.trim().toLowerCase();

  // Find duplicates
  const duplicates = words.value.filter(w =>
    norm(w.chinese) === norm(chinese) || norm(w.vietnamese) === norm(vietnamese)
  );

  if (duplicates.length) {
    const dupString = duplicates.map(w => `"${w.chinese}" - "${w.vietnamese}"`).join(', ');
    if (!confirm(`Từ này đã tồn tại: ${dupString}\nBạn có muốn thêm nữa không?`)) return;
  }

  await addNewWord(word.value);
  router.push('/words');
};
</script>


<style scoped>
/* Page background and vertical center */
body, .newword-bg {
  min-height: 96vh;
  background: #f6f7fb;
}
.newword-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96vh;
}

/* Card-like wrapper for the form */
.newword-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 32px #c1c5df1a, 0 1.5px 2px #e4e6fb7a;
  padding: 38px 34px 30px 34px;
  max-width: 400px;
  width: 100%;
  margin: 44px auto 0 auto;
  display: flex;
  flex-direction: column;
}

/* Title: big, centered, gradient color */
h1 {
  font-size: 2.1rem;
  text-align: center;
  margin-bottom: 26px;
  font-weight: 700;
  letter-spacing: 1.5px;
  background: linear-gradient(90deg,#f7971e,#ffd200,#21d4fd,#b721ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Form layout: column, with spacing */
form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

select {
  border: none;
  background: transparent;
  outline: none;
  padding: 11px 12px;
  font-size: 1.07rem;
  border-radius: 0 9px 9px 0;
  flex: 1;
  color: #333;
}

/* Input group styling: flex, soft border, highlight on focus */
.ui.labeled.input.fluid {
  display: flex;
  align-items: center;
  border-radius: 9px;
  border: 1.5px solid #e1e5fc;
  background: #f8f9ff;
  transition: border .15s;
  padding: 0 6px 0 0;
}
.ui.labeled.input.fluid:focus-within {
  border: 1.5px solid #a1b6ff;
  background: #fff;
}

/* Label style: color, rounded left, icon inline */
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

/* Text input: clean, padded, rounded right */
.ui.labeled.input.fluid input[type="text"] {
  border: none;
  background: transparent;
  outline: none;
  padding: 11px 12px;
  font-size: 1.07rem;
  border-radius: 0 9px 9px 0;
  flex: 1;
  color: #333;
}

/* Submit button: gradient, rounded, full width, hover effect */
button.ui.primary.button {
  width: 100%;
  font-size: 1.08rem;
  border-radius: 10px;
  font-weight: 600;
  margin-top: 8px;
  background: linear-gradient(90deg,#ffd200,#21d4fd)!important;
  color: #2b2a41 !important;
  box-shadow: 0 2px 12px #ffe5a444;
  border: none;
  transition: box-shadow 0.14s;
}
button.ui.primary.button:hover {
  box-shadow: 0 4px 20px #ffd20044;
}

.hint-text {
  font-size: 0.95rem;
  color: #6d6c8b;
  background: #f7f9ff;
  border: 1px dashed #d5d9fa;
  padding: 10px 12px;
  border-radius: 10px;
}

/* Responsive: padding and label size */
@media (max-width: 550px) {
  .newword-card {
    padding: 18px 6vw 18px 6vw;
  }
  .ui.labeled.input.fluid .ui.label {
    font-size: 0.98rem;
    min-width: 70px;
    padding-left: 4px;
  }
}
</style>
