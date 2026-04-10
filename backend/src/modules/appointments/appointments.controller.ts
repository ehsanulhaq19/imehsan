import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { AppointmentsService } from './appointments.service';

class BookAppointmentDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  appointmentDate: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  appointmentTime: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  reason?: string;
}

@Controller('appointments')
export class AppointmentsPublicController {
  constructor(private readonly svc: AppointmentsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, AppointmentsService.multerOptions()),
  )
  book(
    @Body() dto: BookAppointmentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.svc.book({
      ...dto,
      files: files ?? [],
    });
  }
}

@Controller('admin/appointments')
@UseGuards(AdminJwtAuthGuard)
export class AppointmentsAdminController {
  constructor(private readonly svc: AppointmentsService) {}

  @Get()
  list() {
    return this.svc.listAdmin();
  }
}
