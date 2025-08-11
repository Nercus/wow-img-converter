import { createNotivue } from 'notivue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './index.css'
import 'unfonts.css'
import '@fontsource-variable/montserrat'

import 'notivue/notification.css' // Only needed if using built-in <Notification />
import 'notivue/animations.css' // Only needed if using default animations

const pinia = createPinia()
const notivue = createNotivue({
  limit: 5,
})

const app = createApp(App)
app.use(pinia)
app.use(notivue)
app.mount('#app')
