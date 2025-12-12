<template>
  <div class="ui container">
    <h2 class="ui header">Vocabulary Test</h2>
    <p class="source-label">Nguồn: {{ activeLabel }}</p>

    <!-- Loading -->
    <div v-if="loading" class="ui segment">
      <div class="ui active inline loader"></div> Loading...
    </div>

    <!-- Không có từ -->
    <div v-else-if="!words.length" class="ui segment">
      <h3>No vocabulary found. Please add some words first!</h3>
    </div>

    <!-- Chưa bắt đầu -->
    <div v-else-if="!quizStarted" class="ui segment" style="text-align:center">
      <h3>Choose number of words to test:</h3>
      <div style="margin-bottom:10px;">
        <button class="ui button" @click="toggleRecent">
          {{ useRecent ? 'Dùng toàn bộ từ' : 'Dùng 30 từ mới nhất' }}
        </button>
      </div>
      <button class="ui blue button" @click="startQuiz(5)" :disabled="activeWords.length < 5">Test 5 random words</button>
      <button class="ui green button" @click="startQuiz(10)" :disabled="activeWords.length < 10">
        Test 10 random words
      </button>
      <p v-if="activeWords.length < 10" style="margin-top:1em;color:#f2711c">
        <i class="exclamation icon"></i>Cần tối thiểu 10 từ để kiểm tra 10 câu.
      </p>
    </div>

    <!-- Kết thúc -->
    <div v-else-if="quizEnded" class="ui segment">
      <h3>Your final score: {{ score }} / {{ totalQuestions }}</h3>
      <button class="ui button primary" @click="resetQuiz">Choose test again</button>
    </div>

    <!-- Đang làm bài -->
    <div v-else class="ui segment">
      <p><strong>Question {{ questionNumber }} of {{ totalQuestions }}</strong></p>
      <p><strong>Dịch từ:</strong></p>
      <h3>{{ askVietnamese ? currentWord.vietnamese : currentWord.chinese }}</h3>
      <p v-if="!askVietnamese" style="color:#6d6c8b;margin-top:6px;">Pinyin: {{ currentWord.pinyin }}</p>

      <form class="ui form" @submit.prevent="checkAnswer">
        <input type="text" v-model="userAnswer" :placeholder="askVietnamese ? 'Nhập tiếng Trung' : 'Nhập nghĩa tiếng Việt'" autocomplete="off"
              :disabled="answered" />
        <button class="ui primary button" :disabled="answered || !userAnswer">Check</button>
      </form>

      <div v-if="feedback" :class="['ui message', isCorrect ? 'positive' : 'negative']" style="margin-top:10px">
        {{ feedback }}
      </div>

      <div class="ui divider"></div>
      <p><strong>Score:</strong> {{ score }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { viewAllWords } from '@/helpers/api';

const words = ref([]);
const useRecent = ref(false);
const activeWords = computed(() => useRecent.value ? words.value.slice(0, 30) : words.value);
const activeLabel = computed(() => useRecent.value ? '30 từ mới nhất' : 'Toàn bộ từ');
const quizWords = ref([]);
const currentWord = ref(null);
const askVietnamese = ref(false);
const userAnswer = ref('');
const score = ref(0);
const feedback = ref('');
const isCorrect = ref(false);
const questionNumber = ref(1);
const totalQuestions = ref(0);
const quizStarted = ref(false);
const quizEnded = ref(false);
const answered = ref(false);
const loading = ref(true);

// Helper function to remove Vietnamese diacritics (dấu)
const removeDiacritics = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// Helper function to normalize text for comparison (lowercase + remove diacritics)
const normalizeForSearch = (str) => {
  return removeDiacritics(str.toLowerCase());
};

// Lấy dữ liệu từ API
onMounted(async () => {
  const res = await viewAllWords();
  words.value = Array.isArray(res) ? res : [];
  loading.value = false;
});

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const startQuiz = num => {
  if (!activeWords.value.length) return;
  quizWords.value = shuffle(activeWords.value).slice(0, num);
  totalQuestions.value = quizWords.value.length;
  questionNumber.value = 1;
  score.value = 0;
  quizEnded.value = false;
  quizStarted.value = true;
  nextWord();
};

const nextWord = () => {
  if (questionNumber.value > totalQuestions.value) {
    quizEnded.value = true;
    return;
  }
  currentWord.value = quizWords.value[questionNumber.value - 1];
  userAnswer.value = '';
  feedback.value = '';
  answered.value = false;
  askVietnamese.value = Math.random() < 0.5;
};

const checkAnswer = () => {
  if (!currentWord.value || answered.value) return;
  const correctAnswer = askVietnamese.value ? currentWord.value.chinese : currentWord.value.vietnamese;
  const correctNormalized = normalizeForSearch(correctAnswer.trim());
  const userNormalized = normalizeForSearch(userAnswer.value.trim());
  answered.value = true;
  if (userNormalized === correctNormalized) {
    score.value++;
    feedback.value = '✅ Correct!';
    isCorrect.value = true;
  } else {
    feedback.value = `❌ Incorrect. Correct answer: "${correctAnswer}"`;
    isCorrect.value = false;
  }
  setTimeout(() => {
    questionNumber.value++;
    nextWord();
  }, 1200);
};

const resetQuiz = () => {
  quizStarted.value = false;
  quizEnded.value = false;
  score.value = 0;
  questionNumber.value = 1;
};

const toggleRecent = () => {
  useRecent.value = !useRecent.value;
  resetQuiz();
};
</script>


<style scoped>
/* Container for the test page */
.ui.container {
  max-width: 480px !important;
  min-height: 95vh;
  margin: 48px auto !important;
  background: #f7f8fd;
  border-radius: 18px;
  box-shadow: 0 6px 32px #c1c5df1a, 0 1.5px 2px #e4e6fb7a;
  padding: 28px 0 22px 0 !important;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Quiz title style: big, gradient */
.ui.header {
  font-size: 2.1rem;
  text-align: center;
  margin-bottom: 24px;
  font-weight: 700;
  letter-spacing: 1.5px;
  background: linear-gradient(90deg,#f7971e,#ffd200,#21d4fd,#b721ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.source-label {
  text-align: center;
  color: #666;
  margin: -12px 0 14px 0;
}

/* Card-like segment for each quiz step */
.ui.segment {
  background: #fff;
  border-radius: 14px !important;
  box-shadow: 0 2px 12px #ede9fc39;
  margin: 0 auto 26px auto !important;
  padding: 26px 28px !important;
  min-width: 280px;
}

/* Textbox input for answer */
.ui.form input[type="text"] {
  border-radius: 9px;
  border: 1.5px solid #d5d9fa;
  background: #fafbff;
  padding: 12px 14px;
  font-size: 1.1rem;
  margin-bottom: 8px;
  transition: border .16s;
}
.ui.form input[type="text"]:focus {
  border: 1.5px solid #a1b6ff;
  background: #fff;
  outline: none;
}

/* All buttons: colorful, rounded, bold */
.ui.primary.button,
.ui.blue.button,
.ui.green.button {
  font-size: 1.1rem;
  border-radius: 9px !important;
  font-weight: 600;
  padding: 10px 22px !important;
  margin: 8px 6px 0 0;
  background: linear-gradient(90deg,#ffd200,#21d4fd)!important;
  color: #2b2a41 !important;
  box-shadow: 0 2px 12px #ffe5a444;
  border: none;
  transition: box-shadow 0.14s;
}
.ui.primary.button:hover,
.ui.blue.button:hover,
.ui.green.button:hover {
  box-shadow: 0 4px 18px #ffd20044;
  color: #242541 !important;
}

/* Disabled button */
.ui.button[disabled] {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.ui.divider {
  margin: 18px 0 !important;
}

/* Feedback message (right or wrong) */
.ui.message {
  font-size: 1.1rem;
  padding: 10px 16px !important;
  border-radius: 8px !important;
  margin-bottom: 8px;
}
.ui.message.positive {
  background: #eaffea !important;
  color: #2e7d32 !important;
  border-color: #b3e6be !important;
}
.ui.message.negative {
  background: #fff0f0 !important;
  color: #c62828 !important;
  border-color: #f5bcbc !important;
}

/* Mobile responsive style */
@media (max-width: 600px) {
  .ui.container {
    padding: 4vw 2vw !important;
    min-width: unset;
    max-width: 99vw !important;
    box-shadow: none;
  }
  .ui.segment {
    padding: 18px 3vw !important;
  }
}
</style>
