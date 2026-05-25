import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicListQueryDto, publicPaginatedMeta } from '../../common/dto/public-list-query.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsPublicController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async list(@Query() query: PublicListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const { items, total } = await this.projectsService.listPublishedPaginated(
      page,
      limit,
      query.excludeSlug,
    );
    return { items, meta: publicPaginatedMeta(total, page, limit) };
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.projectsService.getPublishedBySlug(slug);
  }
}
