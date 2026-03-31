<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { Send } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'

const emit = defineEmits<{
  send: [content: string]
}>()

const store = useChatStore()
const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 检查是否可以进行聊天
const canSend = computed(() => {
  return (
    inputText.value.trim().length > 0 &&
    store.apiKey.length > 0 &&
    store.currentSession
  )
})

// 处理发送
function handleSend() {
  const content = inputText.value.trim()
  if (!canSend.value) return

  emit('send', content)
  inputText.value = ''
  resetTextareaHeight()
}

// 处理键盘事件
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
  // Shift+Enter 允许换行，不 prevent
}

// 重置 textarea 高度
function resetTextareaHeight() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = 'auto' // 重置
    }
  })
}

// 动态调整 textarea 高度
function adjustTextareaHeight() {
  if (!textareaRef.value) return

  const el = textareaRef.value
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

// 聚焦输入框
function focus() {
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
}

// 监听输入文本变化，调整高度
watch(inputText, () => {
  nextTick(() => {
    adjustTextareaHeight()
  })
})

// 初始化
onMounted(() => {
  focus()
})

// 暴露方法给父组件
defineExpose({
  focus
})
</script>

<template>
  <div class="w-full">
    <!-- API Key 提示 -->
    <div v-if="!store.apiKey" class="mb-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
      <p class="text-amber-200 text-sm">
        请先点击左侧边栏底部的"设置"按钮，输入您的 DeepSeek API Key 以开始对话。
      </p>
    </div>

    <div class="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl overflow-hidden">
      <!-- 文本输入区域 -->
      <textarea
        ref="textareaRef"
        v-model="inputText"
        @keydown="handleKeyDown"
        :disabled="!store.apiKey"
        :placeholder="store.apiKey ? '输入消息... (Shift+Enter换行，Enter发送)' : '请先设置 API Key'"
        class="w-full px-4 py-3 bg-transparent text-[var(--text-primary)] placeholder-[var(--input-placeholder)] focus:outline-none resize-none min-h-[44px] max-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
        rows="1"
      />

      <!-- 底部工具栏 -->
      <div class="flex items-center justify-between px-4 py-2 border-t border-[var(--input-border)] bg-[var(--input-bg)]/50">
        <!-- 左侧：字数统计 -->
        <div class="text-xs text-[var(--text-muted)]">
          {{ inputText.length }} 字
        </div>

        <!-- 右侧：发送/停止按钮 -->
        <div class="flex items-center gap-2">
          <!-- 这里预留 isStreaming 状态，由父组件传递 -->
          <slot name="controls" :canSend="canSend" :inputText="inputText">
            <!-- 默认按钮，父组件可以覆盖 -->
            <button
              @click="handleSend"
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
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
