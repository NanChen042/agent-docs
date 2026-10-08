export interface ToolCall {
  name: string;
  input: Record<string, any>;
  status: 'running' | 'done';
  output?: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tools?: ToolCall[];
  isStreaming?: boolean;
}
