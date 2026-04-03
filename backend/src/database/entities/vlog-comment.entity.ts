import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vlog } from './vlog.entity';

@Entity('vlog_comments')
export class VlogComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vlog, (v) => v.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vlog_id' })
  vlog: Vlog;

  @Column({ name: 'vlog_id', type: 'uuid' })
  vlogId: string;

  @Column({ name: 'author_name', type: 'varchar', nullable: true })
  authorName: string | null;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
