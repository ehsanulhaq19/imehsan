import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CaseStudy } from '../../database/entities/case-study.entity';
import { CaseStudiesRepository } from './case-studies.repository';

@Injectable()
export class CaseStudiesService {
  constructor(private readonly repo: CaseStudiesRepository) {}

  listPublishedPaginated(page: number, limit: number, excludeSlug?: string) {
    return this.repo.listPublishedPaginated(page, limit, excludeSlug);
  }

  async getPublished(slug: string) {
    const row = await this.repo.findPublished(slug);
    if (!row) throw new NotFoundException();
    return row;
  }

  listAdminPaginated(page: number, limit: number, q?: string) {
    return this.repo.listAdminPaginated(page, limit, q);
  }

  listAdmin() {
    return this.repo.listAdmin();
  }

  async create(data: Partial<CaseStudy>) {
    const slug = data.slug!.trim();
    if (await this.repo.slugInUse(slug)) {
      throw new ConflictException('A case study with this slug already exists');
    }
    return this.repo.create({ ...data, slug });
  }

  async update(id: string, data: Partial<CaseStudy>) {
    const patch: Partial<CaseStudy> = { ...data };
    if (patch.slug !== undefined) {
      const slug = patch.slug.trim();
      if (await this.repo.slugInUse(slug, id)) {
        throw new ConflictException('A case study with this slug already exists');
      }
      patch.slug = slug;
    }
    return this.repo.update(id, patch);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  attach(id: string, mediaId: string) {
    return this.repo.attach(id, mediaId);
  }
}
