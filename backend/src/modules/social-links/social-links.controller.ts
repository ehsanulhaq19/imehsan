import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminListQueryDto, paginatedMeta } from '../../common/dto/admin-list-query.dto';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { SocialLinksRepository } from './social-links.repository';

class SocialLinkBodyDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  iconUrl: string;

  @IsString()
  @MinLength(1)
  linkUrl: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

@Controller('social-links')
export class SocialLinksPublicController {
  constructor(private readonly repo: SocialLinksRepository) {}

  @Get()
  list() {
    return this.repo.listPublic();
  }
}

@Controller('admin/social-links')
@UseGuards(AdminJwtAuthGuard)
export class SocialLinksAdminController {
  constructor(private readonly repo: SocialLinksRepository) {}

  @Get()
  async list(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.repo.listAdminPaginated(page, limit, query.q);
    return { items, meta: paginatedMeta(total, page, limit) };
  }

  @Post()
  create(@Body() dto: SocialLinkBodyDto) {
    return this.repo.create(dto as Parameters<SocialLinksRepository['create']>[0]);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<SocialLinkBodyDto>) {
    return this.repo.update(id, dto as Partial<Parameters<SocialLinksRepository['create']>[0]>);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
