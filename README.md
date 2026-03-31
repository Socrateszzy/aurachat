# AuraChat - 智能聊天助手

基于 Vue 3 + TypeScript 构建的现代化聊天应用，支持多模型、多模式对话，通过后端代理调用 AI 服务。

## 功能特点

- **多模型支持**：DeepSeek、OpenAI、Claude、Gemini 等 6 种模型
- **多模式对话**：通用助手、代码助手、翻译、写作润色
- **流式响应**：实时显示 AI 生成内容，支持停止中断
- **会话管理**：多会话切换、搜索、删除，自动保存
- **Markdown 渲染**：代码高亮、格式美化
- **暗黑/亮色主题**：一键切换主题模式

## 快速开始

### 环境要求
- Node.js 18+
- npm / pnpm / yarn

### 安装运行

1. **安装依赖**
```bash
npm install
cd server && npm install && cd ..
```

2. **配置 API Key**
```bash
cp server/.env.example server/.env
```
编辑 `server/.env`，按需填入以下 Key：

| 模型 | 环境变量 |
|------|----------|
| DeepSeek Chat/Coder | `DEEPSEEK_API_KEY` |
| GPT-4o / GPT-4o mini | `OPENAI_API_KEY` |
| Claude 3.5 Sonnet | `ANTHROPIC_API_KEY` |
| Gemini 1.5 Pro | `GEMINI_API_KEY` |

3. **启动应用**
```bash
npm run dev:all
```

4. **访问**
打开浏览器访问：http://localhost:5173

## 使用说明

1. **选择对话模式**：顶栏左侧选择通用/代码/翻译/写作
2. **选择 AI 模型**：顶栏中部下拉菜单选择模型
3. **开始对话**：在底部输入框输入内容发送
4. **管理会话**：左侧边栏查看历史会话

## 开发命令

```bash
# 启动前端开发服务器
npm run dev

# 启动后端开发服务器
npm run server:dev

# 同时启动前后端
npm run dev:all

# 构建生产版本
npm run build

# 类型检查
vue-tsc -b
```

## 项目结构

```
aurachat/
├── src/                    # 前端源码
│   ├── components/        # Vue 组件
│   ├── stores/           # Pinia 状态管理
│   ├── services/         # API 服务
│   ├── composables/      # 组合式函数
│   └── config/           # 配置文件
├── server/               # 后端代理服务器
│   ├── index.js         # Express 服务器
│   └── .env.example     # 环境变量示例
└── package.json
```

## 技术栈

- **前端**: Vue 3, TypeScript, Vite, Tailwind CSS, Pinia
- **后端**: Node.js, Express
- **工具**: concurrently, lucide-vue-next, markdown-it, highlight.js

## 注意事项

- 所有 API Key 配置在后端，前端无敏感信息
- 对话历史存储在浏览器 localStorage
- 模型可用状态在关于页面实时显示
- 切换模型不影响当前对话历史
