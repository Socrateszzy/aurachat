<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Square } from 'lucide-vue-next'
import Sidebar from './components/Sidebar.vue'
import ModeSelector from './components/ModeSelector.vue'
import MessageList from './components/MessageList.vue'
import ChatInput from './components/ChatInput.vue'
import { initStore } from './stores/chat'
import { useChat } from './composables/useChat'

const isSidebarOpen = ref(false)
const isMobile = ref(false)
const { sendMessage, stopStream, isStreaming } = useChat()

// 检查是否为移动端
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

// 切换侧边栏
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 关闭侧边栏（移动端）
function closeSidebar() {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

onMounted(() => {
  initStore()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 处理发送消息
async function handleSend(content: string) {
  await sendMessage(content)
}
</script>

<template>
  <div id="layout" class="app-shell">
    <!-- 移动端遮罩 -->
    <div 
      v-if="isSidebarOpen && isMobile" 
      class="sidebar-overlay" 
      @click="closeSidebar"
    />
    
    <!-- 侧边栏 -->
    <div
      :class="[
        'sidebar-container',
        isMobile ? 'mobile-sidebar' : 'desktop-sidebar',
        isSidebarOpen ? 'open' : ''
      ]"
    >
      <Sidebar />
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-panel">
      <!-- 移动端汉堡菜单 -->
      <button
        v-if="isMobile"
        @click="toggleSidebar"
        class="mobile-menu-btn"
        title="切换侧边栏"
        aria-label="切换侧边栏"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="isSidebarOpen" d="M6 18L18 6M6 6l12 12" />
          <path v-else d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <!-- 模式选择器 -->
      <ModeSelector />
      
      <!-- 消息列表 -->
      <MessageList 
        @send="handleSend" 
        :isStreaming="isStreaming" 
      />
      
      <!-- 输入框 -->
      <div class="chat-input-area">
        <div class="input-wrapper">
          <ChatInput 
            @send="handleSend" 
            :isStreaming="isStreaming" 
          />
          <!-- 流式响应时的停止按钮 -->
          <button
            v-if="isStreaming"
            @click="stopStream"
            class="stop-button"
            title="停止生成"
          >
            <Square :size="16" />
            停止
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 应用外壳 */
.app-shell {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background: var(--main-bg);
  color: var(--text-primary);
}

/* 侧边栏容器 */
.sidebar-container {
  flex-shrink: 0;
  height: 100%;
  display: flex;
}

/* 桌面端侧边栏 */
.desktop-sidebar {
  width: var(--sidebar-width);
  border-right: 1px solid var(--sidebar-border);
}

/* 移动端侧边栏 */
.mobile-sidebar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  z-index: 50;
  border-right: 1px solid var(--sidebar-border);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.mobile-sidebar.open {
  transform: translateX(0);
}

/* 主面板 */
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  position: relative;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 40;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sidebar-item-hover);
  border: 1px solid var(--sidebar-border);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.mobile-menu-btn:hover {
  background: var(--sidebar-item-active);
}

/* 输入区域样式 */
.chat-input-area {
  padding: 12px 16px 16px;
  background: var(--main-bg);
  border-top: 1px solid var(--topbar-border);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.stop-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
  height: 46px;
}

.stop-button:hover {
  background: #dc2626;
}
</style>

<style>
/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 亮色主题滚动条 */
html.light ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
}

html.light ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>