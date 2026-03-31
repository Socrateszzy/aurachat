<script setup lang="ts">
import { computed } from 'vue'
import { MessageCircle, Code2, Languages, PenLine } from 'lucide-vue-next'
import { MODES, type ModeKey } from '../services/chatService'
import { useChatStore } from '../stores/chat'
import ThemeToggle from './ThemeToggle.vue'

const store = useChatStore()

// 图标映射
const modeIcons = {
  general: MessageCircle,
  code: Code2,
  translate: Languages,
  writing: PenLine
}

// 当前会话的模式
const currentMode = computed(() => {
  return store.currentSession?.mode || 'general'
})

// 切换模式
function switchMode(mode: string) {
  // 如果没有当前会话，先创建会话
  if (!store.currentSession) {
    store.createSession(mode as ModeKey)
    return
  }
  
  // 更新当前会话的模式
  if (store.currentSession.mode !== mode) {
    store.currentSession.mode = mode as ModeKey
  }
}
</script>

<template>
  <div class="mode-selector">
    <div class="mode-tabs">
      <button
        v-for="[key, config] in Object.entries(MODES)"
        :key="key"
        @click="switchMode(key)"
        :class="[
          'mode-tab',
          currentMode === key ? 'active' : ''
        ]"
        :title="config.label"
      >
        <component 
          :is="modeIcons[key as keyof typeof modeIcons]" 
          :size="16" 
          class="mode-icon"
        />
        <span class="mode-label sm:hidden">{{ config.label }}</span>
      </button>
    </div>
    
    <div class="theme-toggle-wrapper">
      <ThemeToggle />
    </div>
  </div>
</template>

<style scoped>
.mode-selector {
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--topbar-border);
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 4px;
}

.mode-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-muted);
  border: none;
  background: none;
  transition: all 0.2s ease;
}

.mode-tab:hover {
  background: var(--sidebar-item-hover);
  color: var(--text-secondary);
}

.mode-tab.active {
  background: rgba(59, 91, 219, 0.12);
  color: var(--accent);
  font-weight: 500;
}

.mode-icon {
  flex-shrink: 0;
}

.mode-label {
  white-space: nowrap;
}

.theme-toggle-wrapper {
  margin-left: auto;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .mode-label {
    display: none;
  }
  
  .mode-tab {
    padding: 6px 8px;
  }
}
</style>