<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { SendHorizonal } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'

const props = defineProps<{
  isStreaming?: boolean
}>()

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
  <div class="chat-input-container">
    <!-- 输入框外壳 -->
    <div class="input-wrapper">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        @keydown="handleKeyDown"
        placeholder="输入消息..."
        class="message-input"
        rows="1"
      />
      
      <!-- 发送按钮 -->
      <button
        @click="handleSend"
        :disabled="!canSend"
        class="send-button"
        :title="canSend ? '发送消息' : '请输入内容'"
      >
        <SendHorizonal :size="14" class="send-icon" />
      </button>
    </div>

    <!-- 底栏 -->
    <div class="input-footer">
      <div class="footer-left">
        Enter 发送 · Shift+Enter 换行
      </div>
      <div class="footer-right">
        {{ inputText.length }} 字
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 整体容器 */
.chat-input-container {
  padding: 12px 16px 16px;
  background: var(--main-bg);
  border-top: 1px solid var(--topbar-border);
}

/* API Key 警告 */
.api-key-warning {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
}

.warning-text {
  font-size: 12px;
  color: rgba(245, 158, 11, 0.9);
  line-height: 1.4;
}

/* 输入框外壳 */
.input-wrapper {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 91, 219, 0.12);
}

/* 文本输入区域 */
.message-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;
  resize: none;
  min-height: 24px;
  max-height: 200px;
  line-height: 1.6;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--input-placeholder);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 发送按钮 */
.send-button {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.send-button:not(:disabled) {
  background: var(--accent);
}

.send-button:not(:disabled):hover {
  background: var(--accent-hover);
}

.send-button:disabled {
  background: var(--sidebar-item-active);
  cursor: not-allowed;
}

.send-icon {
  color: white;
}

/* 底栏 */
.input-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

.footer-left,
.footer-right {
  line-height: 1.4;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .chat-input-container {
    padding: 8px 12px 12px;
  }
  
  .input-wrapper {
    padding: 10px 12px;
  }
  
  .input-footer {
    font-size: 11px;
  }
}
</style>