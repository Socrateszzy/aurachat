<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { MODELS, PROVIDER_COLORS } from '../config/models'
import { ChevronDown, Check } from 'lucide-vue-next'

const store = useChatStore()
const isOpen = ref(false)

const currentModel = computed(() =>
  MODELS.find(m => m.id === store.selectedModelId) ?? MODELS[0]
)

function selectModel(id: string) {
  store.setModel(id)
  isOpen.value = false
}

// 点击外部关闭
function handleOutsideClick(e: MouseEvent) {
  if (!(e.target as Element).closest('.model-selector')) {
    isOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <div class="model-selector" style="position: relative;">
    <!-- 触发按钮：显示当前模型 -->
    <button class="model-trigger" @click.stop="isOpen = !isOpen">
      <span class="provider-dot" :style="{ background: PROVIDER_COLORS[currentModel.providerIcon] }"/>
      <span class="model-name">{{ currentModel.name }}</span>
      <ChevronDown :size="14" :style="{ transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }"/>
    </button>

    <!-- 下拉面板 -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="model-dropdown">
        <div class="dropdown-header">选择模型</div>

        <div v-for="model in MODELS" :key="model.id"
          class="model-item"
          :class="{ active: model.id === store.selectedModelId }"
          @click="selectModel(model.id)"
        >
          <div class="model-item-left">
            <span class="provider-dot" :style="{ background: PROVIDER_COLORS[model.providerIcon] }"/>
            <div>
              <div class="model-item-name">
                {{ model.name }}
                <span v-if="model.badge" class="model-badge" :class="model.badge">{{ model.badge }}</span>
              </div>
              <div class="model-item-desc">{{ model.description }}</div>
              <div class="model-tags">
                <span v-for="tag in model.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
          <Check v-if="model.id === store.selectedModelId" :size="14" class="check-icon"/>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.model-trigger {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; border-radius: 8px;
  background: var(--sidebar-item-active);
  border: 1px solid var(--input-border);
  color: var(--text-primary); font-size: 13px; cursor: pointer;
}
.model-trigger:hover { background: var(--card-hover-bg); }

.provider-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}

.model-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0;
  width: 320px; z-index: 100;
  background: var(--sidebar-bg);
  border: 1px solid var(--input-border);
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.dropdown-header {
  padding: 10px 14px 8px;
  font-size: 11px; font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 1px solid var(--sidebar-border);
}

.model-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; cursor: pointer; gap: 8px;
  border-bottom: 1px solid var(--sidebar-border);
}
.model-item:last-child { border-bottom: none; }
.model-item:hover { background: var(--sidebar-item-hover); }
.model-item.active { background: rgba(59,91,219,0.06); }

.model-item-left { display: flex; align-items: flex-start; gap: 10px; }
.model-item-name {
  font-size: 13px; font-weight: 500; color: var(--text-primary);
  display: flex; align-items: center; gap: 6px; margin-bottom: 2px;
}
.model-item-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 5px; }

.model-badge {
  font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 500;
}
.model-badge.推荐 { background: rgba(59,91,219,0.12); color: #4361ee; }
.model-badge.快速 { background: rgba(16,163,127,0.12); color: #0d9488; }
.model-badge.强大 { background: rgba(168,85,247,0.12); color: #9333ea; }

.model-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.tag {
  font-size: 10px; padding: 1px 6px; border-radius: 4px;
  background: var(--sidebar-item-active); color: var(--text-muted);
}

.check-icon { color: var(--accent); flex-shrink: 0; }

.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
</style>