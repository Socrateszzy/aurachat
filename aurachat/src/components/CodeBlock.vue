<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{
  code: string
  language?: string
}>()

const copied = ref(false)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div class="relative group">
    <!-- 代码块语言标签 -->
    <div class="flex items-center justify-between mb-2">
      <div class="text-xs text-gray-400 font-mono">
        {{ language || 'txt' }}
      </div>
      <button
        @click="copyToClipboard"
        class="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded transition-colors"
        :title="copied ? '已复制' : '复制代码'"
      >
        <Check v-if="copied" :size="12" class="text-green-400" />
        <Copy v-else :size="12" />
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>

    <!-- 代码内容 -->
    <div class="relative">
      <pre class="bg-[#1a1a2e] rounded-lg p-4 overflow-x-auto text-sm font-mono"><code>{{ code }}</code></pre>
      
      <!-- 悬停遮罩 -->
      <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
    </div>
  </div>
</template>