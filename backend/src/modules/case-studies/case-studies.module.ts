import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseStudyMedia } from '../../database/entities/case-study-media.entity';
import { CaseStudy } from '../../database/entities/case-study.entity';
import { AuthModule } from '../auth/auth.module';
import {
  CaseStudiesAdminController,
  CaseStudiesPublicController,
} from './case-studies.controller';
import { CaseStudiesRepository } from './case-studies.repository';
import { CaseStudiesService } from './case-studies.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaseStudy, CaseStudyMedia]), AuthModule],
  controllers: [CaseStudiesPublicController, CaseStudiesAdminController],
  providers: [CaseStudiesRepository, CaseStudiesService],
})
export class CaseStudiesModule {}
