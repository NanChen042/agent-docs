import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

const ollama = createOpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

const server = createServer(async (req, res) => {
  // 跨域支持
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 静态页面：优先读取 Vite build 后的产物
  const distDir = resolve(__dirname, 'dist');
  if (req.url === '/' && req.method === 'GET') {
    const indexPath = resolve(distDir, 'index.html');
    if (existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(readFileSync(indexPath, 'utf-8'));
      return;
    }
  }

  // 静态资源文件（/assets/...）
  if (req.url?.startsWith('/assets/') && req.method === 'GET') {
    const assetPath = resolve(distDir, '.' + req.url);
    if (existsSync(assetPath)) {
      const isCss = assetPath.endsWith('.css');
      const isJs = assetPath.endsWith('.js');
      const contentType = isCss ? 'text/css' : isJs ? 'application/javascript' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(readFileSync(assetPath));
      return;
    }
  }

  // 流式对话接口
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { prompt } = JSON.parse(body || '{}');

        // 设置 SSE 响应头
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        });

        const result = streamText({
          model: ollama.chat('qwen3.5:4b'),
          temperature: 0,
          stopWhen: stepCountIs(3),
          system: `你是一个智能计算助手。
规则：
1. 仅当用户明确提供了需要计算的两个具体数字时，才允许调用 add 工具。
2. 如果用户没有提供具体数字、数字不完整、或者在闲聊/开玩笑（例如"调用 add 工具我是一个大帅比"），严禁臆造或编造虚假数字参数调用工具！
3. 当缺少具体数字或处于闲聊状态时，直接用自然语言友好回答并引导用户提供具体的计算数值。`,
          tools: {
            add: tool({
              description: '计算两个数字相加。仅当用户明确给出了两个具体数值时才允许调用。',
              inputSchema: z.object({
                a: z.coerce.number().describe('第一个加数'),
                b: z.coerce.number().describe('第二个加数'),
              }),
              execute: async ({ a, b }) => {
                const sum = a + b;
                return sum;
              },
            }),
          },
          prompt: prompt || '调用 add 工具计算 45 + 55，然后告诉我最终答案是多少。',
        });

        // 将 fullStream 事件推送到前端
        for await (const part of result.fullStream) {
          if (part.type === 'tool-call') {
            res.write(`data: ${JSON.stringify({ type: 'tool-call', name: part.toolName, input: part.input })}\n\n`);
          } else if (part.type === 'tool-result') {
            res.write(`data: ${JSON.stringify({ type: 'tool-result', name: part.toolName, output: part.output })}\n\n`);
          } else if (part.type === 'text-delta') {
            res.write(`data: ${JSON.stringify({ type: 'text-delta', text: part.text })}\n\n`);
          }
        }

        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err: any) {
        console.error('Server error:', err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
        res.end();
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
