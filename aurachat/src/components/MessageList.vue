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
  <div ref="listRef" class="flex-1 overflow-y-auto p-4 space-y-4">
    <!-- 无消息时的欢迎区域 -->
    <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-300">
      <div class="max-w-2xl w-full text-center">
        <Bot :size="64" class="mx-auto mb-6 text-blue-400" />
        <h1 class="text-3xl font-bold mb-8">欢迎使用 AuraChat</h1>
        <p class="text-gray-400 mb-10 text-lg">
          选择模式开始对话，或使用下面的快捷提示
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <button
            v-for="(prompt, index) in quickPrompts"
            :key="index"
            @click="sendQuickPrompt(prompt.text)"
            class="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
          >
            <div class="text-sm font-medium text-blue-400 mb-1">快捷提示</div>
            <div class="text-gray-200">{{ prompt.text }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'flex',
          msg.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <!-- 用户消息 -->
        <div
          v-if="msg.role === 'user'"
          class="max-w-[70%] bg-blue-600 text-white rounded-2xl px-4 py-2"
        >
          <div class="whitespace-pre-wrap break-words">{{ msg.content }}</div>
        </div>
        
        <!-- 助手消息 -->
        <div
          v-else
          class="max-w-[85%] bg-gray-800 rounded-2xl px-4 py-3"
        >
          <div
            class="prose prose-invert max-w-none text-gray-200"
            v-html="getMessageHtml(msg)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
