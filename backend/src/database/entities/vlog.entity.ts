import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VlogComment } from './vlog-comment.entity';
import { VlogMedia } from './vlog-media.entity';
import { VlogVote } from './vlog-vote.entity';

@Entity('vlogs')
export class Vlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  heading: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => VlogMedia, (m) => m.vlog)
  mediaItems: VlogMedia[];

  @OneToMany(() => VlogComment, (c) => c.vlog)
  comments: VlogComment[];

  @OneToMany(() => VlogVote, (v) => v.vlog)
  votes: VlogVote[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
