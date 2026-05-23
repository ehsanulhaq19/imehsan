import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AdminListQueryDto, paginatedMeta } from '../../common/dto/admin-list-query.dto';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { VlogsService } from './vlogs.service';

class PatchVlogCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body?: string;
}

@Controller('admin/vlogs/comments')
@UseGuards(AdminJwtAuthGuard)
export class VlogCommentsAdminController {
  constructor(private readonly svc: VlogsService) {}

  @Get()
  async list(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.svc.listCommentsPaginated(page, limit, query.q);
    return { items, meta: paginatedMeta(total, page, limit) };
  }

  @Patch(':id')
  patchComment(@Param('id') id: string, @Body() dto: PatchVlogCommentDto) {
    return this.svc.patchComment(id, dto);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: string) {
    return this.svc.deleteComment(id);
  }
}
