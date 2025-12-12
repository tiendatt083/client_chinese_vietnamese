<template>
  <div class="quiz-container">
    <h1>Trắc nghiệm tiếng Trung (chọn Pinyin)</h1>

    <div v-if="loading" class="ui segment center">
      <div class="ui active inline loader"></div> Đang tải dữ liệu...
    </div>

    <div v-else-if="!activeWords.length" class="ui segment center">
      Chưa có đủ từ, hãy thêm từ trước.
    </div>

    <div v-else class="ui segment quiz-card">
      <div class="quiz-head">
        <div><strong>Câu {{ quizStarted ? currentIndex + 1 : 0 }} / {{ totalQuestions }}</strong></div>
        <div><strong>Điểm:</strong> {{ score }}</div>
        <div class="source">Nguồn: {{ activeLabel }}</div>
      </div>

      <div class="mode-selector" v-if="!quizStarted">
        <p class="note-text">Tập trung vào pinyin, câu hỏi hiển thị nghĩa tiếng Việt.</p>
        <div class="controls">
          <button class="ui button" @click="toggleRecent">
            {{ useRecent ? 'Dùng toàn bộ' : 'Dùng 30 từ mới nhất' }}
          </button>
          <button class="ui primary button" @click="startQuiz" :disabled="!activeWords.length">
            Bắt đầu
          </button>
        </div>
      </div>

      <div v-else>
        <p class="question-label">Chọn pinyin đúng cho nghĩa:</p>
        <h2 class="question-text">{{ currentWord.vietnamese }}</h2>
        <p v-if="currentWord.note" class="note-text">Ghi chú: {{ currentWord.note }}</p>

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
          <div v-if="answered" class="answer-extra">Tiếng Trung: <span class="zh-text">{{ currentWord.chinese }}</span></div>
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

const MAX_QUESTIONS = 10

const words = ref([])
const loading = ref(true)
const useRecent = ref(false)
const quizWords = ref([])
const currentIndex = ref(0)
const options = ref([])
const answered = ref(false)
const feedback = ref('')
const isCorrect = ref(false)
const score = ref(0)
const selectedOption = ref('')
const quizStarted = ref(false)

const activeWords = computed(() => useRecent.value ? words.value.slice(0, 30) : words.value)
const activeLabel = computed(() => useRecent.value ? '30 từ mới nhất' : 'Toàn bộ từ')
const totalQuestions = computed(() => quizWords.value.length || Math.min(MAX_QUESTIONS, activeWords.value.length))
const currentWord = computed(() => quizWords.value[currentIndex.value] || {})

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const buildOptions = (correctWord) => {
  const pool = activeWords.value.filter(w => w._id !== correctWord._id).map(w => w.pinyin)
  const distractorCount = Math.min(3, Math.max(pool.length, 0))
  const distractors = shuffle(pool).slice(0, distractorCount)
  options.value = shuffle([correctWord.pinyin, ...distractors].filter(Boolean))
}

const startQuiz = () => {
  quizWords.value = shuffle(activeWords.value).slice(0, Math.min(MAX_QUESTIONS, activeWords.value.length))
  currentIndex.value = 0
  score.value = 0
  answered.value = false
  feedback.value = ''
  quizStarted.value = true
  if (quizWords.value.length) buildOptions(quizWords.value[0])
}

const selectOption = (opt) => {
  if (answered.value || !currentWord.value) return
  answered.value = true
  selectedOption.value = opt
  const correctAnswer = currentWord.value.pinyin || ''
  const correct = (correctAnswer || '').trim().toLowerCase() === (opt || '').trim().toLowerCase()
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
  quizStarted.value = false
  answered.value = false
  feedback.value = ''
  options.value = []
  quizWords.value = []
  currentIndex.value = 0
  score.value = 0
}

const toggleRecent = () => {
  useRecent.value = !useRecent.value
  if (quizStarted.value) {
    restartQuiz()
  }
}

const buttonClass = (opt) => {
  if (!answered.value) return ''
  const correctAnswer = (currentWord.value.pinyin || '').trim().toLowerCase()
  const optNormalized = (opt || '').trim().toLowerCase()
  if (correctAnswer === optNormalized) return 'green'
  if ((selectedOption.value || '').trim().toLowerCase() === optNormalized) return 'red'
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

.zh-text {
  font-family: 'KaiTi','STKaiti','KaiTi TC',serif;
}
</style>

