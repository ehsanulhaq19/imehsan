import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
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
  list() {
    return this.repo.listAdmin();
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
