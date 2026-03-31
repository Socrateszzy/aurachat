<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, ExternalLink, CheckCircle, XCircle } from 'lucide-vue-next'
import { MODELS, PROVIDER_COLORS } from '../config/models'

interface ModelStatus {
  id: string
  available: boolean
}

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const modelStatus = ref<ModelStatus[]>([])
const isLoading = ref(true)

// 获取模型可用状态
async function fetchModelStatus() {
  try {
    const response = await fetch('http://localhost:3001/api/models')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    modelStatus.value = data.models || []
  } catch (error) {
    console.error('Failed to fetch model status:', error)
    // 如果失败，默认全部不可用
    modelStatus.value = MODELS.map(model => ({ id: model.id, available: false }))
  } finally {
    isLoading.value = false
  }
}

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
    emit('close')
  }
}

onMounted(() => {
  fetchModelStatus()
})
</script>

<template>
  <div
    class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    @click="handleBackdropClick"
  >
    <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <div>
          <h2 class="text-xl font-bold text-gray-100">AuraChat</h2>
          <p class="text-sm text-gray-400 mt-1">版本 v1.0.0</p>
        </div>
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
          <!-- 说明文字 -->
          <div>
            <p class="text-sm text-gray-300 leading-relaxed">
              当前模型由服务端统一配置，无需手动填写 API Key。
              在 <code class="bg-gray-900 px-1.5 py-0.5 rounded text-gray-200">server/.env</code> 中配置各平台密钥后重启服务即可启用对应模型。
            </p>
          </div>

          <!-- 模型状态 -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <h3 class="text-lg font-medium text-gray-200">模型可用状态</h3>
              <span class="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                后端: localhost:3001
              </span>
            </div>
            
            <div v-if="isLoading" class="text-center py-4">
              <div class="animate-spin w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-2"></div>
              <p class="text-sm text-gray-400">正在查询模型状态...</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="model in MODELS" 
                :key="model.id"
                class="p-3 bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <span 
                    class="w-3 h-3 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: PROVIDER_COLORS[model.providerIcon] }"
                  />
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-100">{{ model.name }}</span>
                      <span 
                        v-if="model.badge" 
                        class="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300"
                      >
                        {{ model.badge }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">{{ model.description }}</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <div v-if="modelStatus.find(m => m.id === model.id)?.available" class="flex items-center gap-1 text-green-400">
                    <CheckCircle :size="14" />
                    <span class="text-xs">可用</span>
                  </div>
                  <div v-else class="flex items-center gap-1 text-gray-400">
                    <XCircle :size="14" />
                    <span class="text-xs">不可用</span>
                  </div>
                </div>
              </div>
              
              <!-- 统计信息 -->
              <div class="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-300">总模型</span>
                  <span class="font-medium text-gray-100">{{ MODELS.length }}</span>
                </div>
                <div class="flex items-center justify-between text-sm mt-1">
                  <span class="text-gray-300">可用模型</span>
                  <span class="font-medium text-green-400">
                    {{ modelStatus.filter(m => m.available).length }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- GitHub 链接 -->
          <div>
            <div class="p-4 bg-gray-900/30 rounded-lg border border-gray-700">
              <h4 class="text-sm font-medium text-gray-300 mb-2">项目信息</h4>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <ExternalLink :size="14" />
                  <span>GitHub: </span>
                  <span class="text-gray-300">coming soon</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <span>后端服务: </span>
                  <span class="text-gray-300">Node.js Express</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <span>前端框架: </span>
                  <span class="text-gray-300">Vue 3 + TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-6 border-t border-gray-700 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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

code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}
</style>