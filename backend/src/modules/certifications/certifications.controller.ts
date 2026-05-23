import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminListQueryDto, paginatedMeta } from '../../common/dto/admin-list-query.dto';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { CertificationsRepository } from './certifications.repository';

class CertificationCreateDto {
  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  heading: string;

  @IsOptional()
  @IsString()
  detail?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  published?: boolean;
}

class CertificationUpdateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  heading?: string;

  @IsOptional()
  @IsString()
  detail?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  published?: boolean;
}

@Controller('certifications')
export class CertificationsPublicController {
  constructor(private readonly repo: CertificationsRepository) {}

  @Get()
  list() {
    return this.repo.listPublic();
  }

  @Get(':slug')
  async bySlug(@Param('slug') slug: string) {
    const row = await this.repo.findPublicBySlug(slug);
    if (!row) throw new NotFoundException();
    return row;
  }
}

@Controller('admin/certifications')
@UseGuards(AdminJwtAuthGuard)
export class CertificationsAdminController {
  constructor(private readonly repo: CertificationsRepository) {}

  @Get()
  async list(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.repo.listAdminPaginated(page, limit, query.q);
    return { items, meta: paginatedMeta(total, page, limit) };
  }

  @Post()
  create(@Body() dto: CertificationCreateDto) {
    return this.repo.create(dto as Parameters<CertificationsRepository['create']>[0]);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CertificationUpdateDto) {
    return this.repo.update(id, dto as Partial<Parameters<CertificationsRepository['create']>[0]>);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
