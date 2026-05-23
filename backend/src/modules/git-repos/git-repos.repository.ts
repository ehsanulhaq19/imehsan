import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { GitRepo } from '../../database/entities/git-repo.entity';

@Injectable()
export class GitReposRepository {
  constructor(
    @InjectRepository(GitRepo)
    private readonly repo: Repository<GitRepo>,
  ) {}

  listPublic() {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  listAdmin() {
    return this.listPublic();
  }

  async listAdminPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.repo
      .createQueryBuilder('g')
      .orderBy('g.sortOrder', 'ASC')
      .addOrderBy('g.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('g.name ILIKE :s', { s })
            .orWhere('g.description ILIKE :s', { s })
            .orWhere('g.url ILIKE :s', { s });
        }),
      );
    }
    return qb.getManyAndCount();
  }

  create(data: Partial<GitRepo>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<GitRepo>) {
    await this.repo.update({ id }, data as never);
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException();
    return row;
  }

  async delete(id: string) {
    await this.repo.delete({ id });
  }
}
