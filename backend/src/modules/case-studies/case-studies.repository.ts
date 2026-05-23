import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CaseStudyMedia } from '../../database/entities/case-study-media.entity';
import { CaseStudy } from '../../database/entities/case-study.entity';

@Injectable()
export class CaseStudiesRepository {
  constructor(
    @InjectRepository(CaseStudy)
    private readonly repo: Repository<CaseStudy>,
    @InjectRepository(CaseStudyMedia)
    private readonly pivot: Repository<CaseStudyMedia>,
  ) {}

  listPublished(limit = 12) {
    return this.repo.find({
      where: { published: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      take: limit,
    });
  }

  findPublished(slug: string) {
    return this.repo.findOne({
      where: { slug, published: true },
      relations: { attachments: { media: true } },
    });
  }

  listAdmin() {
    return this.repo.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: { attachments: { media: true } },
    });
  }

  async listAdminPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.attachments', 'a')
      .leftJoinAndSelect('a.media', 'm')
      .orderBy('c.sortOrder', 'ASC')
      .addOrderBy('c.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('c.slug ILIKE :s', { s }).orWhere('c.title ILIKE :s', { s });
        }),
      );
    }
    return qb.getManyAndCount();
  }

  create(data: Partial<CaseStudy>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CaseStudy>) {
    await this.repo.update({ id }, data as never);
    const row = await this.repo.findOne({
      where: { id },
      relations: { attachments: { media: true } },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async delete(id: string) {
    await this.repo.delete({ id });
  }

  attach(caseStudyId: string, mediaId: string) {
    return this.pivot.save(this.pivot.create({ caseStudyId, mediaId }));
  }
}
