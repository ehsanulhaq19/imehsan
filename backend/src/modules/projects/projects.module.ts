import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMedia } from '../../database/entities/project-media.entity';
import { Project } from '../../database/entities/project.entity';
import { AuthModule } from '../auth/auth.module';
import { ProjectsAdminController } from './projects-admin.controller';
import { ProjectsPublicController } from './projects-public.controller';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMedia]),
    AuthModule,
  ],
  controllers: [ProjectsPublicController, ProjectsAdminController],
  providers: [ProjectsRepository, ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
