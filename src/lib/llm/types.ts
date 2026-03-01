/**
 * LLM provider abstraction — provider-agnostic interface
 * @see docs/ARCHITECTURE.md
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Tool {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface ChatResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface LLMProvider {
  chatCompletion(messages: Message[], tools?: Tool[]): Promise<ChatResponse>;
  structuredCompletion<T = Record<string, unknown>>(
    prompt: string,
    schema: Record<string, unknown>
  ): Promise<T>;
}
