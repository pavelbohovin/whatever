/**
 * OpenAI-compatible LLM provider
 * Keys stored securely; never logged. Use Keychain/encrypted storage in production.
 */

import type { LLMProvider, Message, ChatResponse } from './types';

export function createOpenAIProvider(apiKey: string, baseUrl = 'https://api.openai.com/v1'): LLMProvider {
  return {
    async chatCompletion(messages: Message[]): Promise<ChatResponse> {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 1024,
        }),
      });
      if (!res.ok) throw new Error(`LLM API error: ${res.status}`);
      const json = await res.json();
      const choice = json.choices?.[0];
      return {
        content: choice?.message?.content ?? '',
        usage: json.usage,
      };
    },

    async structuredCompletion<T = Record<string, unknown>>(
      prompt: string,
      _schema: Record<string, unknown>
    ): Promise<T> {
      const systemPrompt = 'Reply with valid JSON only. No markdown, no explanation.';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1024,
        }),
      });
      if (!res.ok) throw new Error(`LLM API error: ${res.status}`);
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content ?? '{}';
      try {
        return JSON.parse(content) as T;
      } catch {
        throw new Error('Invalid JSON from LLM');
      }
    },
  };
}
