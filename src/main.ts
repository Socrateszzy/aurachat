import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './assets/main.css'
import App from './App.vue'

// 在 Vue 挂载前立即应用主题，避免 FOUC
const savedTheme = localStorage.getItem('aurachat-theme')
if (savedTheme === 'light') {
  document.documentElement.classList.add('light')
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App).use(pinia).mount('#app')
