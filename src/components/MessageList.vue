<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch, inject } from 'vue'
import { Bot } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark-dimmed.css'
import type { SessionMessage } from '../stores/chat'
import { useChatStore } from '../stores/chat'

const emit = defineEmits<{
  send: [prompt: string]
}>()

const store = useChatStore()
const listRef = ref<HTMLElement | null>(null)
const isStreaming = inject('isStreaming', ref(false))

// 当前会话的消息列表
const messages = computed(() => {
  return store.currentSession?.messages || []
})

// 检查是否是最后一条助手消息
const lastAssistantMessage = computed(() => {
  if (messages.value.length === 0) return null
  const lastMsg = messages.value[messages.value.length - 1]
  return lastMsg.role === 'assistant' ? lastMsg : null
})

// 快捷提示
const quickPrompts = [
  { text: '帮我写一个 Vue 3 的自定义 hook', mode: 'code' },
  { text: '用中文解释 async/await 的原理', mode: 'general' },
  { text: '把这段代码翻译成 TypeScript：...', mode: 'code' },
  { text: '帮我润色这段话：...', mode: 'writing' }
]

// 配置 markdown-it
const md: MarkdownIt = new MarkdownIt({
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
  html: true,
  linkify: true,
  typographer: true
})

// 获取消息的HTML内容
function getMessageHtml(msg: SessionMessage): string {
  const showCursor = msg === lastAssistantMessage.value && isStreaming?.value
  const content = msg.content + (showCursor ? '<span class="streaming-cursor"></span>' : '')
  return md.render(content)
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  })
}

// 发送快捷提示
function sendQuickPrompt(prompt: string) {
  emit('send', prompt)
}

// 格式化消息时间
function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 消息变化时滚动到底部
onMounted(() => {
  scrollToBottom()
})

// 监听消息变化
watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<template>
  <div class="message-list" ref="listRef">
    <!-- 无消息时的欢迎区域 -->
    <div v-if="messages.length === 0" class="welcome-container">
      <div class="welcome-content">
        <Bot :size="48" class="welcome-icon" />
        <h1 class="welcome-title">欢迎使用 AuraChat</h1>
        <p class="welcome-subtitle">
          选择模式开始对话，或使用下面的快捷提示
        </p>
        
        <div class="quick-prompts-grid">
          <button
            v-for="(prompt, index) in quickPrompts"
            :key="index"
            @click="sendQuickPrompt(prompt.text)"
            class="quick-prompt-card"
          >
            <div class="card-label">快捷提示</div>
            <div class="card-text">{{ prompt.text }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 消息列表（有过渡动画） -->
    <TransitionGroup
      v-else
      name="msg"
      tag="div"
      class="messages-container"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-wrapper"
      >
        <!-- 消息时间 -->
        <div class="message-time">
          {{ formatMessageTime(msg.timestamp) }}
        </div>
        
        <!-- 用户消息 -->
        <div
          v-if="msg.role === 'user'"
          class="message-bubble user-bubble"
        >
          <div class="message-content">{{ msg.content }}</div>
        </div>
        
        <!-- 助手消息 -->
        <div
          v-else
          class="message-bubble assistant-bubble"
        >
          <div
            class="message-content markdown-content"
            v-html="getMessageHtml(msg)"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* 消息列表容器 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  height: 100%;
}

/* 欢迎区域 */
.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 500px;
}

.welcome-content {
  max-width: 640px;
  width: 100%;
  text-align: center;
}

.welcome-icon {
  color: var(--accent);
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 32px;
}

/* 快捷提示网格 */
.quick-prompts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0 auto;
  max-width: 560px;
}

.quick-prompt-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.quick-prompt-card:hover {
  background: var(--card-hover-bg);
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
}

.card-label {
  font-size: 11px;
  color: var(--accent);
  margin-bottom: 6px;
  font-weight: 500;
}

.card-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
}

/* 消息容器 */
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
  text-align: center;
}

/* 消息气泡基础样式 */
.message-bubble {
  max-width: 85%;
  font-size: 14px;
  line-height: 1.6;
}

.user-bubble {
  max-width: 75%;
  float: right;
  background: var(--bubble-user-bg);
  color: var(--bubble-user-text);
  border-radius: 18px 18px 4px 18px;
  padding: 10px 16px;
  align-self: flex-end;
}

.assistant-bubble {
  background: var(--bubble-ai-bg);
  border: 1px solid var(--bubble-ai-border);
  border-radius: 4px 18px 18px 18px;
  padding: 14px 18px;
  align-self: flex-start;
}

.message-content {
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* Markdown 内容样式 */
.markdown-content {
  color: var(--text-primary);
  line-height: 1.7;
}

.markdown-content :deep(pre) {
  margin: 12px 0;
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-content :deep(code) {
  font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
}

.markdown-content :deep(.hljs) {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 6px;
}

.markdown-content :deep(.streaming-cursor) {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: var(--accent);
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 消息列表过渡动画 */
.msg-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.msg-enter-active {
  transition: all 0.2s ease;
}
.msg-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.msg-leave-active {
  transition: all 0.2s ease;
}
.msg-move {
  transition: transform 0.2s ease;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .quick-prompts-grid {
    grid-template-columns: 1fr;
    max-width: 320px;
  }
  
  .user-bubble,
  .assistant-bubble {
    max-width: 90%;
  }
}
</style>