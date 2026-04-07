import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { GitReposRepository } from './git-repos.repository';

class RepoDto {
  @IsString()
  name: string;
  @IsUrl()
  url: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  historyJson?: unknown[];
  @IsOptional()
  sortOrder?: number;
}

@Controller('git-repos')
export class GitReposPublicController {
  constructor(private readonly repo: GitReposRepository) {}

  @Get()
  list() {
    return this.repo.listPublic();
  }
}

@Controller('admin/git-repos')
@UseGuards(AdminJwtAuthGuard)
export class GitReposAdminController {
  constructor(private readonly repo: GitReposRepository) {}

  @Get()
  list() {
    return this.repo.listAdmin();
  }

  @Post()
  create(@Body() dto: RepoDto) {
    return this.repo.create(dto as Parameters<GitReposRepository['create']>[0]);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<RepoDto>) {
    return this.repo.update(id, dto as Partial<Parameters<GitReposRepository['create']>[0]>);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
