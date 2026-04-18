import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
