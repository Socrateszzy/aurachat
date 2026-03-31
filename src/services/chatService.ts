export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type ModeKey = 'general' | 'code' | 'translate' | 'writing'

export interface ModeConfig {
  label: string
  icon: string
  systemPrompt: string
}

export const MODES: Record<ModeKey, ModeConfig> = {
  general: {
    label: '通用助手',
    icon: 'MessageCircle',
    systemPrompt: '你是一个有帮助的AI助手，回答简洁准确'
  },
  code: {
    label: '代码助手',
    icon: 'Code2',
    systemPrompt: '你是一个专业的编程助手，擅长代码审查、调试和解释，代码用markdown代码块格式输出'
  },
  translate: {
    label: '翻译',
    icon: 'Languages',
    systemPrompt: '你是专业翻译，在中文和英文之间互译，只输出译文不加解释'
  },
  writing: {
    label: '写作润色',
    icon: 'PenLine',
    systemPrompt: '你是写作专家，帮助润色和改进文章，保持原作者风格'
  }
}

export async function streamChat(
  messages: ChatMessage[],
  mode: ModeKey,
  modelId: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (e: Error) => void,
  signal?: AbortSignal
) {
  // 在首部插入 system prompt
  const systemPrompt = MODES[mode]?.systemPrompt
  const fullMessages: ChatMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages

  let res: Response
  try {
    res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId, messages: fullMessages }),
      signal
    })
  } catch (e: any) {
    if (e.name === 'AbortError') return
    return onError(new Error('无法连接到后端服务，请确认 server 已启动'))
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    return onError(new Error(err.error || '请求失败'))
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()!

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') { onDone(); return }
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) return onError(new Error(parsed.error))
          if (parsed.text) onChunk(parsed.text)
        } catch {}
      }
    }
    onDone()
  } catch (e: any) {
    if (e.name !== 'AbortError') onError(e)
  }
}