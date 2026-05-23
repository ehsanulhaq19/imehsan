import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import {
  APPOINTMENT_UPLOAD_MIMES,
  MAX_UPLOAD_BYTES,
  assertMimeAllowed,
} from '../../common/upload.constants';
import { Appointment } from '../../database/entities/appointment.entity';
import { UserType } from '../../database/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { MediaService } from '../media/media.service';
import { UsersService } from '../users/users.service';
import { AppointmentsRepository } from './appointments.repository';

export type MulterFile = Express.Multer.File;

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly repo: AppointmentsRepository,
    private readonly mail: MailService,
    private readonly users: UsersService,
    private readonly media: MediaService,
  ) {}

  static multerOptions() {
    return {
      limits: { fileSize: MAX_UPLOAD_BYTES },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, process.env.UPLOAD_DIR || join(process.cwd(), 'uploads'));
        },
        filename: (_req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    };
  }

  private validateFiles(files: MulterFile[] | undefined) {
    if (!files?.length) return;
    for (const f of files) {
      if (f.size > MAX_UPLOAD_BYTES) {
        throw new BadRequestException(`File too large: ${f.originalname}`);
      }
      try {
        assertMimeAllowed(f.mimetype, APPOINTMENT_UPLOAD_MIMES);
      } catch {
        throw new BadRequestException(`Unsupported type: ${f.mimetype}`);
      }
    }
  }

  async book(payload: {
    appointmentDate: string;
    appointmentTime: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    reason?: string;
    files?: MulterFile[];
  }) {
    this.validateFiles(payload.files);
    let bookerUserId: string | null = null;
    const existing = await this.users.findByEmail(payload.contactEmail);
    if (existing && existing.userType === UserType.BOOKER) {
      bookerUserId = existing.id;
    } else if (!existing) {
      const booker = await this.users.createBooker({
        email: payload.contactEmail,
        firstName: payload.contactName,
      });
      bookerUserId = booker.id;
    }
    const appt = await this.repo.create({
      bookerUserId,
      appointmentDate: payload.appointmentDate,
      appointmentTime: payload.appointmentTime,
      contactName: payload.contactName,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone ?? null,
      reason: payload.reason ?? null,
      status: 'pending',
    });
    if (payload.files?.length) {
      for (const f of payload.files) {
        const publicPath = `/uploads/${f.filename}`;
        const m = await this.media.saveRecord({
          path: publicPath,
          mimeType: f.mimetype,
          originalName: f.originalname,
          uploadedById: null,
        });
        await this.repo.attach(appt.id, m.id);
      }
    }
    const summary = `New booking from ${payload.contactName} (${payload.contactEmail}) on ${payload.appointmentDate} ${payload.appointmentTime}. Reason: ${payload.reason ?? '—'}`;
    try {
      await this.mail.sendMail({
        to: payload.contactEmail,
        subject: 'Appointment received',
        text: `Thanks — we received your request.\n\n${summary}`,
      });
      const owners = await this.users.systemUsers();
      for (const o of owners) {
        await this.mail.sendMail({
          to: o.email,
          subject: 'New appointment booking',
          text: summary,
        });
      }
    } catch (e) {
      this.logger.error('Mail send failed', e as Error);
    }
    return { id: appt.id, status: appt.status };
  }

  listAdminPaginated(page: number, limit: number, q?: string) {
    return this.repo.listAdminPaginated(page, limit, q);
  }

  updateAppointment(id: string, data: Partial<Appointment>) {
    return this.repo.updateOne(id, data);
  }

  deleteAppointment(id: string) {
    return this.repo.remove(id);
  }

  listAdmin() {
    return this.repo.listAdmin();
  }

  createdBetween(start: Date, end: Date) {
    return this.repo.createdBetween(start, end);
  }

  occurringOnDate(day: string) {
    return this.repo.occurringOnDate(day);
  }
}
