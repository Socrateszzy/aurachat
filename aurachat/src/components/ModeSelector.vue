<script setup lang="ts">
import { computed } from 'vue'
import { MessageCircle, Code2, Languages, PenLine } from 'lucide-vue-next'
import { MODES, type ModeKey } from '../services/deepseek'
import { useChatStore } from '../stores/chat'

const store = useChatStore()

// 图标映射
const modeIcons = {
  general: MessageCircle,
  code: Code2,
  translate: Languages,
  writing: PenLine
}

// 当前会话的模式
const currentMode = computed(() => {
  return store.currentSession?.mode || 'general'
})

// 切换模式
function switchMode(mode: string) {
  const session = store.currentSession
  if (session && session.mode !== mode) {
    session.mode = mode as ModeKey
  }
}
</script>

<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-2">
    <div class="text-sm text-gray-400 mr-2 flex-shrink-0">模式:</div>
    <div class="flex gap-1">
      <button
        v-for="[key, config] in Object.entries(MODES)"
        :key="key"
        @click="switchMode(key)"
        :class="[
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0',
          currentMode === key
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        ]"
      >
        <component :is="modeIcons[key as keyof typeof modeIcons]" :size="16" />
        <span class="text-sm">{{ config.label }}</span>
      </button>
    </div>
  </div>
</template>
