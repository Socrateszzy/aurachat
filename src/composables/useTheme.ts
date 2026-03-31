import { ref, watch } from 'vue'

const THEME_KEY = 'aurachat-theme'
type Theme = 'dark' | 'light'

const theme = ref<Theme>('dark')

// 初始化主题
const initTheme = () => {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null
  if (saved) {
    theme.value = saved
  } else {
    // 检测系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }
  applyTheme()
}

// 应用主题到 DOM
const applyTheme = () => {
  const html = document.documentElement
  if (theme.value === 'light') {
    html.classList.add('light')
  } else {
    html.classList.remove('light')
  }
}

// 切换主题
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem(THEME_KEY, theme.value)
  applyTheme()
}

// 设置特定主题
const setTheme = (newTheme: Theme) => {
  theme.value = newTheme
  localStorage.setItem(THEME_KEY, newTheme)
  applyTheme()
}

// 监听系统主题变化
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem(THEME_KEY)) {
      theme.value = e.matches ? 'dark' : 'light'
      applyTheme()
    }
  }
  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}

// 导出 Vue 组合式函数
export function useTheme() {
  // 监听 theme 变化
  watch(theme, () => {
    applyTheme()
  })

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light'
  }
}

// 导出独立的初始化函数
export function initThemeSystem() {
  initTheme()
  watchSystemTheme()
}

// 导出工具函数
export { theme, toggleTheme, setTheme }
