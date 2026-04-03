import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationMessage } from './conversation-message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guest_session_id', type: 'varchar', length: 128 })
  guestSessionId: string;

  @Column({ name: 'guest_name', type: 'varchar', nullable: true })
  guestName: string | null;

  @Column({ name: 'guest_email', type: 'varchar', nullable: true })
  guestEmail: string | null;

  @OneToMany(() => ConversationMessage, (m) => m.conversation)
  messages: ConversationMessage[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
