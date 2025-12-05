import { createApp } from 'vue'         // Import createApp for initializing Vue app
import App from './App.vue'             // Import root App component
import router from './router'           // Import router for SPA navigation

import 'semantic-ui-css/semantic.css'   // Import Semantic UI CSS framework for styling

const app = createApp(App)              // Create a new Vue application instance

app.use(router)                         // Use the router (SPA routing)

app.mount('#app')                       // Mount the app to the DOM element with id 'app'
