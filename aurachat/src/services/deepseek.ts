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
  apiKey: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (e: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const modeConfig = MODES[mode]
    const systemMessage: ChatMessage = {
      role: 'system',
      content: modeConfig.systemPrompt
    }

    const messagesWithSystem = [systemMessage, ...messages]

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messagesWithSystem,
        stream: true
      }),
      signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onDone()
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)

          if (data === '[DONE]') {
            onDone()
            return
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              onChunk(content)
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }
    onError(error instanceof Error ? error : new Error(String(error)))
  }
}