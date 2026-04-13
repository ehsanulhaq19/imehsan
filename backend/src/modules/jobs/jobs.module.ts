import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { DigestService } from './digest.service';

@Module({
  imports: [
    ScheduleModule,
    AnalyticsModule,
    AppointmentsModule,
    MailModule,
    UsersModule,
  ],
  providers: [DigestService],
  exports: [DigestService],
})
export class JobsModule {}
