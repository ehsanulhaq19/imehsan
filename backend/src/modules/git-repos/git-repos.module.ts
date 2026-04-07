import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitRepo } from '../../database/entities/git-repo.entity';
import { AuthModule } from '../auth/auth.module';
import {
  GitReposAdminController,
  GitReposPublicController,
} from './git-repos.controller';
import { GitReposRepository } from './git-repos.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GitRepo]), AuthModule],
  controllers: [GitReposPublicController, GitReposAdminController],
  providers: [GitReposRepository],
})
export class GitReposModule {}
