import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
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

  async listPublishedPaginated(page: number, limit: number, excludeSlug?: string) {
    const skip = (page - 1) * limit;
    const ex = excludeSlug?.trim();
    const where = ex ? { published: true, slug: Not(ex) } : { published: true };
    const total = await this.projects.count({ where });
    const items = await this.projects.find({
      where,
      order: { sortOrder: 'DESC', createdAt: 'DESC' },
      relations: { projectMedia: { media: true } },
      skip,
      take: limit,
    });
    return { items, total };
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

  async listAdminPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.projects
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.projectMedia', 'pm')
      .leftJoinAndSelect('pm.media', 'm')
      .orderBy('p.sortOrder', 'ASC')
      .addOrderBy('p.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('p.slug ILIKE :s', { s }).orWhere('p.heading ILIKE :s', { s });
        }),
      );
    }
    return qb.getManyAndCount();
  }
}
