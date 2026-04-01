import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ALL_ENTITIES } from './database/entities';
import { HealthController } from './health.controller';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuthModule } from './modules/auth/auth.module';
import { CaseStudiesModule } from './modules/case-studies/case-studies.module';
import { CertificationsModule } from './modules/certifications/certifications.module';
import { EmailConfigModule } from './modules/email-config/email-config.module';
import { GitReposModule } from './modules/git-repos/git-repos.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MailModule } from './modules/mail/mail.module';
import { MediaModule } from './modules/media/media.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SocialLinksModule } from './modules/social-links/social-links.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { UsersModule } from './modules/users/users.module';
import { VlogsModule } from './modules/vlogs/vlogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        if (!url) {
          throw new Error('DATABASE_URL is required');
        }
        return {
          type: 'postgres' as const,
          url,
          entities: ALL_ENTITIES,
          synchronize: false,
          migrations: [join(__dirname, 'database', 'migrations', '*.js')],
          migrationsRun: false,
        };
      },
    }),
    UsersModule,
    AuthModule,
    MailModule,
    MediaModule,
    ProjectsModule,
    CaseStudiesModule,
    GitReposModule,
    SocialLinksModule,
    CertificationsModule,
    TestimonialsModule,
    VlogsModule,
    AppointmentsModule,
    EmailConfigModule,
    AnalyticsModule,
    AiModule,
    JobsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
