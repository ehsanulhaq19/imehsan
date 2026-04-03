import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Vlog } from './vlog.entity';

@Entity('vlog_votes')
@Unique(['vlogId', 'visitorKey'])
export class VlogVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vlog, (v) => v.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vlog_id' })
  vlog: Vlog;

  @Column({ name: 'vlog_id', type: 'uuid' })
  vlogId: string;

  @Column({ name: 'visitor_key', type: 'varchar', length: 128 })
  visitorKey: string;

  /** 1 = like, -1 = dislike */
  @Column({ type: 'smallint' })
  value: number;
}
