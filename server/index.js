import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

/* 模型路由配置表 */
const MODEL_CONFIGS = {
  'deepseek-chat': {
    url: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: () => process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
    adapter: 'openai'
  },
  'deepseek-coder': {
    url: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: () => process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-coder',
    adapter: 'openai'
  },
  'gpt-4o': {
    url: 'https://api.openai.com/v1/chat/completions',
    apiKey: () => process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    adapter: 'openai'
  },
  'gpt-4o-mini': {
    url: 'https://api.openai.com/v1/chat/completions',
    apiKey: () => process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    adapter: 'openai'
  },
  'claude-3-5-sonnet': {
    url: 'https://api.anthropic.com/v1/messages',
    apiKey: () => process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20241022',
    adapter: 'anthropic'
  },
  'gemini-1-5-pro': {
    url: () => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?key=${process.env.GEMINI_API_KEY}&alt=sse`,
    model: 'gemini-1.5-pro',
    adapter: 'gemini'
  }
}

/* 健康检查 + 可用模型列表接口 */
app.get('/api/models', (req, res) => {
  const available = Object.entries(MODEL_CONFIGS).map(([id, cfg]) => ({
    id,
    available: !!cfg.apiKey?.()
  }))
  res.json({ models: available })
})

/* 统一流式聊天接口 */
app.post('/api/chat', async (req, res) => {
  const { modelId, messages } = req.body

  const config = MODEL_CONFIGS[modelId]
  if (!config) {
    return res.status(400).json({ error: `未知模型: ${modelId}` })
  }

  const apiKey = config.apiKey?.()
  if (!apiKey) {
    return res.status(503).json({ error: `模型 ${modelId} 暂不可用（后端未配置 API Key）` })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    let upstreamRes

    if (config.adapter === 'openai') {
      upstreamRes = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: config.model, messages, stream: true })
      })
    } else if (config.adapter === 'anthropic') {
      const systemMsg = messages.find(m => m.role === 'system')
      const chatMsgs = messages.filter(m => m.role !== 'system')
      upstreamRes = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 4096,
          system: systemMsg?.content,
          messages: chatMsgs,
          stream: true
        })
      })
    } else if (config.adapter === 'gemini') {
      const geminiMsgs = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
      upstreamRes = await fetch(typeof config.url === 'function' ? config.url() : config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: geminiMsgs })
      })
    }

    if (!upstreamRes.ok) {
      const err = await upstreamRes.text()
      res.write(`data: ${JSON.stringify({ error: err })}\n\n`)
      return res.end()
    }

    const reader = upstreamRes.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') { res.write('data: [DONE]\n\n'); continue }

        try {
          let text = ''
          const parsed = JSON.parse(data)

          if (config.adapter === 'openai') {
            text = parsed.choices?.[0]?.delta?.content || ''
          } else if (config.adapter === 'anthropic') {
            if (parsed.type === 'content_block_delta') text = parsed.delta?.text || ''
          } else if (config.adapter === 'gemini') {
            text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''
          }

          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
        } catch {}
      }
    }
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`AuraChat server running on http://localhost:${PORT}`))