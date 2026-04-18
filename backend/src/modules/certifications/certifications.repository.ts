import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from '../../database/entities/certification.entity';

@Injectable()
export class CertificationsRepository {
  constructor(
    @InjectRepository(Certification)
    private readonly repo: Repository<Certification>,
  ) {}

  listPublic() {
    return this.repo.find({
      where: { published: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findPublicBySlug(slug: string) {
    return this.repo.findOne({ where: { slug, published: true } });
  }

  listAdmin() {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
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
