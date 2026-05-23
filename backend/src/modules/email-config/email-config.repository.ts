import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { EmailConfig } from '../../database/entities/email-config.entity';

@Injectable()
export class EmailConfigRepository {
  constructor(
    @InjectRepository(EmailConfig)
    private readonly repo: Repository<EmailConfig>,
  ) {}

  list() {
    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }

  async listPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.repo
      .createQueryBuilder('e')
      .orderBy('e.updatedAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('e.provider_type ILIKE :s', { s })
            .orWhere('e.host ILIKE :s', { s })
            .orWhere('e.username ILIKE :s', { s })
            .orWhere('e.fromAddress ILIKE :s', { s });
        }),
      );
    }
    return qb.getManyAndCount();
  }

  create(data: Partial<EmailConfig>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<EmailConfig>) {
    await this.repo.update({ id }, data);
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException();
    return row;
  }

  async delete(id: string) {
    await this.repo.delete({ id });
  }
}
