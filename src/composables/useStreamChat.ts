import { ref, reactive } from 'vue';
import type { Message } from '../types/chat';

export function useStreamChat() {
  const isStreaming = ref(false);
  const messages = ref<Message[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: '你好，我是本地 Agent 助手。请直接输入问题，或让我调用工具计算。',
      tools: [],
      isStreaming: false,
    },
  ]);

  let abortController: AbortController | null = null;

  const sendMessage = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt || isStreaming.value) return;

    // 1. 推入用户提问
    messages.value.push({
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      tools: [],
    });

    // 2. 初始化助手待回复消息（必须使用 reactive 确保深层属性修改触发响应式更新）
    const assistantMsg = reactive<Message>({
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      tools: [],
      isStreaming: true,
    });
    messages.value.push(assistantMsg);
    isStreaming.value = true;

    abortController = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`服务异常 (${response.status})`);
      }
      if (!response.body) {
        throw new Error('浏览器不支持数据流读取');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // 按换行符精确分割，兼容 \r\n 和 \n
        const lines = buffer.split(/\r?\n/);
        // 最后一个可能是未接收完整的片段，保留在 buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;

          try {
            const event = JSON.parse(payload);
            if (event.type === 'tool-call') {
              assistantMsg.tools?.push({
                name: event.name,
                input: event.input,
                status: 'running',
              });
            } else if (event.type === 'tool-result') {
              const currentTool = assistantMsg.tools?.find((t) => t.name === event.name);
              if (currentTool) {
                currentTool.status = 'done';
                currentTool.output = event.output;
              }
            } else if (event.type === 'text-delta') {
              // 响应式代理生效，实时触发 Vue 视图渲染
              assistantMsg.content += event.text;
            } else if (event.type === 'error') {
              assistantMsg.content += `\n[错误: ${event.error}]`;
            }
          } catch {
            // 忽略未完整的 JSON 片段
          }
        }
      }

      // 处理 buffer 中最后残留的一行
      if (buffer.trim().startsWith('data:')) {
        const payload = buffer.trim().slice(5).trim();
        if (payload && payload !== '[DONE]') {
          try {
            const event = JSON.parse(payload);
            if (event.type === 'text-delta') {
              assistantMsg.content += event.text;
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        assistantMsg.content += '\n[已中止生成]';
      } else {
        assistantMsg.content += `\n[请求异常]: ${err.message}`;
      }
    } finally {
      assistantMsg.isStreaming = false;
      isStreaming.value = false;
      abortController = null;
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  return {
    messages,
    isStreaming,
    sendMessage,
    stopGeneration,
  };
}
