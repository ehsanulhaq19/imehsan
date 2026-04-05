import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly repo: ProjectsRepository) {}

  listPublished() {
    return this.repo.listPublished();
  }

  async getPublishedBySlug(slug: string) {
    const p = await this.repo.findPublishedBySlug(slug);
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  create(data: Parameters<ProjectsRepository['create']>[0]) {
    return this.repo.create(data);
  }

  update(id: string, data: Partial<Parameters<ProjectsRepository['create']>[0]>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  attachMedia(projectId: string, mediaId: string, role: string) {
    return this.repo.attachMedia(projectId, mediaId, role);
  }

  listAdmin() {
    return this.repo.listAdmin();
  }
}
