<template>
  <div class="quiz-container">
    <h1>Trắc nghiệm nghĩa (4 lựa chọn)</h1>

    <div v-if="loading" class="ui segment center">
      <div class="ui active inline loader"></div> Đang tải dữ liệu...
    </div>

    <div v-else-if="!words.length" class="ui segment center">
      Chưa có từ nào, hãy thêm từ trước.
    </div>

    <div v-else class="ui segment quiz-card">
      <div class="quiz-head">
        <div><strong>Câu {{ currentIndex + 1 }} / {{ totalQuestions }}</strong></div>
        <div><strong>Điểm:</strong> {{ score }}</div>
      </div>

      <!-- Mode selector -->
      <div class="mode-selector" v-if="!quizStarted">
        <h3>Chọn chế độ trắc nghiệm:</h3>
        <button class="ui button primary" @click="startQuiz('vietnamese')">
          Chọn nghĩa tiếng Việt
        </button>
        <button class="ui button primary" @click="startQuiz('chinese')">
          Chọn nghĩa tiếng Trung
        </button>
      </div>

      <div v-else>
        <p class="question-label">
          {{ quizMode === 'vietnamese' ? 'Chọn nghĩa tiếng Việt đúng:' : 'Chọn nghĩa tiếng Trung đúng:' }}
        </p>
        <h2 class="question-text">
          {{ quizMode === 'vietnamese' ? currentWord.chinese : currentWord.vietnamese }}
        </h2>
        <p v-if="quizMode === 'vietnamese'" class="pinyin">Pinyin: {{ currentWord.pinyin }}</p>

        <div class="options">
          <button
            v-for="(opt, idx) in options"
            :key="idx"
            class="ui button option-btn"
            :class="buttonClass(opt)"
            :disabled="answered"
            @click="selectOption(opt)"
          >
            {{ opt }}
          </button>
        </div>

        <div v-if="feedback" :class="['ui message', isCorrect ? 'positive' : 'negative']">
          {{ feedback }}
        </div>

        <div class="actions">
          <button class="ui primary button" @click="nextQuestion" :disabled="!answered">
            Câu tiếp
          </button>
          <button class="ui basic button" @click="restartQuiz">
            Làm lại
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { viewAllWords } from '@/helpers/api'

const words = ref([])
const loading = ref(true)
const totalQuestions = 10
const quizWords = ref([])
const currentIndex = ref(0)
const options = ref([])
const answered = ref(false)
const feedback = ref('')
const isCorrect = ref(false)
const score = ref(0)
const selectedOption = ref('')
const quizMode = ref('vietnamese') // 'vietnamese' or 'chinese'
const quizStarted = ref(false)

const currentWord = computed(() => quizWords.value[currentIndex.value] || {})

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

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const buildOptions = (correctWord) => {
  const fieldName = quizMode.value === 'vietnamese' ? 'vietnamese' : 'chinese';
  const distractors = shuffle(
    words.value.filter(w => w._id !== correctWord._id).map(w => w[fieldName])
  ).slice(0, 3)
  options.value = shuffle([correctWord[fieldName], ...distractors])
}

const startQuiz = (mode) => {
  quizMode.value = mode;
  quizStarted.value = true;
  quizWords.value = shuffle(words.value).slice(0, Math.min(totalQuestions, words.value.length))
  currentIndex.value = 0
  score.value = 0
  answered.value = false
  feedback.value = ''
  if (quizWords.value.length) buildOptions(quizWords.value[0])
}

const selectOption = (opt) => {
  if (answered.value || !currentWord.value) return
  answered.value = true
  selectedOption.value = opt
  const fieldName = quizMode.value === 'vietnamese' ? 'vietnamese' : 'chinese';
  const correctAnswer = currentWord.value[fieldName];
  const correctNormalized = normalizeForSearch(correctAnswer);
  const selectedNormalized = normalizeForSearch(opt);
  const correct = correctNormalized === selectedNormalized;
  isCorrect.value = correct
  feedback.value = correct ? '✅ Chính xác!' : `❌ Sai. Đáp án: ${correctAnswer}`
  if (correct) score.value++
}

const nextQuestion = () => {
  if (!answered.value) return
  const next = currentIndex.value + 1
  if (next >= quizWords.value.length) {
    feedback.value = `Hoàn thành! Điểm: ${score.value}/${quizWords.value.length}`
    return
  }
  currentIndex.value = next
  answered.value = false
  feedback.value = ''
  buildOptions(quizWords.value[next])
}

const restartQuiz = () => {
  quizStarted.value = false;
  answered.value = false;
  feedback.value = '';
}

const buttonClass = (opt) => {
  if (!answered.value) return ''
  const fieldName = quizMode.value === 'vietnamese' ? 'vietnamese' : 'chinese';
  const correctAnswer = currentWord.value[fieldName];
  const correctNormalized = normalizeForSearch(correctAnswer);
  const optNormalized = normalizeForSearch(opt);
  if (correctNormalized === optNormalized) return 'green'
  if (normalizeForSearch(selectedOption.value) === optNormalized) return 'red'
  return ''
}

onMounted(async () => {
  const res = await viewAllWords()
  words.value = Array.isArray(res) ? res : []
  loading.value = false
})
</script>

<style scoped>
.quiz-container {
  max-width: 760px;
  margin: 32px auto;
  padding: 0 12px 40px;
}

h1 {
  text-align: center;
  margin-bottom: 18px;
}

.center {
  text-align: center;
}

.quiz-card {
  background: #fff;
  border-radius: 14px !important;
}

.quiz-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.question-label {
  margin: 4px 0;
  color: #666;
}

.question-text {
  font-size: 1.9rem;
  margin: 4px 0 6px 0;
}

.pinyin {
  color: #6d6c8b;
  margin-bottom: 14px;
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.option-btn {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.mode-selector {
  text-align: center;
  padding: 20px 0;
}

.mode-selector h3 {
  margin-bottom: 20px;
  color: #666;
}

.mode-selector .ui.button {
  margin: 0 10px;
  min-width: 180px;
}
</style>

