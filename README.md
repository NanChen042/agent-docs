# 本地开源大模型 Agent 全栈实战 (agent-docs)

本项目是一套以本地开源大模型为底座、聚焦于 Agent 工具调用（Function Calling / Tool Calling）、流式传输（SSE）与前端组件化交互的全栈实战项目。

完全运行于本地离线环境，零第三方云端 API 成本。

---

## 技术架构

- **本地模型底座**：Ollama (`qwen3.5:4b`)
- **Agent 推理与编排**：Node.js + Vercel AI SDK 7.x (`ai`, `@ai-sdk/openai`) + Zod
- **通信与传输**：Node.js 原生 HTTP Server-Sent Events (SSE) 流式推流
- **前端交互界面**：Vue 3 + TypeScript + Vite，极简单文件组件（SFC）设计

---

## 快速上手

### 1. 启动本地大模型

确保本地已安装 [Ollama](https://ollama.com/) 并下载适配工具调用的轻量模型：

```bash
ollama run qwen3.5:4b
```

### 2. 安装项目依赖

```bash
pnpm install
```

### 3. 运行体验

- **终端极简 Agent**：
  ```bash
  pnpm start
  ```

- **终端流式 Agent**：
  ```bash
  pnpm stream
  ```

- **全栈 Web 界面模式**：
  - 构建前端并启动服务：
    ```bash
    pnpm build
    pnpm serve
    ```
  - 浏览器访问 `http://localhost:3000`

- **前端独立开发热更新模式**：
  ```bash
  pnpm dev
  ```

---

## 项目目录结构

```text
.
├── docs/                                    # 实战指南系列文档
│   ├── README.md                            # 章节总览与进度
│   ├── 01-本地Agent与Vue3流式全栈实战.md     # 第一章：基础全栈 Agent、避坑指南、Vue 3 极简流式交互
│   └── 02-多工具协同与复杂任务链.md         # 第二章：多工具协同与复杂任务链（待开始）
├── src/                                     # 前端 Vue 3 源码
│   ├── components/                          # 表现层组件
│   │   ├── ChatInput.vue                    # 输入与操作栏
│   │   ├── ChatMessage.vue                  # 消息气泡与打字机光标
│   │   └── ToolBadge.vue                    # 工具执行状态卡片
│   ├── composables/                         # 逻辑复用层
│   │   └── useStreamChat.ts                 # 原生 Fetch + SSE 流式解析 Hook
│   ├── types/                               # TypeScript 类型定义
│   │   └── chat.ts
│   ├── App.vue                              # 根组件
│   └── main.ts                              # 前端入口
├── index.html                               # HTML 入口
├── index.ts                                 # 基础终端 Agent
├── stream.ts                                # 终端流式 Agent
├── server.ts                                # 原生 SSE 后端服务
├── vite.config.mts                          # Vite 配置与反向代理
├── package.json
└── README.md
```

---

## 实战指南文档列表

| 章节 | 核心内容 | 文档链接 | 状态 |
| :---: | :--- | :---: | :---: |
| **第一章** | 本地模型接入、AI SDK 7.x 避坑、防范参数捏造、Node SSE 推流、Vue 3 极简组件化 | [阅读第一章](./docs/01-本地Agent与Vue3流式全栈实战.md) | 已完结 |
| **第二章** | 多工具动态注册、大模型路由决策（Tool Selection）、多步接力任务链 | [阅读第二章](./docs/02-多工具协同与复杂任务链.md) | 待开始 |
| **更多章节** | 本地文件助手与代码沙箱、多轮会话记忆、本地知识库 RAG 等 | [查看专栏总览](./docs/README.md) | 规划中 |
