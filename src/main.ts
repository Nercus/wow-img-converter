import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './index.css'
import 'unfonts.css'
import '@fontsource-variable/montserrat'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.mount('#app')
