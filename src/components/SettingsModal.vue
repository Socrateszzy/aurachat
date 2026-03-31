<script setup lang="ts">
import { X, Sun, Moon, Server } from 'lucide-vue-next'
import { useThemeStore } from '../stores/theme'

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const themeStore = useThemeStore()

// 辅助函数
function setTheme(dark: boolean) {
  themeStore.isDark = dark
}

function toggleTheme() {
  themeStore.toggle()
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

          <!-- 后端状态 -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <Server :size="18" class="text-gray-300" />
              <h3 class="text-lg font-medium text-gray-200">后端状态</h3>
            </div>
            <div class="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <p class="text-sm text-gray-300 mb-2">
                API 服务器已移至后端，无需在前端配置 API Key。
              </p>
              <ul class="text-sm text-gray-400 space-y-1">
                <li class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>后端代理已连接：<code class="bg-gray-800 px-2 py-0.5 rounded">localhost:3001</code></span>
                </li>
                <li class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>支持 6 种 AI 模型</span>
                </li>
                <li class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>流式响应已启用</span>
                </li>
              </ul>
              <div class="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
                <p class="text-xs text-gray-400">
                  如需修改后端配置，请编辑 <code class="bg-gray-900 px-1.5 py-0.5 rounded">server/.env</code> 文件中的 API Key。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-6 border-t border-gray-700 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
        >
          关闭
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