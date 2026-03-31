import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { ModeKey } from '../services/deepseek'

export interface SessionMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Session {
  id: string
  title: string
  mode: ModeKey
  messages: SessionMessage[]
  createdAt: number
}

export const useChatStore = defineStore(
  'chat',
  () => {
    // state
    const sessions = ref<Session[]>([])
    const currentSessionId = ref<string | null>(null)
    const apiKey = ref<string>('')

    // computed
    const currentSession = computed(() => {
      return sessions.value.find(s => s.id === currentSessionId.value) || null
    })

    // actions
    function createSession(mode: ModeKey = 'general'): Session {
      const id = uuidv4()
      const now = Date.now()
      const session: Session = {
        id,
        title: '新对话',
        mode,
        messages: [],
        createdAt: now
      }
      sessions.value.push(session)
      currentSessionId.value = id
      return session
    }

    function deleteSession(id: string) {
      const index = sessions.value.findIndex(s => s.id === id)
      if (index === -1) return

      sessions.value.splice(index, 1)

      if (currentSessionId.value === id) {
        if (sessions.value.length > 0) {
          currentSessionId.value = sessions.value[sessions.value.length - 1].id
        } else {
          currentSessionId.value = null
        }
      }
    }

    function switchSession(id: string) {
      const session = sessions.value.find(s => s.id === id)
      if (session) {
        currentSessionId.value = id
      }
    }

    function addMessage(sessionId: string, msg: Omit<SessionMessage, 'id'>) {
      const session = sessions.value.find(s => s.id === sessionId)
      if (!session) return

      const message: SessionMessage = {
        id: uuidv4(),
        ...msg
      }
      session.messages.push(message)
    }

    function updateLastMessage(sessionId: string, content: string) {
      const session = sessions.value.find(s => s.id === sessionId)
      if (!session) return

      const messages = session.messages
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
          messages[i].content += content
          return
        }
      }

      // 如果没有找到 assistant 消息，创建一条新的
      addMessage(sessionId, {
        role: 'assistant',
        content,
        timestamp: Date.now()
      })
    }

    function updateSessionTitle(sessionId: string, title: string) {
      const session = sessions.value.find(s => s.id === sessionId)
      if (session) {
        session.title = title
      }
    }

    function setApiKey(key: string) {
      apiKey.value = key
    }

    return {
      sessions,
      currentSessionId,
      apiKey,
      currentSession,
      createSession,
      deleteSession,
      switchSession,
      addMessage,
      updateLastMessage,
      updateSessionTitle,
      setApiKey
    }
  },
  {
    persist: {
      key: 'aurachat',
      storage: localStorage,
      pick: ['sessions', 'currentSessionId', 'apiKey']
    }
  }
)

export function initStore() {
  const store = useChatStore()
  if (store.sessions.length === 0) {
    store.createSession()
  }
}