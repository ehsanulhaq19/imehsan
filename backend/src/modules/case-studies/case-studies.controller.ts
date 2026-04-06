import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { CaseStudiesService } from './case-studies.service';

class CsDto {
  @IsString()
  @MinLength(2)
  slug: string;
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  externalLink?: string;
  @IsOptional()
  sortOrder?: number;
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

class AttachDto {
  @IsUUID()
  mediaId: string;
}

@Controller('case-studies')
export class CaseStudiesPublicController {
  constructor(private readonly svc: CaseStudiesService) {}

  @Get()
  list() {
    return this.svc.listPublished();
  }

  @Get(':slug')
  one(@Param('slug') slug: string) {
    return this.svc.getPublished(slug);
  }
}

@Controller('admin/case-studies')
@UseGuards(AdminJwtAuthGuard)
export class CaseStudiesAdminController {
  constructor(private readonly svc: CaseStudiesService) {}

  @Get()
  list() {
    return this.svc.listAdmin();
  }

  @Post()
  create(@Body() dto: CsDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CsDto>) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post(':id/media')
  attach(@Param('id') id: string, @Body() dto: AttachDto) {
    return this.svc.attach(id, dto.mediaId);
  }
}
