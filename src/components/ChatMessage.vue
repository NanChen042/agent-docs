<script setup lang="ts">
import type { Message } from '../types/chat';
import ToolBadge from './ToolBadge.vue';

defineProps<{
  message: Message;
}>();
</script>

<template>
  <div :class="['message-row', message.role]">
    <div class="message-content">
      <!-- 渲染工具调用记录 -->
      <div v-if="message.tools && message.tools.length > 0" class="tool-list">
        <ToolBadge
          v-for="(tool, index) in message.tools"
          :key="index"
          :tool="tool"
        />
      </div>

      <!-- 渲染正文文本 -->
      <div v-if="message.content || message.isStreaming" class="bubble">
        {{ message.content }}
        <span v-if="message.isStreaming" class="typing-cursor"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-row {
  display: flex;
  margin-bottom: 1.25rem;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 82%;
  display: flex;
  flex-direction: column;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.4rem;
}

.bubble {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.92rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.user .bubble {
  background: #2563eb;
  color: #ffffff;
  border-bottom-right-radius: 2px;
}

.assistant .bubble {
  background: #f1f5f9;
  color: #0f172a;
  border-bottom-left-radius: 2px;
}

@media (prefers-color-scheme: dark) {
  .assistant .bubble {
    background: #1e293b;
    color: #f1f5f9;
    border: 1px solid #334155;
  }
}

.typing-cursor {
  display: inline-block;
  width: 4px;
  height: 14px;
  background: currentColor;
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 0.9s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
