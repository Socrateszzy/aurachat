# AuraChat - 智能聊天助手

AuraChat 是一个基于 Vue 3 + TypeScript + DeepSeek API 构建的现代化聊天应用，支持流式响应、多模式对话、Markdown渲染和代码高亮。

## 功能特性

### 🤖 智能对话
- **多模式支持**：通用助手、代码助手、翻译、写作润色
- **流式响应**：实时显示AI生成内容，支持停止中断
- **上下文记忆**：自动维护对话历史，支持多轮对话

### 💬 交互体验
- **Markdown渲染**：支持代码块、列表、表格、引用等格式
- **代码高亮**：自动识别代码语言，支持语法高亮
- **实时预览**：流式光标动画，清晰展示生成状态

### 📁 会话管理
- **多会话支持**：创建、切换、删除不同对话
- **自动保存**：使用Pinia持久化插件，刷新页面不丢失
- **快捷提示**：内置常用对话模板，一键发送

### 🔧 实用工具
- **对话导出**：导出当前对话为Markdown格式文件
- **对话清空**：一键清空当前对话（需二次确认）
- **设置管理**：安全保存API Key配置

## 技术栈

### 前端框架
- **Vue 3** - Composition API + `<script setup>`
- **TypeScript** - 类型安全
- **Vite** - 极速构建工具

### UI & 样式
- **Tailwind CSS** - 实用优先的CSS框架
- **Lucide Vue** - 精致图标库
- **Transition** - Vue过渡动画

### 状态管理
- **Pinia** - Vue官方状态管理
- **pinia-plugin-persistedstate** - 状态持久化

### 功能库
- **markdown-it** + **highlight.js** - Markdown渲染与代码高亮
- **uuid** - 唯一ID生成
- **DeepSeek API** - AI聊天接口

## 快速开始

### 环境要求
- Node.js 18+ 或更高版本
- npm 或 yarn 或 pnpm

### 本地运行

1. **克隆项目**
```bash
git clone https://github.com/yourusername/aurachat.git
cd aurachat
```

2. **安装依赖**
```bash
npm install
```

3. **获取API Key**
   - 访问 [DeepSeek 官网](https://platform.deepseek.com/) 注册账号
   - 在个人中心创建API Key

4. **配置API Key**
   - 启动应用：`npm run dev`
   - 打开 http://localhost:5173
   - 点击左侧边栏底部"设置"按钮
   - 输入您的DeepSeek API Key并保存

5. **开始使用**
   - 选择对话模式（通用助手/代码助手/翻译/写作润色）
   - 输入消息开始对话
   - 使用快捷提示快速发起常用对话

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run type-check
```

## 部署

### Vercel 部署（推荐）

1. 将项目推送到GitHub仓库
2. 访问 [Vercel](https://vercel.com) 并导入项目
3. 配置构建设置：
   - **Framework Preset**: Vite
   - **Build Command**: npm run build
   - **Output Directory**: dist
4. 点击部署，等待完成

### Netlify 部署

1. 将项目推送到GitHub仓库
2. 访问 [Netlify](https://netlify.com) 并导入项目
3. 配置构建设置：
   - **Build command**: npm run build
   - **Publish directory**: dist
4. 点击部署

### 静态文件部署

1. 构建项目：
```bash
npm run build
```

2. 将 `dist` 目录下的所有文件上传到静态托管服务（GitHub Pages、Cloudflare Pages等）

## 项目结构

```
src/
├── components/           # Vue组件
│   ├── ChatHeader.vue   # 对话顶部工具栏
│   ├── ChatInput.vue    # 输入框组件
│   ├── MessageList.vue  # 消息列表组件
│   ├── Sidebar.vue      # 侧边栏组件
│   ├── ModeSelector.vue # 模式选择器
│   ├── SettingsModal.vue# 设置弹窗
│   └── CodeBlock.vue    # 代码块组件
├── composables/         # 组合式函数
│   └── useChat.ts      # 聊天逻辑封装
├── stores/             # 状态管理
│   └── chat.ts         # 聊天状态存储
├── services/           # API服务
│   └── deepseek.ts     # DeepSeek API封装
├── assets/             # 静态资源
│   └── main.css        # 全局样式
├── App.vue             # 根组件
└── main.ts             # 应用入口
```

## 配置说明

### API 配置
项目使用DeepSeek API作为后端服务：
- 模型：deepseek-chat
- 端点：https://api.deepseek.com/v1/chat/completions
- 支持流式响应

### 模式配置
每种对话模式都有专用的系统提示词：
- **通用助手**：常规问题解答
- **代码助手**：代码生成与调试，输出代码块
- **翻译**：中英文互译，只输出译文
- **写作润色**：文章润色与风格优化

## 注意事项

1. **API Key安全**：API Key仅在浏览器本地存储，不会发送到第三方服务器
2. **使用限制**：请遵守DeepSeek API的使用条款和频率限制
3. **本地存储**：所有对话历史存储在浏览器localStorage中
4. **浏览器兼容**：推荐使用Chrome、Firefox、Edge等现代浏览器