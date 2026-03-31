<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '../stores/theme'

const theme = useThemeStore()
</script>

<template>
  <button
    class="theme-toggle"
    @click="theme.toggle()"
    :title="theme.isDark ? '切换到亮色模式' : '切换到暗色模式'"
    :aria-label="theme.isDark ? '切换到亮色模式' : '切换到暗色模式'"
  >
    <span class="toggle-option" :class="{ active: !theme.isDark }">
      <Sun :size="14" />
    </span>
    <span class="toggle-option" :class="{ active: theme.isDark }">
      <Moon :size="14" />
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  background: var(--sidebar-item-active);
  border: 1px solid var(--sidebar-border);
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
  cursor: pointer;
  outline: none;
}
.theme-toggle:focus-visible {
  box-shadow: 0 0 0 2px var(--accent);
}
.toggle-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: var(--text-muted);
  transition: background 0.2s, color 0.2s;
}
.toggle-option.active {
  background: var(--accent);
  color: #fff;
}
</style>