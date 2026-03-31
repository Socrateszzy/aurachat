<script setup lang="ts">
import { computed } from 'vue'
import { Download, Trash2 } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'

const store = useChatStore()

// 当前会话
const currentSession = computed(() => store.currentSession)

// 导出当前对话为Markdown
function exportConversation() {
  if (!currentSession.value) return

  const session = currentSession.value
  let markdown = `# ${session.title}\n\n`

  session.messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? 'User' : 'Assistant'
    markdown += `**${role}:** ${msg.content}\n\n`
    
    // 在消息之间添加分隔线，但不是最后一条
    if (index < session.messages.length - 1) {
      markdown += '---\n\n'
    }
  })

  // 创建下载链接
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${session.title.replace(/[^\w\s]/gi, '')}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 清空当前对话（需要二次确认）
function clearConversation() {
  if (!currentSession.value) return

  if (confirm('确定要清空当前对话吗？所有消息将被删除且无法恢复。')) {
    // 清空消息
    if (store.currentSession) {
      store.currentSession.messages = []
    }
  }
}

// 检查是否有消息可以导出/清空
const hasMessages = computed(() => {
  return currentSession.value?.messages && currentSession.value.messages.length > 0
})
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
    <div class="text-sm text-gray-400">
      当前对话: <span class="font-medium text-gray-300">{{ currentSession?.title || '新对话' }}</span>
      <span v-if="currentSession?.messages" class="ml-2">
        ({{ currentSession.messages.length }} 条消息)
      </span>
    </div>

    <div class="flex items-center gap-2">
      <!-- 导出按钮 -->
      <button
        @click="exportConversation"
        :disabled="!hasMessages"
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium',
          hasMessages
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
        ]"
        :title="hasMessages ? '导出对话为Markdown' : '没有消息可导出'"
      >
        <Download :size="14" />
        导出
      </button>

      <!-- 清空按钮 -->
      <button
        @click="clearConversation"
        :disabled="!hasMessages"
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium',
          hasMessages
            ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300 hover:text-red-100 border border-red-800/50'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60 border border-gray-700/50'
        ]"
        :title="hasMessages ? '清空当前对话' : '没有消息可清空'"
      >
        <Trash2 :size="14" />
        清空
      </button>
    </div>
  </div>
</template>