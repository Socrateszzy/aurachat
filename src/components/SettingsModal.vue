<script setup lang="ts">
import { ref } from 'vue'
import { X, Eye, EyeOff, ExternalLink, Sun, Moon } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'
import { useThemeStore } from '../stores/theme'

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useChatStore()
const apiKeyInput = ref(store.apiKey)
const showApiKey = ref(false)

// 主题管理
const themeStore = useThemeStore()

// 辅助函数
function setTheme(dark: boolean) {
  themeStore.isDark = dark
}

function toggleTheme() {
  themeStore.toggle()
}

function saveApiKey() {
  store.setApiKey(apiKeyInput.value)
  emit('close')
}

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
    emit('close')
  }
}
</script>

<template>
  <div
    class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    @click="handleBackdropClick"
  >
    <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 class="text-xl font-bold text-gray-100">设置</h2>
        <button
          @click="$emit('close')"
          class="p-1 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X :size="20" class="text-gray-400" />
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="p-6">
        <div class="space-y-6">
          <!-- API Key 设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              DeepSeek API Key
            </label>
            <div class="relative">
              <input
                v-model="apiKeyInput"
                :type="showApiKey ? 'text' : 'password'"
                placeholder="输入您的 DeepSeek API Key"
                class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                @click="showApiKey = !showApiKey"
                class="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                type="button"
              >
                <Eye v-if="!showApiKey" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-400">
              您可以在
              <a
                href="https://platform.deepseek.com"
                target="_blank"
                class="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
              >
                DeepSeek 平台
                <ExternalLink :size="14" />
              </a>
              申请 API Key
            </p>
          </div>

          <!-- 主题设置 -->
          <div>
            <h3 class="text-lg font-medium text-gray-200 mb-4">主题设置</h3>
            <div class="flex items-center gap-4">
              <button
                @click="setTheme(true)"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  themeStore.isDark
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-800'
                ]"
              >
                <Moon :size="16" />
                深色
              </button>
              <button
                @click="setTheme(false)"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  !themeStore.isDark
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-800'
                ]"
              >
                <Sun :size="16" />
                浅色
              </button>
              <button
                @click="toggleTheme"
                class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
              >
                切换主题
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-400">
              当前主题: {{ themeStore.isDark ? '深色模式' : '浅色模式' }}
            </p>
          </div>

          <!-- 其他设置预留 -->
          <div>
            <h3 class="text-lg font-medium text-gray-200 mb-4">高级设置</h3>
            <p class="text-gray-400 text-sm">更多设置选项将在后续版本中添加...</p>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-6 border-t border-gray-700 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          @click="saveApiKey"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  backdrop-filter: blur(4px);
}
</style>