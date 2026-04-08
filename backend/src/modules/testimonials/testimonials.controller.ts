import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { TestimonialsRepository } from './testimonials.repository';

class TDto {
  @IsString()
  @MinLength(1)
  authorName: string;
  @IsString()
  quote: string;
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
  list() {
    return this.repo.listApproved();
  }
}

@Controller('admin/testimonials')
@UseGuards(AdminJwtAuthGuard)
export class TestimonialsAdminController {
  constructor(private readonly repo: TestimonialsRepository) {}

  @Get()
  list() {
    return this.repo.listAdmin();
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
