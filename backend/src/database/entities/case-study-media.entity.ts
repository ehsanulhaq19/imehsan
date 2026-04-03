import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CaseStudy } from './case-study.entity';
import { Media } from './media.entity';

@Entity('case_study_media')
export class CaseStudyMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CaseStudy, (c) => c.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_study_id' })
  caseStudy: CaseStudy;

  @Column({ name: 'case_study_id', type: 'uuid' })
  caseStudyId: string;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @Column({ name: 'media_id', type: 'uuid' })
  mediaId: string;
}
