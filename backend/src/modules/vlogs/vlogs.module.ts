import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VlogComment } from '../../database/entities/vlog-comment.entity';
import { VlogMedia } from '../../database/entities/vlog-media.entity';
import { VlogVote } from '../../database/entities/vlog-vote.entity';
import { Vlog } from '../../database/entities/vlog.entity';
import { AuthModule } from '../auth/auth.module';
import {
  VlogsAdminController,
  VlogsPublicController,
} from './vlogs.controller';
import { VlogCommentsAdminController } from './vlog-comments-admin.controller';
import { VlogVotesAdminController } from './vlog-votes-admin.controller';
import { VlogsRepository } from './vlogs.repository';
import { VlogsService } from './vlogs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vlog, VlogMedia, VlogComment, VlogVote]),
    AuthModule,
  ],
  controllers: [
    VlogsPublicController,
    VlogsAdminController,
    VlogCommentsAdminController,
    VlogVotesAdminController,
  ],
  providers: [VlogsRepository, VlogsService],
})
export class VlogsModule {}
