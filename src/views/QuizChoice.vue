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

      <p class="question-label">Chọn nghĩa tiếng Việt đúng:</p>
      <h2 class="question-text">{{ currentWord.chinese }}</h2>
      <p class="pinyin">Pinyin: {{ currentWord.pinyin }}</p>

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

const currentWord = computed(() => quizWords.value[currentIndex.value] || {})

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const buildOptions = (correctWord) => {
  const distractors = shuffle(
    words.value.filter(w => w._id !== correctWord._id).map(w => w.vietnamese)
  ).slice(0, 3)
  options.value = shuffle([correctWord.vietnamese, ...distractors])
}

const startQuiz = () => {
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
  const correct = opt === currentWord.value.vietnamese
  isCorrect.value = correct
  feedback.value = correct ? '✅ Chính xác!' : `❌ Sai. Đáp án: ${currentWord.value.vietnamese}`
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
  startQuiz()
}

const buttonClass = (opt) => {
  if (!answered.value) return ''
  if (opt === currentWord.value.vietnamese) return 'green'
  if (opt === selectedOption.value) return 'red'
  return ''
}

onMounted(async () => {
  const res = await viewAllWords()
  words.value = Array.isArray(res) ? res : []
  loading.value = false
  if (words.value.length) startQuiz()
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
</style>

