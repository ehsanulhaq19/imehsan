import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentMedia } from '../../database/entities/appointment-media.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { MediaModule } from '../media/media.module';
import { UsersModule } from '../users/users.module';
import {
  AppointmentsAdminController,
  AppointmentsPublicController,
} from './appointments.controller';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, AppointmentMedia]),
    MailModule,
    MediaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppointmentsPublicController, AppointmentsAdminController],
  providers: [AppointmentsRepository, AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
