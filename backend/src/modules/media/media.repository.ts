import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Media } from '../../database/entities/media.entity';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectRepository(Media)
    private readonly repo: Repository<Media>,
  ) {}

  create(data: Partial<Media>) {
    return this.repo.save(this.repo.create(data));
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async listPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.repo
      .createQueryBuilder('media')
      .orderBy('media.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('media.originalName ILIKE :s', { s }).orWhere('media.path ILIKE :s', { s });
        }),
      );
    }
    return qb.getManyAndCount();
  }

  async deleteOne(id: string) {
    const r = await this.repo.delete({ id });
    if (!r.affected) throw new NotFoundException();
  }
}
