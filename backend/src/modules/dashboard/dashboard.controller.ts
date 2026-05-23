import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
@UseGuards(AdminJwtAuthGuard)
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('stats')
  stats() {
    return this.svc.entityCounts();
  }
}
