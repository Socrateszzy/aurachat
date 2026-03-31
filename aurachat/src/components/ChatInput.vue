<script setup lang="ts">
import { ref, computed } from 'vue'
import { Send, Loader2 } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'
import { streamChat, type ChatMessage } from '../services/deepseek'

const store = useChatStore()
const inputText = ref('')
const isStreaming = ref(false)
const abortController = ref<AbortController | null>(null)

// 检查是否可以进行聊天
const canSend = computed(() => {
  return (
    !isStreaming.value &&
    inputText.value.trim().length > 0 &&
    store.apiKey.length > 0 &&
    store.currentSession
  )
})

// 发送消息
async function sendMessage() {
  if (!canSend.value || !store.currentSession) return

  const sessionId = store.currentSession.id
  const userMessage = inputText.value.trim()
  const currentMode = store.currentSession.mode
  
  // 添加用户消息
  store.addMessage(sessionId, {
    role: 'user',
    content: userMessage,
    timestamp: Date.now()
  })

  inputText.value = ''
  
  // 准备流式响应
  isStreaming.value = true
  abortController.value = new AbortController()

  // 构建消息历史（仅限用户和助手消息）
  const historyMessages: ChatMessage[] = store.currentSession.messages
    .map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))

  try {
    await streamChat(
      historyMessages,
      currentMode,
      store.apiKey,
      // 流式更新最后一条消息
      (chunk) => {
        store.updateLastMessage(sessionId, chunk)
      },
      // 完成回调
      () => {
        isStreaming.value = false
        abortController.value = null
      },
      // 错误回调
      (error) => {
        console.error('Stream error:', error)
        isStreaming.value = false
        abortController.value = null
        
        // 添加错误消息
        store.addMessage(sessionId, {
          role: 'assistant',
          content: `抱歉，发生了错误：${error.message}`,
          timestamp: Date.now()
        })
      },
      abortController.value.signal
    )
  } catch (error) {
    console.error('Send message error:', error)
    isStreaming.value = false
    abortController.value = null
  }
}

// 停止生成
function stopGenerating() {
  if (abortController.value) {
    abortController.value.abort()
    isStreaming.value = false
    abortController.value = null
  }
}

// 处理键盘事件
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 检查API Key是否已设置
const hasApiKey = computed(() => {
  return store.apiKey.length > 0
})
</script>

<template>
  <div class="w-full">
    <!-- API Key 提示 -->
    <div v-if="!hasApiKey" class="mb-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
      <p class="text-amber-200 text-sm">
        请先点击左侧边栏底部的"设置"按钮，输入您的 DeepSeek API Key 以开始对话。
      </p>
    </div>

    <div class="relative">
      <textarea
        v-model="inputText"
        @keydown="handleKeyDown"
        :disabled="isStreaming || !hasApiKey"
        :placeholder="hasApiKey ? '输入消息... (Shift+Enter换行，Enter发送)' : '请先设置 API Key'"
        class="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        rows="3"
      />

      <!-- 发送/停止按钮 -->
      <div class="absolute right-2 bottom-2 flex gap-2">
        <button
          v-if="isStreaming"
          @click="stopGenerating"
          class="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          title="停止生成"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            <div class="w-4 h-4 bg-current rounded-sm"></div>
          </div>
        </button>

        <button
          v-else
          @click="sendMessage"
          :disabled="!canSend"
          :class="[
            'p-2 rounded-lg transition-colors',
            canSend
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          ]"
          title="发送消息"
        >
          <Send v-if="!isStreaming" :size="20" />
          <Loader2 v-else :size="20" class="animate-spin" />
        </button>
      </div>
    </div>

    <!-- 使用提示 -->
    <div class="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
      <div>支持：代码生成、文本翻译、文章润色</div>
      <div>Streaming: {{ isStreaming ? '进行中...' : '等待输入' }}</div>
    </div>
  </div>
</template>