import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppointmentMedia } from './appointment-media.entity';
import { User } from './user.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'booker_user_id' })
  bookerUser: User | null;

  @Column({ name: 'booker_user_id', type: 'uuid', nullable: true })
  bookerUserId: string | null;

  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: string;

  @Column({ name: 'appointment_time', type: 'time' })
  appointmentTime: string;

  @Column({ type: 'varchar', length: 64, default: 'UTC' })
  timezone: string;

  @Column({ name: 'contact_name', type: 'varchar' })
  contactName: string;

  @Column({ name: 'contact_email', type: 'varchar' })
  contactEmail: string;

  @Column({ name: 'contact_phone', type: 'varchar', nullable: true })
  contactPhone: string | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status: string;

  @OneToMany(() => AppointmentMedia, (m) => m.appointment)
  attachments: AppointmentMedia[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
