<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, Settings, Plus } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'
import SettingsModal from './SettingsModal.vue'
import ThemeToggle from './ThemeToggle.vue'

const store = useChatStore()
const showSettings = ref(false)

// 格式化相对时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDate.getTime() === today.getTime()) {
    // 今天：显示时分
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    // 其他：显示日期
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// 创建新会话
function handleNewChat() {
  store.createSession()
}
</script>

<template>
  <div class="flex flex-col h-full sidebar">
    <!-- 顶部区域 -->
    <div class="p-4 border-b sidebar-border">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AuraChat
        </h1>
        <ThemeToggle />
      </div>
      <button
        @click="handleNewChat"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors"
      >
        <Plus :size="16" />
        新对话
      </button>
    </div>

    <!-- 会话列表（有过渡动画） -->
    <div class="flex-1 overflow-y-auto p-2">
      <TransitionGroup name="session" tag="div">
        <div
          v-for="session in [...store.sessions].reverse()"
          :key="session.id"
          @click="store.switchSession(session.id)"
          :class="[
            'session-item group relative flex items-center justify-between p-3 rounded-lg mb-1 cursor-pointer transition-colors',
            store.currentSessionId === session.id
              ? 'sidebar-item-active'
              : 'hover:sidebar-item-hover'
          ]"
        >
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate text-[var(--text-primary)]">{{ session.title }}</div>
            <div class="text-xs text-[var(--text-muted)] mt-1">
              {{ formatTime(session.createdAt) }}
            </div>
          </div>
          <button
            @click.stop="store.deleteSession(session.id)"
            class="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--sidebar-item-hover)] rounded transition-opacity"
          >
            <Trash2 :size="14" class="text-[var(--text-muted)]" />
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- 底部设置 -->
    <div class="p-4 border-t sidebar-border">
      <button
        @click="showSettings = true"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)] rounded-lg transition-colors"
      >
        <Settings :size="18" />
        设置
      </button>
    </div>

    <!-- 设置弹窗 -->
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<style scoped>
/* 侧边栏样式 */
.sidebar {
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
}

.sidebar-border {
  border-color: var(--sidebar-border);
}

.sidebar-item-hover {
  background-color: var(--sidebar-item-hover);
}

.sidebar-item-active {
  background-color: var(--sidebar-item-active);
}

/* 会话列表过渡动画 */
.session-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.session-enter-active {
  transition: all 0.2s ease;
}
.session-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
.session-leave-active {
  transition: all 0.2s ease;
}
.session-move {
  transition: transform 0.2s ease;
}
</style>
