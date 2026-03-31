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
  <div class="bg-[var(--topbar-bg)] border-b border-[var(--topbar-border)]">
    <div class="flex overflow-x-auto">
      <button
        v-for="[key, config] in Object.entries(MODES)"
        :key="key"
        @click="switchMode(key)"
        :class="[
          'flex items-center gap-2 px-6 py-4 transition-all flex-shrink-0 relative',
          currentMode === key
            ? 'text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        ]"
      >
        <component :is="modeIcons[key as keyof typeof modeIcons]" :size="18" />
        <span class="text-sm font-medium">{{ config.label }}</span>
        <div
          v-if="currentMode === key"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"
        ></div>
      </button>
    </div>
  </div>
</template>
