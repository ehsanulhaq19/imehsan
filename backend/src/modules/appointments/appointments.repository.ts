import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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

  async listAdminPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.attachments', 'att')
      .leftJoinAndSelect('att.media', 'm')
      .leftJoinAndSelect('a.bookerUser', 'u')
      .orderBy('a.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('a.contactName ILIKE :s', { s })
            .orWhere('a.contactEmail ILIKE :s', { s })
            .orWhere('a.reason ILIKE :s', { s })
            .orWhere('a.status ILIKE :s', { s });
        }),
      );
    }
    return qb.getManyAndCount();
  }

  async updateOne(id: string, data: Partial<Appointment>) {
    const exists = await this.repo.exist({ where: { id } });
    if (!exists) throw new NotFoundException();
    await this.repo.update({ id }, data as never);
    return this.repo.findOne({
      where: { id },
      relations: { attachments: { media: true }, bookerUser: true },
    });
  }

  async remove(id: string) {
    const r = await this.repo.delete({ id });
    if (!r.affected) throw new NotFoundException();
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
