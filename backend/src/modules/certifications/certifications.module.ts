import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certification } from '../../database/entities/certification.entity';
import { AuthModule } from '../auth/auth.module';
import {
  CertificationsAdminController,
  CertificationsPublicController,
} from './certifications.controller';
import { CertificationsRepository } from './certifications.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Certification]), AuthModule],
  controllers: [CertificationsPublicController, CertificationsAdminController],
  providers: [CertificationsRepository],
})
export class CertificationsModule {}
