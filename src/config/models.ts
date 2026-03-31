export interface ModelInfo {
  id: string
  name: string          // 展示名
  provider: string      // 厂商名
  providerIcon: string  // 用于颜色标识的标识符
  description: string   // 一句话描述
  badge?: string        // 可选角标：'推荐' | '快速' | '强大'
  tags: string[]        // 能力标签
}

export const MODELS: ModelInfo[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    providerIcon: 'deepseek',
    description: '通用对话，中文能力出色，性价比极高',
    badge: '推荐',
    tags: ['通用', '中文', '长文本']
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    providerIcon: 'deepseek',
    description: '专为代码优化，支持多语言补全与调试',
    tags: ['代码', '调试', '补全']
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerIcon: 'openai',
    description: '多模态旗舰模型，推理与创作均衡优秀',
    badge: '强大',
    tags: ['多模态', '推理', '创作']
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    providerIcon: 'openai',
    description: '轻量快速版，日常任务响应迅速',
    badge: '快速',
    tags: ['快速', '轻量']
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    providerIcon: 'anthropic',
    description: '长文理解与写作润色表现顶尖',
    tags: ['写作', '分析', '长文本']
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    providerIcon: 'google',
    description: '超长上下文窗口，擅长文档分析',
    tags: ['长上下文', '文档', '多语言']
  }
]

export const DEFAULT_MODEL_ID = 'deepseek-chat'

/* 厂商对应的品牌色（用于 icon badge） */
export const PROVIDER_COLORS: Record<string, string> = {
  deepseek: '#4D6BFE',
  openai: '#10A37F',
  anthropic: '#D4A27F',
  google: '#4285F4'
}