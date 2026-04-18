import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialLink } from '../../database/entities/social-link.entity';
import { AuthModule } from '../auth/auth.module';
import {
  SocialLinksAdminController,
  SocialLinksPublicController,
} from './social-links.controller';
import { SocialLinksRepository } from './social-links.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SocialLink]), AuthModule],
  controllers: [SocialLinksPublicController, SocialLinksAdminController],
  providers: [SocialLinksRepository],
})
export class SocialLinksModule {}
