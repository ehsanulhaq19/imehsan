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

  private smtpTransportOptions(cfg: EmailConfig) {
    const port = cfg.port ?? 587;
    const secure = port === 465;
    return {
      host: cfg.host!,
      port,
      secure,
      requireTLS: port === 587,
      auth:
        cfg.username && cfg.password
          ? { user: cfg.username, pass: cfg.password }
          : undefined,
      tls: {
        minVersion: 'TLSv1.2' as const,
      },
    };
  }

  async activeFromAddress() {
    const cfg = await this.repo.findOne({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
    return cfg?.fromAddress?.trim() || null;
  }

  async sendMail(opts: { to: string; subject: string; text: string }) {
    const cfg = await this.repo.findOne({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
    if (!cfg || cfg.providerType !== EmailProviderType.SMTP) {
      this.logger.warn('No active SMTP config; skipping email send');
      return { skipped: true };
    }
    if (!cfg.host || !cfg.fromAddress) {
      this.logger.warn('Incomplete SMTP config');
      return { skipped: true };
    }
    const port = cfg.port ?? 587;
    const transportOpts = this.smtpTransportOptions(cfg);
    try {
      const transporter = nodemailer.createTransport(transportOpts);
      await transporter.sendMail({
        from: cfg.fromAddress,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
      });
      return { skipped: false };
    } catch (e) {
      this.logger.error(
        `SMTP send failed (${cfg.host}:${port}, secure=${transportOpts.secure}, requireTLS=${transportOpts.requireTLS})`,
        e as Error,
      );
      throw e;
    }
  }
}
