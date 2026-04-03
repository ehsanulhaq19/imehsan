import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_widget_config')
export class AiWidgetConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'system_prompt', type: 'text', nullable: true })
  systemPrompt: string | null;

  @Column({ type: 'varchar', length: 32, default: 'grok' })
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  model: string | null;

  @Column({ name: 'api_key', type: 'varchar', nullable: true })
  apiKey: string | null;

  @Column({ type: 'double precision', default: 0.7 })
  temperature: number;

  @Column({ name: 'max_tokens', type: 'int', default: 1024 })
  maxTokens: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
