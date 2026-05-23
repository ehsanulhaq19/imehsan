import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  AdminListQueryDto,
  paginatedMeta,
} from '../../common/dto/admin-list-query.dto';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { AnalyticsRepository } from './analytics.repository';

class AdminAnalyticsQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

function utcCalendarDay(raw?: string): string | null {
  if (!raw?.trim()) return null;
  const s = raw.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function addUtcDays(dayStr: string, delta: number): string {
  const [y, m, d] = dayStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

function parseUtcInclusiveCalendarRange(fromRaw?: string, toRaw?: string): {
  startUtc: Date;
  endExclusiveUtc: Date;
  firstDay: string;
  lastDay: string;
} {
  const today = new Date().toISOString().slice(0, 10);
  let lastDay = utcCalendarDay(toRaw) ?? today;
  let firstDay = utcCalendarDay(fromRaw) ?? addUtcDays(lastDay, -13);
  if (firstDay > lastDay) {
    const t = firstDay;
    firstDay = lastDay;
    lastDay = t;
  }
  const startUtc = new Date(`${firstDay}T00:00:00.000Z`);
  const endExclusiveUtc = new Date(`${addUtcDays(lastDay, 1)}T00:00:00.000Z`);
  return { startUtc, endExclusiveUtc, firstDay, lastDay };
}

function rowDayKey(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === 'string') return d.slice(0, 10);
  return '';
}

function mergeDailySessions(
  firstDay: string,
  lastDay: string,
  sparse: { date: unknown; count: number }[],
): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of sparse) {
    const k = rowDayKey(row.date);
    if (k) map.set(k, Number(row.count));
  }
  const out: { date: string; count: number }[] = [];
  let cur = firstDay;
  while (true) {
    out.push({ date: cur, count: map.get(cur) ?? 0 });
    if (cur === lastDay) break;
    cur = addUtcDays(cur, 1);
  }
  return out;
}

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
  async summary(@Query() query: AdminAnalyticsQueryDto) {
    const { startUtc, endExclusiveUtc, firstDay, lastDay } = parseUtcInclusiveCalendarRange(
      query.from,
      query.to,
    );
    const [sessionCount, pageHits, sparseDaily, topPaths] = await Promise.all([
      this.repo.distinctVisitorDaysCountBetween(startUtc, endExclusiveUtc),
      this.repo.pageHitsBetween(startUtc, endExclusiveUtc),
      this.repo.dailyDistinctVisitorsBetween(startUtc, endExclusiveUtc),
      this.repo.topPathsBetween(startUtc, endExclusiveUtc, 20),
    ]);
    const dailySessions = mergeDailySessions(firstDay, lastDay, sparseDaily);
    return {
      sessionCount,
      pageHits,
      topPaths,
      dailySessions,
      range: { from: firstDay, to: lastDay },
    };
  }

  /** Logical sessions: one row per visitor per UTC calendar day (merged raw session rows). */
  @Get('visitor-sessions')
  visitorSessions(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.repo.listVisitorDaySessionsPaginated(page, limit).then(({ items, total }) => ({
      items,
      meta: paginatedMeta(total, page, limit),
    }));
  }

  /** One row per page hit (`user_session_pages`), newest first, joined to parent session (visitor id). */
  @Get('session-pages')
  sessionPages(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.repo.listSessionPagesPaginated(page, limit).then(({ items, total }) => ({
      items,
      meta: paginatedMeta(total, page, limit),
    }));
  }
}
