import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AiWidgetConfig } from '../../database/entities/ai-widget-config.entity';
import { ConversationMessage } from '../../database/entities/conversation-message.entity';
import { Conversation } from '../../database/entities/conversation.entity';

@Injectable()
export class AiRepository {
  constructor(
    @InjectRepository(AiWidgetConfig)
    private readonly cfg: Repository<AiWidgetConfig>,
    @InjectRepository(Conversation)
    private readonly conv: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private readonly msg: Repository<ConversationMessage>,
  ) {}

  async getOrCreateConfig(): Promise<AiWidgetConfig> {
    const rows = await this.cfg.find({ take: 1, order: { updatedAt: 'DESC' } });
    if (rows[0]) return rows[0];
    return this.cfg.save(
      this.cfg.create({
        provider: 'grok',
        model: 'grok-2-latest',
        temperature: 0.7,
        maxTokens: 1024,
      }),
    );
  }

  async updateConfig(id: string, data: Partial<AiWidgetConfig>) {
    await this.cfg.update({ id }, data);
    return this.cfg.findOneByOrFail({ id });
  }

  async getOrCreateConversation(
    guestSessionId: string,
    guestName?: string,
    guestEmail?: string,
  ) {
    let c = await this.conv.findOne({ where: { guestSessionId } });
    if (!c) {
      c = await this.conv.save(
        this.conv.create({
          guestSessionId,
          guestName: guestName ?? null,
          guestEmail: guestEmail ?? null,
        }),
      );
    } else if (guestName ?? guestEmail) {
      await this.conv.update(
        { id: c.id },
        {
          guestName: guestName ?? c.guestName,
          guestEmail: guestEmail ?? c.guestEmail,
        },
      );
      c = await this.conv.findOneByOrFail({ id: c.id });
    }
    return c;
  }

  findConversation(id: string) {
    return this.conv.findOne({
      where: { id },
      relations: { messages: true },
    });
  }

  listConversations(limit = 50) {
    return this.conv.find({
      order: { updatedAt: 'DESC' },
      take: limit,
      relations: { messages: true },
    });
  }

  async listConversationsPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.conv
      .createQueryBuilder('c')
      .orderBy('c.updatedAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('c.guestSessionId ILIKE :s', { s })
            .orWhere('c.guestName ILIKE :s', { s })
            .orWhere('c.guestEmail ILIKE :s', { s });
        }),
      );
    }
    return qb.getManyAndCount();
  }

  async patchConversation(
    id: string,
    data: Partial<{ guestName: string | null; guestEmail: string | null }>,
  ) {
    await this.conv.update({ id }, data as never);
    return this.conv.findOneByOrFail({ id });
  }

  async deleteConversation(id: string) {
    await this.conv.delete({ id });
  }

  addMessage(conversationId: string, role: string, content: string) {
    return this.msg.save(this.msg.create({ conversationId, role, content }));
  }

  listMessages(conversationId: string) {
    return this.msg.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }
}
