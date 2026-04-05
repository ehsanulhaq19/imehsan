import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { ProjectsService } from './projects.service';

class CreateProjectDto {
  @IsString()
  @MinLength(2)
  slug: string;

  @IsString()
  heading: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

class AttachMediaDto {
  @IsUUID()
  mediaId: string;

  @IsString()
  @MaxLength(32)
  role: string;
}

@Controller('admin/projects')
@UseGuards(AdminJwtAuthGuard)
export class ProjectsAdminController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  list() {
    return this.projectsService.listAdmin();
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProjectDto>) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/media')
  attach(@Param('id') id: string, @Body() dto: AttachMediaDto) {
    return this.projectsService.attachMedia(id, dto.mediaId, dto.role);
  }
}
