import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsRepository } from './reports.repository';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  create(reporterId: string, dto: CreateReportDto) {
    return this.reportsRepository.create({
      target_type: dto.target_type,
      target_id: dto.target_id,
      reporter_user_id: reporterId,
      reason: dto.reason
    });
  }

  list(status?: ReportStatus) {
    return this.reportsRepository.list(status);
  }

  resolve(id: string, status: ReportStatus) {
    return this.reportsRepository.updateStatus(id, status);
  }
}
