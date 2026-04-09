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

  @Get()
  list() {
    return this.svc.listAdmin();
  }

  @Post()
  create(@Body() dto: VlogDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<VlogDto>) {
    return this.svc.update(id, dto);
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
