<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  disabled?: boolean;
  isStreaming?: boolean;
}>();

const emit = defineEmits<{
  (e: 'send', text: string): void;
  (e: 'stop'): void;
}>();

const text = ref('');

const handleSubmit = () => {
  const content = text.value.trim();
  if (!content || props.disabled) return;
  text.value = '';
  emit('send', content);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
};
</script>

<template>
  <div class="input-wrapper">
    <textarea v-model="text" placeholder="输入指令或提问... (回车发送，Shift + 回车换行)" :disabled="disabled" @keydown="handleKeydown" rows="1"></textarea>

    <div class="actions">
      <button v-if="!isStreaming" class="btn send-btn" :disabled="!text.trim() || disabled" @click="handleSubmit">
        发送
      </button>
      <button v-else class="btn stop-btn" @click="emit('stop')">
        停止
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}

@media (prefers-color-scheme: dark) {
  .input-wrapper {
    background: #18181b;
    border-color: #27272a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}

.input-wrapper:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

textarea {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 0.92rem;
  color: inherit;
  line-height: 1.5;
  min-height: 24px;
  max-height: 120px;
}

textarea::placeholder {
  color: #94a3b8;
}

.actions {
  display: flex;
  align-items: center;
}

.btn {
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  transition: opacity 0.15s, background-color 0.15s;
}

.send-btn {
  background: #2563eb;
  color: #ffffff;
}

.send-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stop-btn {
  background: #ef4444;
  color: #ffffff;
}

.stop-btn:hover {
  background: #dc2626;
}
</style>
