import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

const ollama = createOpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

async function run() {
  console.log('[Agent 启动] 正在启动流式对话...\n');

  const result = streamText({
    model: ollama.chat('qwen3.5:4b'),
    temperature: 0,
    stopWhen: stepCountIs(3),
    system: `你是一个智能计算助手。
规则：
1. 仅当用户明确提供了需要计算的两个具体数字时，才允许调用 add 工具。
2. 如果用户没有提供具体数字、数字不完整、或者在闲聊/开玩笑，严禁臆造或编造虚假数字参数调用工具！
3. 当缺少具体数字或处于闲聊状态时，直接用自然语言友好回答并引导用户提供具体的计算数值。`,
    tools: {
      add: tool({
        description: '计算两个数字相加。仅当用户明确给出了两个具体数值时才允许调用。',
        inputSchema: z.object({
          a: z.coerce.number().describe('第一个加数'),
          b: z.coerce.number().describe('第二个加数'),
        }),
        execute: async ({ a, b }) => {
          console.log(`\n[工具执行] ${a} + ${b} ...`);
          const sum = a + b;
          console.log(`[工具结果] 计算完成: ${sum}\n`);
          return sum;
        },
      }),
    },
    prompt: '调用 add 工具计算 45 + 55，然后告诉我最终答案是多少。',
  });

  // 实时捕获完整的流式生命周期事件
  for await (const part of result.fullStream) {
    switch (part.type) {
      case 'tool-call':
        console.log(`[Agent 触发工具调用] 工具名: ${part.toolName}, 传入参数:`, part.input);
        break;
      case 'tool-result':
        console.log(`[工具返回结果] 工具名: ${part.toolName}, 返回值:`, part.output);
        break;
      case 'text-delta':
        // 实时打字机输出模型文本
        process.stdout.write(part.text);
        break;
      case 'error':
        console.error('\n[流式错误]:', part.error);
        break;
    }
  }

  console.log('\n\n[流式交互结束]');
}

run().catch(console.error);
