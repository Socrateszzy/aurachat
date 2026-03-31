<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { User, Bot } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'

const store = useChatStore()
const messagesEndRef = ref<HTMLElement | null>(null)

// 当前会话的消息列表
const messages = computed(() => {
  return store.currentSession?.messages || []
})

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesEndRef.value) {
      messagesEndRef.value.scrollIntoView({ behavior: 'smooth' })
    }
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

// 格式化时间
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="h-full overflow-y-auto p-4">
    <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
      <div class="text-center">
        <Bot :size="48" class="mx-auto mb-4 text-gray-600" />
        <h3 class="text-xl font-medium mb-2">欢迎使用 AuraChat</h3>
        <p class="text-gray-400 max-w-md">
          选择左侧的模式开始对话，或直接在下方输入消息
        </p>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'flex gap-4 p-4 rounded-xl',
          msg.role === 'user' 
            ? 'bg-gray-800/50' 
            : 'bg-gray-900/50'
        ]"
      >
        <!-- 头像 -->
        <div class="flex-shrink-0">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center',
              msg.role === 'user'
                ? 'bg-purple-600'
                : 'bg-blue-600'
            ]"
          >
            <User
              v-if="msg.role === 'user'"
              :size="16"
              class="text-white"
            />
            <Bot
              v-else
              :size="16"
              class="text-white"
            />
          </div>
        </div>

        <!-- 消息内容 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-medium">
              {{ msg.role === 'user' ? '你' : 'AI助手' }}
            </span>
            <span class="text-xs text-gray-400">
              {{ formatTime(msg.timestamp) }}
            </span>
          </div>
          <div class="text-gray-200 whitespace-pre-wrap break-words">
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- 滚动锚点 -->
    <div ref="messagesEndRef" />
  </div>
</template>