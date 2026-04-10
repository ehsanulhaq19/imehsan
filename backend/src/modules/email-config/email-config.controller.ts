import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmailProviderType } from '../../database/entities/email-config.entity';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { EmailConfigRepository } from './email-config.repository';

class EmailCfgDto {
  @IsEnum(EmailProviderType)
  providerType: EmailProviderType;
  @IsOptional()
  @IsString()
  host?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  port?: number;
  @IsOptional()
  @IsBoolean()
  secure?: boolean;
  @IsOptional()
  @IsString()
  username?: string;
  @IsOptional()
  @IsString()
  password?: string;
  @IsOptional()
  @IsString()
  fromAddress?: string;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('admin/email-config')
@UseGuards(AdminJwtAuthGuard)
export class EmailConfigController {
  constructor(private readonly repo: EmailConfigRepository) {}

  @Get()
  list() {
    return this.repo.list();
  }

  @Post()
  create(@Body() dto: EmailCfgDto) {
    return this.repo.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<EmailCfgDto>) {
    return this.repo.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
