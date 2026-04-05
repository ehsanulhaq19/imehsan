import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMedia } from '../../database/entities/project-media.entity';
import { Project } from '../../database/entities/project.entity';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
    @InjectRepository(ProjectMedia)
    private readonly pivot: Repository<ProjectMedia>,
  ) {}

  listPublished(limit = 12) {
    return this.projects.find({
      where: { published: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      take: limit,
    });
  }

  findPublishedBySlug(slug: string) {
    return this.projects.findOne({
      where: { slug, published: true },
      relations: { projectMedia: { media: true } },
    });
  }

  async create(data: Partial<Project>) {
    const p = this.projects.create(data);
    return this.projects.save(p);
  }

  async update(id: string, data: Partial<Project>) {
    await this.projects.update({ id }, data as never);
    return this.findAdmin(id);
  }

  async findAdmin(id: string) {
    const p = await this.projects.findOne({
      where: { id },
      relations: { projectMedia: { media: true } },
    });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  async delete(id: string) {
    await this.projects.delete({ id });
  }

  async attachMedia(projectId: string, mediaId: string, role: string) {
    const row = this.pivot.create({ projectId, mediaId, role });
    return this.pivot.save(row);
  }

  listAdmin() {
    return this.projects.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: { projectMedia: { media: true } },
    });
  }
}
