<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { Menu, Square } from 'lucide-vue-next'
import Sidebar from './components/Sidebar.vue'
import ModeSelector from './components/ModeSelector.vue'
import MessageList from './components/MessageList.vue'
import ChatInput from './components/ChatInput.vue'
import { initStore } from './stores/chat'
import { useChat } from './composables/useChat'

const isSidebarOpen = ref(false)
// 模板中需要绑定ref，但逻辑中暂未使用
// @ts-ignore
const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null)
const { sendMessage, stopStream, isStreaming } = useChat()

onMounted(() => {
  initStore()
})

// 提供 isStreaming 给子组件
provide('isStreaming', isStreaming)

// 处理发送消息
async function handleSend(content: string) {
  await sendMessage(content)
}

// 处理快捷提示
function handleQuickPrompt(prompt: string) {
  // 直接发送消息，不需要通过chatInputRef
  sendMessage(prompt)
}

// 聚焦输入框（暂不使用，保留以供未来需要）
// function focusInput() {
//   if (chatInputRef.value) {
//     chatInputRef.value.focus()
//   }
// }
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[var(--main-bg)] text-[var(--text-primary)]">
    <!-- 移动端汉堡菜单 -->
    <button
      @click="isSidebarOpen = !isSidebarOpen"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--sidebar-item-hover)] rounded-lg hover:bg-[var(--sidebar-item-active)] transition-colors"
    >
      <Menu :size="20" />
    </button>

    <!-- 侧边栏 -->
    <div
      :class="[
        'fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <Sidebar />
    </div>

    <!-- 侧边栏遮罩 -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
    ></div>

    <!-- 主内容区域 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部模式选择器 -->
      <div class="p-4 border-b border-[var(--topbar-border)] bg-[var(--topbar-bg)]">
        <ModeSelector />
      </div>

  <!-- 消息列表 -->
  <div class="flex-1 overflow-hidden">
    <MessageList @send="handleQuickPrompt" />
  </div>

      <!-- 输入框 -->
      <div class="chat-input-area">
        <div class="input-wrapper">
          <ChatInput ref="chatInputRef" @send="handleSend" />
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

<style>
/* 自定义滚动条 */
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
