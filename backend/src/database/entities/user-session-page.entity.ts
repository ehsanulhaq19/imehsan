import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSession } from './user-session.entity';

@Entity('user_session_pages')
export class UserSessionPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserSession, (s) => s.pages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: UserSession;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @Column({ type: 'varchar', length: 2048 })
  path: string;

  @CreateDateColumn({ name: 'opened_at', type: 'timestamptz' })
  openedAt: Date;
}
