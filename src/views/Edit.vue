<template>
  <div class="editword-bg">
    <div class="editword-card">
      <h1>Chỉnh sửa từ</h1>
      <form action="" @submit.prevent="onSubmit">
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="china flag"></i> Tiếng Trung</div>
          <input type="text" required v-model="word.chinese" />
        </div>
        <br />
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="tag icon"></i> Loại từ</div>
          <select v-model="word.pos" required v-if="!showCustomPosInput" @change="handlePosChange">
            <option value="">-- Chọn --</option>
            <option value="danh từ">Danh từ</option>
            <option value="động từ">Động từ</option>
            <option value="tính từ">Tính từ</option>
            <option value="trạng từ">Trạng từ</option>
            <option value="trợ từ">Trợ từ</option>
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
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="vietnam flag"></i> Tiếng Việt</div>
          <input type="text" required v-model="word.vietnamese" />
        </div>
        <br />

        <div class="ui labeled input fluid">
          <div class="ui label"><i class="sticky note outline icon"></i> Ghi chú</div>
          <input type="text" v-model="word.note" placeholder="Tuỳ chọn" />
        </div>
        <br />
        
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="font icon"></i> Pinyin</div>
          <input type="text" disabled :value="word.pinyin" />
        </div>
        <br />
        
        <button class="ui primary button">Lưu</button>
      </form>
    </div>
  </div>
</template>

<script>
// Vue composition API imports
import { ref, computed, onMounted } from 'vue';           
import { useRoute, useRouter } from 'vue-router';
// API functions to get and update word
import { viewWordById, editWord } from "../helpers/api";

export default {
  name: "Edit",
  setup() {
    // State for the word being edited
    const word = ref({});
    const route = useRoute();
    const router = useRouter();
    const showCustomPosInput = ref(false);
    
    // Check if current pos is custom when loading word
    const checkIfCustomPos = () => {
      if (!word.value.pos) {
        showCustomPosInput.value = false;
        return;
      }
      showCustomPosInput.value = !['danh từ', 'động từ', 'tính từ', 'trạng từ', 'trợ từ', 'cụm từ'].includes(word.value.pos);
    };
    
    // Handle when user selects from dropdown
    const handlePosChange = () => {
      if (word.value.pos === 'khác') {
        showCustomPosInput.value = true;
        word.value.pos = ''; // Clear to allow user to type
      } else if (word.value.pos && ['danh từ', 'động từ', 'tính từ', 'trạng từ', 'trợ từ', 'cụm từ'].includes(word.value.pos)) {
        showCustomPosInput.value = false;
      }
    };
    
    // Reset to dropdown selection
    const resetPosSelection = () => {
      showCustomPosInput.value = false;
      word.value.pos = '';
    };

    // Load word by id when component mounts
    onMounted(async () => {
      const result = await viewWordById(route.params.id);
      if (result === null) {
        alert("Failed to load word data. Please try again later.");
        word.value = {};
      } else {
        word.value = result;
        checkIfCustomPos();
      }
    });

    // Update word on submit and redirect to list
    const onSubmit = async () => {
      const result = await editWord(route.params.id, word.value);
      if (result === null) {
        alert("Failed to update word. Please try again later.");
        return;
      }
      router.push('/words');
    };

    // Return state and handlers to template
    return {
      word,
      onSubmit,
      showCustomPosInput,
      handlePosChange,
      resetPosSelection
    };
  }
};
</script>



<style scoped>
/* Main background and card layout for Edit Word page */
.editword-bg {
  min-height: 94vh;
  background: #f6f7fb;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Card design with shadow and rounded corners */
.editword-card {
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

/* Title style: large, centered, gradient text */
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

/* Form styling: vertical gap between fields */
form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Input group: flex, rounded, soft border, highlight on focus */
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

/* Input label: color, rounded left, icon inline */
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

/* Responsive adjustments for mobile */
@media (max-width: 550px) {
  .editword-card {
    padding: 18px 6vw 18px 6vw;
  }
  .ui.labeled.input.fluid .ui.label {
    font-size: 0.98rem;
    min-width: 70px;
    padding-left: 4px;
  }
}
</style>

