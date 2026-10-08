<script setup lang="ts">
import type { ToolCall } from '../types/chat';

defineProps<{
  tool: ToolCall;
}>();
</script>

<template>
  <div :class="['tool-badge', tool.status]">
    <div class="tool-header">
      <span class="indicator"></span>
      <span class="tool-name">tool: {{ tool.name }}</span>
      <span class="tool-status">{{ tool.status === 'running' ? 'running' : 'done' }}</span>
    </div>
    <div class="tool-details">
      <span class="param-label">input:</span>
      <code>{{ JSON.stringify(tool.input) }}</code>
      <template v-if="tool.status === 'done'">
        <span class="divider">→</span>
        <span class="param-label">output:</span>
        <code class="output">{{ tool.output }}</code>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tool-badge {
  font-size: 0.78rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  border-radius: 6px;
  padding: 0.45rem 0.65rem;
  margin-bottom: 0.35rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (prefers-color-scheme: dark) {
  .tool-badge {
    background: #18181b;
    border-color: #27272a;
    color: #a1a1aa;
  }
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

.running .indicator {
  background: #2563eb;
  animation: pulse 1.5s infinite;
}

.done .indicator {
  background: #10b981;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.tool-name {
  font-weight: 600;
  color: #1e293b;
}

@media (prefers-color-scheme: dark) {
  .tool-name {
    color: #f4f4f5;
  }
}

.tool-status {
  margin-left: auto;
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
}

.tool-details {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.param-label {
  color: #94a3b8;
}

code {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

@media (prefers-color-scheme: dark) {
  code {
    background: rgba(255, 255, 255, 0.08);
  }
}

.output {
  color: #059669;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .output {
    color: #34d399;
  }
}

.divider {
  color: #cbd5e1;
}
</style>
