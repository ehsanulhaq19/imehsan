import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { AnalyticsRepository } from './analytics.repository';

class StartSessionDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  visitorId: string;
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  userAgent?: string;
}

class PageHitDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  path: string;
}

@Controller('analytics')
export class AnalyticsPublicController {
  constructor(private readonly repo: AnalyticsRepository) {}

  @Post('sessions')
  start(@Body() dto: StartSessionDto) {
    return this.repo.createSession(dto.visitorId, dto.userAgent);
  }

  @Post('sessions/:id/pages')
  page(@Param('id') id: string, @Body() dto: PageHitDto) {
    return this.repo.addPage(id, dto.path);
  }
}

@Controller('admin/analytics')
@UseGuards(AdminJwtAuthGuard)
export class AnalyticsAdminController {
  constructor(private readonly repo: AnalyticsRepository) {}

  @Get('sessions')
  async summary() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const rows = await this.repo.sessionsBetween(start, end);
    const pages = rows.flatMap((s) => s.pages ?? []);
    const counts: Record<string, number> = {};
    for (const p of pages) {
      counts[p.path] = (counts[p.path] ?? 0) + 1;
    }
    return {
      sessionCount: rows.length,
      pageHits: pages.length,
      topPaths: Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([path, count]) => ({ path, count })),
      windowDays: 7,
    };
  }
}
