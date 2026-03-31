<script setup lang="ts">
import { ref, computed } from 'vue'
import { SquarePen, Search, Trash2 } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'
import ThemeToggle from './ThemeToggle.vue'

const store = useChatStore()
const searchQuery = ref('')
const hoveredSessionId = ref<string | null>(null)

// 计算是否显示搜索栏（会话超过5个）
const showSearch = computed(() => {
  return store.sessions.length > 5
})

// 根据搜索过滤会话
const filteredSessions = computed(() => {
  if (!searchQuery.value.trim()) {
    return [...store.sessions].reverse()
  }
  const query = searchQuery.value.toLowerCase()
  return [...store.sessions].reverse().filter(session =>
    session.title.toLowerCase().includes(query)
  )
})

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

// 处理会话 hover 状态
function handleMouseEnter(sessionId: string) {
  hoveredSessionId.value = sessionId
}

function handleMouseLeave() {
  hoveredSessionId.value = null
}
</script>

<template>
  <div class="sidebar">
    <!-- 顶部区域 -->
    <div class="sidebar-top">
      <div class="flex items-center justify-between">
        <h1 class="sidebar-title">AuraChat</h1>
        <button
          @click="handleNewChat"
          class="new-chat-btn"
          title="新建对话"
          aria-label="新建对话"
        >
          <SquarePen :size="16" />
        </button>
      </div>
    </div>

    <!-- 搜索栏（会话超过5个时显示） -->
    <div v-if="showSearch" class="sidebar-search">
      <div class="search-container">
        <Search :size="14" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索对话..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 会话列表 -->
    <div class="sidebar-list">
      <TransitionGroup name="session" tag="div">
        <div
          v-for="session in filteredSessions"
          :key="session.id"
          @click="store.switchSession(session.id)"
          @mouseenter="handleMouseEnter(session.id)"
          @mouseleave="handleMouseLeave"
          :class="[
            'session-item',
            store.currentSessionId === session.id ? 'active' : ''
          ]"
        >
          <div class="session-content">
            <div class="session-title">{{ session.title }}</div>
            <div class="session-time">{{ formatTime(session.createdAt) }}</div>
          </div>
          <button
            v-show="hoveredSessionId === session.id"
            @click.stop="store.deleteSession(session.id)"
            class="delete-btn"
            title="删除对话"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- 底部区域 -->
    <div class="sidebar-bottom">
      <div>
        <ThemeToggle />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 侧边栏整体样式 */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 顶部区域 */
.sidebar-top {
  padding: 12px 12px 8px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.new-chat-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-chat-btn:hover {
  background-color: var(--sidebar-item-hover);
}

/* 搜索栏 */
.sidebar-search {
  padding: 0 12px 8px;
}

.search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 32px;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary);
  padding: 0 10px 0 32px;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--input-border-focus);
}

/* 会话列表 */
.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}

/* 自定义滚动条 */
.sidebar-list::-webkit-scrollbar {
  width: 4px;
}

.sidebar-list::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-list::-webkit-scrollbar-thumb {
  background: var(--sidebar-border);
  border-radius: 2px;
}

/* 会话项 */
.session-item {
  position: relative;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: var(--sidebar-item-hover);
}

.session-item.active {
  background-color: var(--sidebar-item-active);
  border-left: 2px solid var(--accent);
}

.session-content {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.session-item:hover .delete-btn {
  opacity: 1;
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

/* 底部区域 */
.sidebar-bottom {
  padding: 8px 12px 12px;
  border-top: 1px solid var(--sidebar-border);
}

.settings-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.settings-btn:hover {
  background-color: var(--sidebar-item-hover);
}
</style>