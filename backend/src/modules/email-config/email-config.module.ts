import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfig } from '../../database/entities/email-config.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailConfigController } from './email-config.controller';
import { EmailConfigRepository } from './email-config.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmailConfig]), AuthModule],
  controllers: [EmailConfigController],
  providers: [EmailConfigRepository],
})
export class EmailConfigModule {}
