import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../../database/entities/media.entity';
import { AuthModule } from '../auth/auth.module';
import { MediaAdminController } from './media-admin.controller';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media]), AuthModule],
  controllers: [MediaAdminController],
  providers: [MediaRepository, MediaService],
  exports: [MediaService],
})
export class MediaModule {}
