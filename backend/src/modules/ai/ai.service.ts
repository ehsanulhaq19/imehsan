import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiWidgetConfig } from '../../database/entities/ai-widget-config.entity';
import { WIDGET_SYSTEM_FALLBACK } from './prompts/widget.prompts';
import { AiChatMessage } from './providers/ai-provider.interface';
import { GrokAiProvider } from './providers/grok.provider';
import { AiRepository } from './ai.repository';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly repo: AiRepository,
    private readonly config: ConfigService,
  ) {}

  private async providerFromConfig() {
    const cfg = await this.repo.getOrCreateConfig();
    const key =
      cfg.apiKey?.trim() ||
      this.config.get<string>('GROK_API_KEY')?.trim() ||
      '';
    if (!key) {
      throw new ServiceUnavailableException('AI API key not configured');
    }
    const model = cfg.model || 'grok-2-latest';
    return new GrokAiProvider(key, model, cfg.temperature, cfg.maxTokens);
  }

  async chat(payload: {
    guestSessionId: string;
    guestName?: string;
    guestEmail?: string;
    message: string;
  }) {
    const cfg = await this.repo.getOrCreateConfig();
    const conversation = await this.repo.getOrCreateConversation(
      payload.guestSessionId,
      payload.guestName,
      payload.guestEmail,
    );
    await this.repo.addMessage(conversation.id, 'user', payload.message);
    const history = await this.repo.listMessages(conversation.id);
    const messages: AiChatMessage[] = [
      {
        role: 'system',
        content: cfg.systemPrompt?.trim() || WIDGET_SYSTEM_FALLBACK,
      },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];
    const provider = await this.providerFromConfig();
    try {
      const reply = await provider.complete(messages);
      await this.repo.addMessage(conversation.id, 'assistant', reply);
      return { conversationId: conversation.id, reply };
    } catch (e) {
      this.logger.error(e as Error);
      throw new ServiceUnavailableException('AI unavailable');
    }
  }

  listConversations() {
    return this.repo.listConversations();
  }

  async getConfigForAdmin() {
    const cfg = await this.repo.getOrCreateConfig();
    return {
      id: cfg.id,
      systemPrompt: cfg.systemPrompt,
      provider: cfg.provider,
      model: cfg.model,
      temperature: cfg.temperature,
      maxTokens: cfg.maxTokens,
      hasApiKey: Boolean(cfg.apiKey?.trim()),
    };
  }

  async patchConfig(data: Partial<AiWidgetConfig>) {
    const cfg = await this.repo.getOrCreateConfig();
    await this.repo.updateConfig(cfg.id, data);
    return this.repo.getOrCreateConfig();
  }
}
