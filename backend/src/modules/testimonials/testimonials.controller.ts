import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, IsUUID, MinLength, ValidateIf } from 'class-validator';
import { AdminListQueryDto, paginatedMeta } from '../../common/dto/admin-list-query.dto';
import { PublicListQueryDto, publicPaginatedMeta } from '../../common/dto/public-list-query.dto';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { TestimonialsRepository } from './testimonials.repository';

class TDto {
  @IsString()
  @MinLength(1)
  authorName: string;
  @IsString()
  quote: string;
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  coverImageUrl?: string | null;
  @IsOptional()
  @IsBoolean()
  approved?: boolean;
  @IsOptional()
  sortOrder?: number;
}

class TAttachDto {
  @IsUUID()
  mediaId: string;
  @IsOptional()
  @IsString()
  role?: string;
}

@Controller('testimonials')
export class TestimonialsPublicController {
  constructor(private readonly repo: TestimonialsRepository) {}

  @Get()
  async list(@Query() query: PublicListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const { items, total } = await this.repo.listApprovedPaginated(page, limit);
    return { items, meta: publicPaginatedMeta(total, page, limit) };
  }
}

@Controller('admin/testimonials')
@UseGuards(AdminJwtAuthGuard)
export class TestimonialsAdminController {
  constructor(private readonly repo: TestimonialsRepository) {}

  @Get()
  async list(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.repo.listAdminPaginated(page, limit, query.q);
    return { items, meta: paginatedMeta(total, page, limit) };
  }

  @Post()
  create(@Body() dto: TDto) {
    return this.repo.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<TDto>) {
    return this.repo.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repo.delete(id);
  }

  @Post(':id/media')
  attach(@Param('id') id: string, @Body() dto: TAttachDto) {
    return this.repo.attach(id, dto.mediaId, dto.role);
  }
}
