import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailProviderType {
  SMTP = 'SMTP',
  MAILGUN = 'MAILGUN',
}

@Entity('email_configs')
export class EmailConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_type', type: 'varchar', length: 32 })
  providerType: EmailProviderType;

  @Column({ type: 'varchar', nullable: true })
  host: string | null;

  @Column({ type: 'int', nullable: true })
  port: number | null;

  @Column({ type: 'boolean', default: false })
  secure: boolean;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ name: 'from_address', type: 'varchar', nullable: true })
  fromAddress: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
