import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
