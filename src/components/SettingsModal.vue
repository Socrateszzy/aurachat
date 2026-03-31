<script setup lang="ts">
import { computed } from 'vue'
import { X, Sun, Moon } from 'lucide-vue-next'
import { useChatStore } from '../stores/chat'
import { useThemeStore } from '../stores/theme'
import { MODELS, PROVIDER_COLORS } from '../config/models'

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useChatStore()
const themeStore = useThemeStore()

// 当前选择的模型
const selectedModelId = computed({
  get: () => store.selectedModelId,
  set: (value) => store.setModel(value)
})

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

function handleSave() {
  // 这里可以添加其他保存逻辑
  emit('close')
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
          <!-- 模型选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              默认模型
            </label>
            <div class="space-y-2">
              <select
                v-model="selectedModelId"
                class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option v-for="model in MODELS" :key="model.id" :value="model.id">
                  {{ model.provider }} - {{ model.name }}
                </option>
              </select>
              <div v-if="selectedModelId" class="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <div class="flex items-center gap-2 mb-1">
                  <div 
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: PROVIDER_COLORS[MODELS.find(m => m.id === selectedModelId)?.providerIcon || 'deepseek'] }"
                  ></div>
                  <span class="font-medium text-gray-200">
                    {{ MODELS.find(m => m.id === selectedModelId)?.name }}
                  </span>
                  <span 
                    v-if="MODELS.find(m => m.id === selectedModelId)?.badge"
                    class="px-2 py-0.5 text-xs rounded-full bg-purple-600 text-white"
                  >
                    {{ MODELS.find(m => m.id === selectedModelId)?.badge }}
                  </span>
                </div>
                <p class="text-sm text-gray-400">
                  {{ MODELS.find(m => m.id === selectedModelId)?.description }}
                </p>
                <div class="flex flex-wrap gap-1 mt-2">
                  <span 
                    v-for="tag in MODELS.find(m => m.id === selectedModelId)?.tags" 
                    :key="tag"
                    class="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-400">
              更改后将应用于新对话
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

          <!-- 后端状态 -->
          <div>
            <h3 class="text-lg font-medium text-gray-200 mb-4">后端状态</h3>
            <div class="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <p class="text-sm text-gray-300">
                API 服务器已移至后端，无需在前端配置 API Key。
              </p>
              <p class="text-sm text-gray-400 mt-1">
                请确保后端服务器正在运行，并配置了相应的 API Key。
              </p>
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
          取消
        </button>
        <button
          @click="handleSave"
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