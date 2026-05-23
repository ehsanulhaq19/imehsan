import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminListQueryDto, paginatedMeta } from '../../common/dto/admin-list-query.dto';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { VlogsService } from './vlogs.service';

@Controller('admin/vlogs/votes')
@UseGuards(AdminJwtAuthGuard)
export class VlogVotesAdminController {
  constructor(private readonly svc: VlogsService) {}

  @Get()
  async list(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.svc.listVotesPaginated(page, limit, query.q);
    return { items, meta: paginatedMeta(total, page, limit) };
  }

  @Delete(':id')
  deleteVote(@Param('id') id: string) {
    return this.svc.deleteVote(id);
  }
}
