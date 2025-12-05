import { createRouter, createWebHistory } from 'vue-router'

// Import all route components (pages/views)
import Words from './views/Words.vue'
import Show from './views/Show.vue'
import New from './views/New.vue'
import Edit from './views/Edit.vue'
import Test from './views/Test.vue'
import QuizChoice from './views/QuizChoice.vue'
import Flashcards from './views/Flashcards.vue'

// Define all routes in the application
const routes = [
   {
      path: '/',                  // Home/root path
      redirect: '/words'          // Redirect to /words (default landing page)
   },
   {
      path: '/words',             // Word list page
      name: 'Words',
      component: Words
   },
   {
      path: '/words/new',         // Add new word page
      name: 'New',
      component: New
   },
   {
      path: '/words/show/:id',    // Show detail for one word (by id)
      name: 'Show',
      component: Show
   },
   {
      path: '/words/edit/:id',    // Edit word page (by id)
      name: 'Edit',
      component: Edit
   },
   {
      path: '/test',              // Vocabulary test page
      component: Test 
   },
   {
      path: '/quiz-choice',       // Multiple choice quiz (Chinese -> Vietnamese)
      name: 'QuizChoice',
      component: QuizChoice
   },
   {
      path: '/flashcards',        // Flashcards with spaced repetition
      name: 'Flashcards',
      component: Flashcards
   },
]

// Create router instance with history mode and route definitions
const router = createRouter({
   history: createWebHistory(),    // Use HTML5 history mode (clean URLs)
   routes                          // Pass the route definitions
})

// Export the router for use in main.js
export default router
