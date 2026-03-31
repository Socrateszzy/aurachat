<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Menu } from 'lucide-vue-next'
import Sidebar from './components/Sidebar.vue'
import ModeSelector from './components/ModeSelector.vue'
import MessageList from './components/MessageList.vue'
import ChatInput from './components/ChatInput.vue'
import { initStore } from './stores/chat'

const isSidebarOpen = ref(false)

onMounted(() => {
  initStore()
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
    <!-- 移动端汉堡菜单 -->
    <button
      @click="isSidebarOpen = !isSidebarOpen"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <Menu :size="20" />
    </button>

    <!-- 侧边栏 -->
    <div
      :class="[
        'fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <Sidebar />
    </div>

    <!-- 侧边栏遮罩 -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
    ></div>

    <!-- 主内容区域 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部模式选择器 -->
      <div class="p-4 border-b border-gray-800">
        <ModeSelector />
      </div>

      <!-- 消息列表 -->
      <div class="flex-1 overflow-hidden">
        <MessageList />
      </div>

      <!-- 输入框 -->
      <div class="p-4 border-t border-gray-800">
        <ChatInput />
      </div>
    </div>
  </div>
</template>

<style>
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
