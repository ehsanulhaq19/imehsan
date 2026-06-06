import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { AdminListQueryDto, paginatedMeta } from '../../common/dto/admin-list-query.dto';
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

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}

class PatchAppointmentDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  appointmentDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  appointmentTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
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
  async list(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.svc.listAdminPaginated(page, limit, query.q);
    return { items, meta: paginatedMeta(total, page, limit) };
  }

  @Get(':id/attachments/:mediaId/download')
  downloadAttachment(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.svc.downloadAttachment(id, mediaId);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: PatchAppointmentDto) {
    return this.svc.updateAppointment(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.deleteAppointment(id);
  }
}
