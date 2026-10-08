<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useStreamChat } from './composables/useStreamChat';
import ChatMessage from './components/ChatMessage.vue';
import ChatInput from './components/ChatInput.vue';

const { messages, isStreaming, sendMessage, stopGeneration } = useStreamChat();
const chatContainerRef = ref<HTMLDivElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
  }
};

watch(
  () => messages.value.map((m) => m.content + JSON.stringify(m.tools)),
  () => {
    scrollToBottom();
  },
  { deep: true }
);

const suggestions = [
  '调用 add 工具计算 45 + 55',
  '计算 1024 + 2048 的和',
  '计算 9999 + 1 等于几',
];
</script>

<template>
  <div class="app-layout">
    <!-- 极简顶栏 -->
    <header class="app-header">
      <div class="logo">
        <span class="status-pulse"></span>
        <span class="title">Agent Chat</span>
      </div>
      <div class="model-tag">qwen3.5:4b</div>
    </header>

    <!-- 消息对话流 -->
    <main class="message-feed" ref="chatContainerRef">
      <div class="feed-inner">
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
        />
      </div>
    </main>

    <!-- 底部控制区 -->
    <footer class="app-footer">
      <div class="footer-inner">
        <!-- 极简快捷指令标签 -->
        <div v-if="!isStreaming" class="quick-tags">
          <button
            v-for="sug in suggestions"
            :key="sug"
            class="tag-btn"
            @click="sendMessage(sug)"
          >
            {{ sug }}
          </button>
        </div>

        <!-- 规范化输入组件 -->
        <ChatInput
          :disabled="isStreaming"
          :is-streaming="isStreaming"
          @send="sendMessage"
          @stop="stopGeneration"
        />
      </div>
    </footer>
  </div>
</template>

<style>
/* 全局基础重置 */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  background-color: #fafafa;
  color: #18181b;
  -webkit-font-smoothing: antialiased;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #09090b;
    color: #f4f4f5;
  }
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 760px;
  margin: 0 auto;
}

.app-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid #e4e4e7;
}

@media (prefers-color-scheme: dark) {
  .app-header {
    border-color: #27272a;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #10b981;
}

.title {
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.model-tag {
  font-size: 0.75rem;
  color: #71717a;
  background: #f4f4f5;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .model-tag {
    background: #18181b;
    color: #a1a1aa;
  }
}

.message-feed {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1rem;
}

.feed-inner {
  display: flex;
  flex-direction: column;
}

.app-footer {
  padding: 0.75rem 1rem 1.25rem;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-tags {
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.tag-btn {
  background: transparent;
  border: 1px solid #e4e4e7;
  color: #71717a;
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

@media (prefers-color-scheme: dark) {
  .tag-btn {
    border-color: #27272a;
    color: #a1a1aa;
  }
}

.tag-btn:hover {
  border-color: #a1a1aa;
  color: #18181b;
}

@media (prefers-color-scheme: dark) {
  .tag-btn:hover {
    color: #f4f4f5;
  }
}
</style>
