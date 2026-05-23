import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSessionPage } from '../../database/entities/user-session-page.entity';
import { UserSession } from '../../database/entities/user-session.entity';

export type VisitorDaySessionRow = {
  visitorId: string;
  day: string;
  userAgent: string | null;
  firstStartedAt: string;
  lastActivityAt: string;
  pages: { path: string; openedAt: string }[];
};

export type SessionPageVisitRow = {
  pageHitId: string;
  path: string;
  openedAt: string;
  sessionId: string;
  visitorId: string;
  sessionStartedAt: string;
  userAgent: string | null;
};

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessions: Repository<UserSession>,
    @InjectRepository(UserSessionPage)
    private readonly pages: Repository<UserSessionPage>,
  ) {}

  createSession(visitorId: string, userAgent: string | undefined) {
    return this.sessions.save(
      this.sessions.create({ visitorId, userAgent: userAgent ?? null }),
    );
  }

  addPage(sessionId: string, path: string) {
    return this.pages.save(this.pages.create({ sessionId, path }));
  }

  sessionsBetween(start: Date, end: Date) {
    return this.sessions
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.pages', 'p')
      .where('s.startedAt >= :start AND s.startedAt < :end', { start, end })
      .getMany();
  }

  /** Distinct (visitorId, UTC calendar day) pairs with at least one session row starting in range. */
  async distinctVisitorDaysCountBetween(start: Date, end: Date): Promise<number> {
    const rows: { c: string }[] = await this.sessions.query(
      `
      SELECT COUNT(*)::int AS c
      FROM (
        SELECT DISTINCT visitor_id,
               date_trunc('day', started_at AT TIME ZONE 'UTC')
        FROM user_sessions
        WHERE started_at >= $1 AND started_at < $2
      ) t
      `,
      [start, end],
    );
    return Number(rows[0]?.c ?? 0);
  }

  /** Per UTC day: distinct visitors who started any session that day (within range). */
  async dailyDistinctVisitorsBetween(
    start: Date,
    end: Date,
  ): Promise<{ date: string; count: number }[]> {
    const rows: { date: string; count: string }[] = await this.sessions.query(
      `
      SELECT to_char(day_bucket, 'YYYY-MM-DD') AS date,
             COUNT(*)::int AS count
      FROM (
        SELECT DISTINCT visitor_id,
               date_trunc('day', started_at AT TIME ZONE 'UTC') AS day_bucket
        FROM user_sessions
        WHERE started_at >= $1 AND started_at < $2
      ) x
      GROUP BY day_bucket
      ORDER BY day_bucket ASC
      `,
      [start, end],
    );
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async pageHitsBetween(start: Date, end: Date): Promise<number> {
    const rows: { c: string }[] = await this.pages.query(
      `
      SELECT COUNT(*)::int AS c
      FROM user_session_pages
      WHERE opened_at >= $1 AND opened_at < $2
      `,
      [start, end],
    );
    return Number(rows[0]?.c ?? 0);
  }

  async topPathsBetween(
    start: Date,
    end: Date,
    limit: number,
  ): Promise<{ path: string; count: number }[]> {
    const rows: { path: string; count: string }[] = await this.pages.query(
      `
      SELECT path, COUNT(*)::int AS count
      FROM user_session_pages
      WHERE opened_at >= $1 AND opened_at < $2
      GROUP BY path
      ORDER BY COUNT(*) DESC
      LIMIT $3
      `,
      [start, end, limit],
    );
    return rows.map((r) => ({ path: r.path, count: Number(r.count) }));
  }

  async visitorDaySessionsTotal(): Promise<number> {
    const rows: { c: string }[] = await this.sessions.query(`
      SELECT COUNT(*)::int AS c
      FROM (
        SELECT 1
        FROM user_sessions
        GROUP BY visitor_id,
                 to_char(date_trunc('day', started_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD')
      ) x
    `);
    return Number(rows[0]?.c ?? 0);
  }

  async listVisitorDaySessionsPaginated(
    page: number,
    limit: number,
  ): Promise<{ items: VisitorDaySessionRow[]; total: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const total = await this.visitorDaySessionsTotal();

    type SqlRow = {
      visitorId: string;
      day: string;
      userAgent: string | null;
      firstStartedAt: Date;
      lastActivityAt: Date;
      pages: unknown;
    };

    const rows: SqlRow[] = await this.sessions.query(
      `
      WITH vd AS (
        SELECT
          visitor_id AS "visitorId",
          to_char(date_trunc('day', started_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
          MIN(started_at) AS "firstStartedAt",
          MAX(started_at) AS last_session_started_at,
          (ARRAY_AGG(user_agent ORDER BY started_at DESC))[1] AS "userAgent"
        FROM user_sessions
        GROUP BY visitor_id,
                 to_char(date_trunc('day', started_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD')
      ),
      ps AS (
        SELECT
          s.visitor_id AS vid,
          to_char(date_trunc('day', s.started_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
          COALESCE(
            json_agg(
              json_build_object('path', p.path, 'openedAt', p.opened_at)
              ORDER BY p.opened_at DESC
            ) FILTER (WHERE p.id IS NOT NULL),
            '[]'::json
          ) AS pages,
          MAX(p.opened_at) AS max_opened
        FROM user_sessions s
        LEFT JOIN user_session_pages p ON p.session_id = s.id
        GROUP BY s.visitor_id,
                 to_char(date_trunc('day', s.started_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD')
      )
      SELECT
        vd."visitorId",
        vd.day,
        vd."userAgent",
        vd."firstStartedAt",
        COALESCE(ps.pages, '[]'::json) AS pages,
        GREATEST(
          vd.last_session_started_at,
          COALESCE(ps.max_opened, vd."firstStartedAt")
        ) AS "lastActivityAt"
      FROM vd
      LEFT JOIN ps ON ps.vid = vd."visitorId" AND ps.day = vd.day
      ORDER BY "lastActivityAt" DESC
      LIMIT $1 OFFSET $2
      `,
      [safeLimit, skip],
    );

    const items: VisitorDaySessionRow[] = rows.map((r) => ({
      visitorId: r.visitorId,
      day: r.day,
      userAgent: r.userAgent ?? null,
      firstStartedAt:
        r.firstStartedAt instanceof Date
          ? r.firstStartedAt.toISOString()
          : String(r.firstStartedAt),
      lastActivityAt:
        r.lastActivityAt instanceof Date
          ? r.lastActivityAt.toISOString()
          : String(r.lastActivityAt),
      pages: normalizePageAgg(r.pages),
    }));

    return { items, total };
  }

  async sessionPagesTotal(): Promise<number> {
    const rows: { c: string }[] = await this.pages.query(`
      SELECT COUNT(*)::int AS c FROM user_session_pages
    `);
    return Number(rows[0]?.c ?? 0);
  }

  async listSessionPagesPaginated(
    page: number,
    limit: number,
  ): Promise<{ items: SessionPageVisitRow[]; total: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;
    const total = await this.sessionPagesTotal();

    type SqlRow = {
      pageHitId: string;
      path: string;
      openedAt: Date;
      sessionId: string;
      visitorId: string;
      sessionStartedAt: Date;
      userAgent: string | null;
    };

    const rows: SqlRow[] = await this.pages.query(
      `
      SELECT
        p.id AS "pageHitId",
        p.path AS path,
        p.opened_at AS "openedAt",
        p.session_id AS "sessionId",
        s.visitor_id AS "visitorId",
        s.started_at AS "sessionStartedAt",
        s.user_agent AS "userAgent"
      FROM user_session_pages p
      INNER JOIN user_sessions s ON s.id = p.session_id
      ORDER BY p.opened_at DESC
      LIMIT $1 OFFSET $2
      `,
      [safeLimit, skip],
    );

    const items: SessionPageVisitRow[] = rows.map((r) => ({
      pageHitId: r.pageHitId,
      path: r.path,
      openedAt:
        r.openedAt instanceof Date ? r.openedAt.toISOString() : String(r.openedAt),
      sessionId: r.sessionId,
      visitorId: r.visitorId,
      sessionStartedAt:
        r.sessionStartedAt instanceof Date
          ? r.sessionStartedAt.toISOString()
          : String(r.sessionStartedAt),
      userAgent: r.userAgent ?? null,
    }));

    return { items, total };
  }
}

function normalizePageAgg(raw: unknown): { path: string; openedAt: string }[] {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  const out: { path: string; openedAt: string }[] = [];
  for (const x of arr) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    const path = typeof o.path === 'string' ? o.path : '';
    const opened = o.openedAt;
    const openedAt =
      opened instanceof Date
        ? opened.toISOString()
        : typeof opened === 'string'
          ? opened
          : '';
    if (path) out.push({ path, openedAt });
  }
  return out;
}
