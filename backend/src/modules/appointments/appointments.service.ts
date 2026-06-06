import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
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
    timezone?: string;
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
    const timezone = payload.timezone?.trim() || 'UTC';
    const appt = await this.repo.create({
      bookerUserId,
      appointmentDate: payload.appointmentDate,
      appointmentTime: payload.appointmentTime,
      timezone,
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
    const when = `${payload.appointmentDate} ${payload.appointmentTime} (${timezone})`;
    const bookerText = [
      `Hi ${payload.contactName},`,
      '',
      'Your consultation request was received.',
      '',
      `Date & time: ${when}`,
      `Phone: ${payload.contactPhone?.trim() || '—'}`,
      `Reason: ${payload.reason?.trim() || '—'}`,
      '',
      'We will follow up by email.',
    ].join('\n');
    const hostText = [
      'New appointment booking',
      '',
      `Contact: ${payload.contactName}`,
      `Email: ${payload.contactEmail}`,
      `Phone: ${payload.contactPhone?.trim() || '—'}`,
      `Date & time: ${when}`,
      `Reason: ${payload.reason?.trim() || '—'}`,
      `Status: pending`,
    ].join('\n');
    try {
      await this.mail.sendMail({
        to: payload.contactEmail,
        subject: 'Appointment received',
        text: bookerText,
      });
    } catch (e) {
      this.logger.error('Booker mail send failed', e as Error);
    }
    try {
      const hostEmail = await this.mail.activeFromAddress();
      if (hostEmail) {
        await this.mail.sendMail({
          to: hostEmail,
          subject: 'New appointment booking',
          text: hostText,
        });
      } else {
        this.logger.warn('No active email fromAddress; skipping host notification');
      }
    } catch (e) {
      this.logger.error('Host mail send failed', e as Error);
    }
    return { id: appt.id, status: appt.status };
  }

  async findById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException();
    return row;
  }

  async downloadAttachment(appointmentId: string, mediaId: string) {
    const pivot = await this.repo.findAttachment(appointmentId, mediaId);
    if (!pivot?.media) throw new NotFoundException();
    const rel = pivot.media.path.replace(/^\/uploads\//, '');
    const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    const diskPath = join(uploadDir, rel);
    if (!existsSync(diskPath)) throw new NotFoundException('File not found');
    const name = pivot.media.originalName || rel;
    const safeName = name.replace(/["\r\n]/g, '_');
    return new StreamableFile(createReadStream(diskPath), {
      type: pivot.media.mimeType,
      disposition: `attachment; filename="${safeName}"`,
    });
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
