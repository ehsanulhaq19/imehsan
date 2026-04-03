import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Media } from './media.entity';
import { Vlog } from './vlog.entity';

@Entity('vlog_media')
export class VlogMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vlog, (v) => v.mediaItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vlog_id' })
  vlog: Vlog;

  @Column({ name: 'vlog_id', type: 'uuid' })
  vlogId: string;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @Column({ name: 'media_id', type: 'uuid' })
  mediaId: string;

  @Column({ type: 'varchar', length: 32 })
  role: string;
}
