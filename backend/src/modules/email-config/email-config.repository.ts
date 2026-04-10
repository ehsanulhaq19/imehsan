import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
