import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { Certification } from '../../database/entities/certification.entity';

@Injectable()
export class CertificationsRepository {
  constructor(
    @InjectRepository(Certification)
    private readonly repo: Repository<Certification>,
  ) {}

  async listPublicPaginated(page: number, limit: number, excludeSlug?: string) {
    const skip = (page - 1) * limit;
    const ex = excludeSlug?.trim();
    const where = ex ? { published: true, slug: Not(ex) } : { published: true };
    const total = await this.repo.count({ where });
    const items = await this.repo.find({
      where,
      order: { sortOrder: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { items, total };
  }

  async findPublicBySlug(slug: string) {
    return this.repo.findOne({ where: { slug, published: true } });
  }

  listAdmin() {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async listAdminPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.repo
      .createQueryBuilder('c')
      .orderBy('c.sortOrder', 'ASC')
      .addOrderBy('c.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('c.slug ILIKE :s', { s }).orWhere('c.heading ILIKE :s', { s });
        }),
      );
    }
    return qb.getManyAndCount();
  }

  create(data: Partial<Certification>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Certification>) {
    await this.repo.update({ id }, data as never);
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException();
    return row;
  }

  async delete(id: string) {
    await this.repo.delete({ id });
  }
}
