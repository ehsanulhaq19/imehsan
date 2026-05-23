import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AdminListQueryDto, paginatedMeta } from '../../common/dto/admin-list-query.dto';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { VlogsService } from './vlogs.service';

class VlogDto {
  @IsString()
  @MinLength(2)
  slug: string;
  @IsString()
  heading: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsBoolean()
  published?: boolean;
  @IsOptional()
  sortOrder?: number;
}

class VlogCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body: string;
}

class VlogVoteDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  visitorKey: string;
  @IsInt()
  value: number;
}

class VlogAttachDto {
  @IsUUID()
  mediaId: string;
  @IsString()
  @MaxLength(32)
  role: string;
}

@Controller('vlogs')
export class VlogsPublicController {
  constructor(private readonly svc: VlogsService) {}

  @Get()
  list() {
    return this.svc.listPublished();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.svc.detail(slug);
  }

  @Post(':slug/comments')
  postComment(@Param('slug') slug: string, @Body() dto: VlogCommentDto) {
    return this.svc.comment(slug, dto.authorName, dto.body);
  }

  @Post(':slug/votes')
  postVote(
    @Param('slug') slug: string,
    @Body() dto: VlogVoteDto,
    @Headers('x-visitor-key') headerKey?: string,
  ) {
    const key = dto.visitorKey || headerKey;
    if (!key) throw new BadRequestException('visitor key required');
    return this.svc.vote(slug, key, dto.value);
  }
}

@Controller('admin/vlogs')
@UseGuards(AdminJwtAuthGuard)
export class VlogsAdminController {
  constructor(private readonly svc: VlogsService) {}

  @Get('activity')
  activity(@Query('limit') limitRaw?: string) {
    const limit = Math.min(50, Math.max(1, parseInt(limitRaw ?? '20', 10) || 20));
    return this.svc.recentActivity(limit);
  }

  @Get()
  async list(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.svc.listAdminPaginated(page, limit, query.q);
    return { items, meta: paginatedMeta(total, page, limit) };
  }

  @Post()
  create(@Body() dto: VlogDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<VlogDto>) {
    return this.svc.update(id, dto);
  }

  @Delete(':id/media/:pivotId')
  detachMedia(@Param('id') id: string, @Param('pivotId') pivotId: string) {
    return this.svc.detachMedia(id, pivotId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post(':id/media')
  attach(@Param('id') id: string, @Body() dto: VlogAttachDto) {
    return this.svc.attach(id, dto.mediaId, dto.role);
  }
}
