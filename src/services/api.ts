import type { ChatMessage } from './chatService'

export interface StreamResponse {
  text?: string
  error?: string
}

export async function streamChat(
  messages: ChatMessage[],
  modelId: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (e: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId,
        messages
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
            const parsed = JSON.parse(data) as StreamResponse
            
            if (parsed.error) {
              throw new Error(parsed.error)
            }
            
            if (parsed.text) {
              onChunk(parsed.text)
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

// 获取可用模型列表
export async function fetchAvailableModels(): Promise<{
  models: Array<{ id: string, available: boolean }>
}> {
  const response = await fetch('http://localhost:3001/api/models')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}