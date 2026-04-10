import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentMedia } from '../../database/entities/appointment-media.entity';
import { Appointment } from '../../database/entities/appointment.entity';

@Injectable()
export class AppointmentsRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    @InjectRepository(AppointmentMedia)
    private readonly pivot: Repository<AppointmentMedia>,
  ) {}

  create(data: Partial<Appointment>) {
    return this.repo.save(this.repo.create(data));
  }

  attach(appointmentId: string, mediaId: string) {
    return this.pivot.save(this.pivot.create({ appointmentId, mediaId }));
  }

  listAdmin() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      relations: { attachments: { media: true }, bookerUser: true },
    });
  }

  createdBetween(start: Date, end: Date) {
    return this.repo
      .createQueryBuilder('a')
      .where('a.createdAt >= :start AND a.createdAt < :end', { start, end })
      .getMany();
  }

  occurringOnDate(day: string) {
    return this.repo.find({ where: { appointmentDate: day } });
  }
}
