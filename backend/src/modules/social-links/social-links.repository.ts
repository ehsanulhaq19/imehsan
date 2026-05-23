import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { SocialLink } from '../../database/entities/social-link.entity';

@Injectable()
export class SocialLinksRepository {
  constructor(
    @InjectRepository(SocialLink)
    private readonly repo: Repository<SocialLink>,
  ) {}

  listPublic() {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  listAdmin() {
    return this.listPublic();
  }

  async listAdminPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.repo
      .createQueryBuilder('s')
      .orderBy('s.sortOrder', 'ASC')
      .addOrderBy('s.createdAt', 'ASC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const k = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('s.name ILIKE :k', { k })
            .orWhere('s.linkUrl ILIKE :k', { k })
            .orWhere('s.iconUrl ILIKE :k', { k });
        }),
      );
    }
    return qb.getManyAndCount();
  }

  create(data: Partial<SocialLink>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SocialLink>) {
    await this.repo.update({ id }, data as never);
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException();
    return row;
  }

  async delete(id: string) {
    await this.repo.delete({ id });
  }
}
