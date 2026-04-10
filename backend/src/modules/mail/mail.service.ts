import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import {
  EmailConfig,
  EmailProviderType,
} from '../../database/entities/email-config.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectRepository(EmailConfig)
    private readonly repo: Repository<EmailConfig>,
  ) {}

  async sendMail(opts: { to: string; subject: string; text: string }) {
    const cfg = await this.repo.findOne({
      where: { isActive: true },
      order: { updatedAt: 'DESC' },
    });
    if (!cfg || cfg.providerType !== EmailProviderType.SMTP) {
      this.logger.warn('No active SMTP config; skipping email send');
      return { skipped: true };
    }
    if (!cfg.host || !cfg.fromAddress) {
      this.logger.warn('Incomplete SMTP config');
      return { skipped: true };
    }
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port ?? 587,
      secure: cfg.secure,
      auth:
        cfg.username && cfg.password
          ? { user: cfg.username, pass: cfg.password }
          : undefined,
    });
    await transporter.sendMail({
      from: cfg.fromAddress,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
    return { skipped: false };
  }
}
