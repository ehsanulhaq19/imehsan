import { Injectable, NotFoundException } from '@nestjs/common';
import { CaseStudy } from '../../database/entities/case-study.entity';
import { CaseStudiesRepository } from './case-studies.repository';

@Injectable()
export class CaseStudiesService {
  constructor(private readonly repo: CaseStudiesRepository) {}

  listPublished() {
    return this.repo.listPublished();
  }

  async getPublished(slug: string) {
    const row = await this.repo.findPublished(slug);
    if (!row) throw new NotFoundException();
    return row;
  }

  listAdmin() {
    return this.repo.listAdmin();
  }

  create(data: Partial<CaseStudy>) {
    return this.repo.create(data);
  }

  update(id: string, data: Partial<CaseStudy>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  attach(id: string, mediaId: string) {
    return this.repo.attach(id, mediaId);
  }
}
