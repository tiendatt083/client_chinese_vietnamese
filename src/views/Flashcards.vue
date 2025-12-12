<template>
  <div class="fc-container">
    <h1>Flashcards (Spaced Repetition nhẹ)</h1>

    <div v-if="loading" class="ui segment center">
      <div class="ui active inline loader"></div> Đang tải dữ liệu...
    </div>

    <div v-else-if="!words.length" class="ui segment center">
      Chưa có từ nào, hãy thêm từ trước.
    </div>

    <div v-else>
      <div class="stats">
        <span>Đến hạn: {{ dueWords.length }}</span>
        <span>Nguồn: {{ activeLabel }}</span>
        <span>Tổng thẻ: {{ activeWords.length }}</span>
        <button class="ui mini basic button" @click="toggleRecent">
          {{ useRecent ? 'Dùng toàn bộ' : 'Dùng 30 từ mới nhất' }}
        </button>
      </div>

      <div v-if="!currentCard" class="ui segment center">
        Không còn thẻ đến hạn. Hãy quay lại sau hoặc bấm “Xem hết” để học lại toàn bộ.
        <div class="fc-actions">
          <button class="ui button" @click="showAll">Xem hết</button>
          <button class="ui basic red button" @click="resetProgress">Xóa lịch ôn</button>
        </div>
      </div>

      <div v-else class="card">
        <div class="card-front" v-if="!showAnswer">
          <p class="label">Tiếng Trung</p>
          <h2>{{ currentCard.chinese }}</h2>
          <p class="pinyin">Pinyin: {{ currentCard.pinyin }}</p>
          <button class="ui primary button" @click="showAnswer = true">Xem nghĩa</button>
        </div>

        <div class="card-back" v-else>
          <p class="label">Tiếng Trung</p>
          <h2>{{ currentCard.chinese }}</h2>
          <p class="pinyin">Pinyin: {{ currentCard.pinyin }}</p>
          <div class="meaning">
            <p class="label">Tiếng Việt</p>
            <h3>{{ currentCard.vietnamese }}</h3>
            <p class="label">Loại từ: {{ currentCard.pos }}</p>
            <p v-if="currentCard.note" class="note">Ghi chú: {{ currentCard.note }}</p>
          </div>
          <div class="fc-actions">
            <button class="ui red button" @click="grade(false)">Chưa nhớ</button>
            <button class="ui green button" @click="grade(true)">Nhớ</button>
          </div>
        </div>
      </div>

      <div class="fc-actions">
        <button class="ui basic button" @click="skip">Bỏ qua</button>
        <button class="ui basic red button" @click="resetProgress">Xóa lịch ôn</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { viewAllWords } from '@/helpers/api'

const STORAGE_KEY = 'flashcard_progress'
const intervals = [0, 1, 2, 4, 7] // ngày

const words = ref([])
const loading = ref(true)
const showAnswer = ref(false)
const queue = ref([])
const progress = ref({})
const useRecent = ref(false)

const now = () => Date.now()

const loadProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    progress.value = saved
  } catch (e) {
    progress.value = {}
  }
}

const saveProgress = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress.value))
}

const activeWords = computed(() => useRecent.value ? words.value.slice(0, 30) : words.value)
const activeLabel = computed(() => useRecent.value ? '30 từ mới nhất' : 'Toàn bộ từ')

const computeDue = () => {
  const due = activeWords.value.filter(w => {
    const entry = progress.value[w._id]
    if (!entry) return true
    return entry.dueAt <= now()
  })
  queue.value = due
}

const dueWords = computed(() => queue.value)
const currentCard = computed(() => queue.value[0] || null)

const pickNext = () => {
  computeDue()
  showAnswer.value = false
}

const grade = (remembered) => {
  if (!currentCard.value) return
  const id = currentCard.value._id
  const entry = progress.value[id] || { step: 0, dueAt: 0 }
  if (!remembered) {
    entry.step = 0
    entry.dueAt = now() + 5 * 60 * 1000 // 5 phút ôn lại
  } else {
    entry.step = Math.min(entry.step + 1, intervals.length - 1)
    entry.dueAt = now() + intervals[entry.step] * 24 * 60 * 60 * 1000
  }
  progress.value[id] = entry
  saveProgress()
  queue.value.shift()
  showAnswer.value = false
}

const skip = () => {
  if (!currentCard.value) return
  queue.value.push(queue.value.shift())
  showAnswer.value = false
}

const showAll = () => {
  queue.value = [...activeWords.value]
  showAnswer.value = false
}

const resetProgress = () => {
  if (!confirm('Xóa toàn bộ lịch ôn?')) return
  progress.value = {}
  saveProgress()
  computeDue()
  showAnswer.value = false
}

const toggleRecent = () => {
  useRecent.value = !useRecent.value
  computeDue()
  showAnswer.value = false
}

onMounted(async () => {
  loadProgress()
  const res = await viewAllWords()
  words.value = Array.isArray(res) ? res : []
  computeDue()
  loading.value = false
})

watch(progress, saveProgress, { deep: true })
watch(useRecent, () => {
  computeDue()
  showAnswer.value = false
})
</script>

<style scoped>
.fc-container {
  max-width: 780px;
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

.stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #666;
}

.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 26px #0001;
  padding: 28px 22px;
  margin-bottom: 12px;
}

.label {
  color: #666;
  margin-bottom: 4px;
}

h2 {
  margin: 0 0 6px 0;
}

.pinyin {
  color: #6d6c8b;
  margin-bottom: 14px;
}

.meaning {
  margin: 10px 0 14px;
}
.note {
  margin-top: 6px;
  color: #6d6c8b;
  font-style: italic;
}

.fc-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}
</style>

