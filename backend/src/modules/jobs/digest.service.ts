import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AnalyticsRepository } from '../analytics/analytics.repository';
import { AppointmentsService } from '../appointments/appointments.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(
    private readonly analytics: AnalyticsRepository,
    private readonly appointments: AppointmentsService,
    private readonly mail: MailService,
    private readonly users: UsersService,
  ) {}

  @Cron(process.env.DIGEST_CRON || '0 8 * * *')
  async handleCron() {
    await this.runDailyDigest('cron');
  }

  async runManual() {
    await this.runDailyDigest('manual');
  }

  private async runDailyDigest(source: string) {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 1);

    const sessions = await this.analytics.sessionsBetween(start, end);
    const pageHits = sessions.reduce((n, s) => n + (s.pages?.length ?? 0), 0);
    const createdAppts = await this.appointments.createdBetween(start, end);

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    const dueToday = await this.appointments.occurringOnDate(todayStr);

    const lines = [
      `Daily digest (${source})`,
      `Window (UTC midnight aligned): ${start.toISOString()} → ${end.toISOString()}`,
      `Sessions: ${sessions.length}, Page hits: ${pageHits}`,
      `Appointments created in window: ${createdAppts.length}`,
      `Appointments scheduled today (${todayStr}): ${dueToday.length}`,
    ];

    const body = lines.join('\n');
    const owners = await this.users.systemUsers();
    if (!owners.length) {
      this.logger.warn('No system users to notify');
      return;
    }
    try {
      for (const o of owners) {
        await this.mail.sendMail({
          to: o.email,
          subject: 'Daily site digest',
          text: body,
        });
      }
    } catch (e) {
      this.logger.error('Digest mail failed', e as Error);
    }
  }
}
