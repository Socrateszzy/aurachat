<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { Menu } from 'lucide-vue-next'
import { Send, Square } from 'lucide-vue-next'
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
      <div class="p-4 border-t border-[var(--topbar-border)] bg-[var(--topbar-bg)]">
        <ChatInput ref="chatInputRef" @send="handleSend">
          <template #controls="{ canSend, inputText }">
            <!-- 流式响应时的停止按钮 -->
            <button
              v-if="isStreaming"
              @click="stopStream"
              class="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              title="停止生成"
            >
              <Square :size="16" />
              停止
            </button>
            <!-- 正常发送按钮 -->
            <button
              v-else
              @click="() => handleSend(inputText)"
              :disabled="!canSend"
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium',
                canSend
                  ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'
                  : 'bg-[var(--input-bg)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--input-border)]'
              ]"
              title="发送消息"
            >
              <Send :size="16" />
              发送
            </button>
          </template>
        </ChatInput>
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
</style>
