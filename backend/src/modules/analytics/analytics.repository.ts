import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSessionPage } from '../../database/entities/user-session-page.entity';
import { UserSession } from '../../database/entities/user-session.entity';

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
}
