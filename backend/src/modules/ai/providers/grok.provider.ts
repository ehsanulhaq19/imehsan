import { Injectable, Logger } from '@nestjs/common';
import { AiChatMessage, AiProvider } from './ai-provider.interface';

@Injectable()
export class GrokAiProvider implements AiProvider {
  readonly name = 'grok';
  private readonly logger = new Logger(GrokAiProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly temperature: number,
    private readonly maxTokens: number,
  ) {}

  async complete(messages: AiChatMessage[]): Promise<string> {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      this.logger.warn(`Grok error ${res.status}: ${text}`);
      throw new Error('AI provider error');
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || '';
  }
}
