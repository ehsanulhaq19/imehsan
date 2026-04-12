import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessionPage } from '../../database/entities/user-session-page.entity';
import { UserSession } from '../../database/entities/user-session.entity';
import { AuthModule } from '../auth/auth.module';
import {
  AnalyticsAdminController,
  AnalyticsPublicController,
} from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession, UserSessionPage]),
    AuthModule,
  ],
  controllers: [AnalyticsPublicController, AnalyticsAdminController],
  providers: [AnalyticsRepository],
  exports: [AnalyticsRepository],
})
export class AnalyticsModule {}
