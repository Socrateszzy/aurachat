import { ref } from 'vue'
import { useChatStore } from '../stores/chat'
import { streamChat } from '../services/api'
import type { ChatMessage } from '../services/deepseek'

export function useChat() {
  const store = useChatStore()
  const isStreaming = ref(false)
  const abortController = ref<AbortController | null>(null)

  async function sendMessage(content: string) {
    const session = store.currentSession
    if (!session) {
      console.warn('没有活动会话')
      return '没有活动会话'
    }

    const sessionId = session.id
    const modelId = store.selectedModelId

    // 1. 添加用户消息
    store.addMessage(sessionId, {
      role: 'user',
      content,
      timestamp: Date.now()
    })

    // 2. 如果是第一条消息，更新会话标题
    const messages = session.messages
    if (messages.length === 1) { // 刚刚添加了一条用户消息
      const title = content.slice(0, 20) + (content.length > 20 ? '...' : '')
      store.updateSessionTitle(sessionId, title)
    }

    // 3. 添加空的助手消息
    store.addMessage(sessionId, {
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    })

    // 4. 开始流式响应
    isStreaming.value = true
    abortController.value = new AbortController()

    // 5. 构建消息历史
    const historyMessages: ChatMessage[] = session.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))

    try {
      await streamChat(
        historyMessages,
        modelId,
        // 6. 流式更新最后一条消息
        (chunk) => {
          store.updateLastMessage(sessionId, chunk)
        },
        // 7. 完成回调
        () => {
          isStreaming.value = false
          abortController.value = null
        },
        // 8. 错误回调
        (error) => {
          console.error('Stream error:', error)
          isStreaming.value = false
          abortController.value = null

          // 非中止错误时更新消息
          if (error.name !== 'AbortError') {
            store.updateLastMessage(
              sessionId,
              `⚠️ 请求出错：${error.message || '未知错误'}`
            )
          }
        },
        abortController.value.signal
      )
    } catch (error) {
      console.error('Send message error:', error)
      isStreaming.value = false
      abortController.value = null
      
      if (error instanceof Error && error.name !== 'AbortError') {
        store.updateLastMessage(
          sessionId,
          `⚠️ 请求出错：${error.message || '未知错误'}`
        )
      }
    }
  }

  function stopStream() {
    if (abortController.value) {
      abortController.value.abort()
      isStreaming.value = false
      abortController.value = null
    }
  }

  return {
    sendMessage,
    stopStream,
    isStreaming
  }
}