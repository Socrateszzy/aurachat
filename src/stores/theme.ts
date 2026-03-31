import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 读取本地存储，默认 dark
  const isDark = ref<boolean>(
    localStorage.getItem('aurachat-theme') !== 'light'
  )

  function toggle() {
    isDark.value = !isDark.value
  }

  // 监听变化，同步到 <html> class 和 localStorage
  watch(isDark, (dark) => {
    document.documentElement.classList.toggle('light', !dark)
    localStorage.setItem('aurachat-theme', dark ? 'dark' : 'light')
  }, { immediate: true })

  return { isDark, toggle }
}, { persist: false })  // 手动持久化，不走 pinia-plugin