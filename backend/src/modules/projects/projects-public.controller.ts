import { Controller, Get, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsPublicController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  list() {
    return this.projectsService.listPublished();
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.projectsService.getPublishedBySlug(slug);
  }
}
