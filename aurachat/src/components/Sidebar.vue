<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, Settings, Plus } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'
import SettingsModal from './SettingsModal.vue'

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
  <div class="flex flex-col h-full bg-gray-900 border-r border-gray-800">
    <!-- 顶部区域 -->
    <div class="p-4 border-b border-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AuraChat
        </h1>
      </div>
      <button
        @click="handleNewChat"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
              ? 'bg-gray-700'
              : 'hover:bg-gray-800'
          ]"
        >
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ session.title }}</div>
            <div class="text-xs text-gray-400 mt-1">
              {{ formatTime(session.createdAt) }}
            </div>
          </div>
          <button
            @click.stop="store.deleteSession(session.id)"
            class="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-opacity"
          >
            <Trash2 :size="14" class="text-gray-400" />
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- 底部设置 -->
    <div class="p-4 border-t border-gray-800">
      <button
        @click="showSettings = true"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
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
