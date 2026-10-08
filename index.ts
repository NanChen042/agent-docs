import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

const ollama = createOpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

async function run() {
  const response = await generateText({
    // 使用 .chat 调用 Ollama 的 OpenAI 兼容 chat/completions 端点
    model: ollama.chat('qwen3.5:4b'),
    temperature: 0,
    // AI SDK 7.x 中使用 stopWhen 控制多步执行（替代旧版 maxSteps）
    stopWhen: stepCountIs(3),
    system: `你是一个智能计算助手。
规则：
1. 仅当用户明确提供了需要计算的两个具体数字时，才允许调用 add 工具。
2. 如果用户没有提供具体数字、数字不完整、或者在闲聊/开玩笑，严禁臆造或编造虚假数字参数调用工具！
3. 当缺少具体数字或处于闲聊状态时，直接用自然语言友好回答并引导用户提供具体的计算数值。`,
    tools: {
      add: tool({
        description: '计算两个数字相加。仅当用户明确给出了两个具体数值时才允许调用。',
        // AI SDK 7.x 规范使用 inputSchema（旧版 parameters 会被视为空定义）
        inputSchema: z.object({
          a: z.coerce.number().describe('第一个加数'),
          b: z.coerce.number().describe('第二个加数'),
        }),
        execute: async ({ a, b }) => {
          const sum = a + b;
          console.log(`[工具执行成功] ${a} + ${b} = ${sum}`);
          return sum;
        },
      }),
    },
    prompt: '调用 add 工具计算 45 + 55，然后告诉我最终答案是多少。',
  });

  // AI SDK 7.x 中工具返回结果保存在 output 字段
  const toolResult = response.toolResults[0]?.output;

  console.log('模型文本输出:', response.text || '(模型未生成文字)');
  console.log('Agent 计算结果:', toolResult);
}

run().catch(console.error);