import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(report: { target_type: any; target_id: string; reporter_user_id: string; reason: string }) {
    return this.prisma.report.create({ data: report });
  }

  list(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' }
    });
  }

  updateStatus(id: string, status: ReportStatus) {
    return this.prisma.report.update({
      where: { id },
      data: { status, resolved_at: status === ReportStatus.RESOLVED ? new Date() : undefined }
    });
  }
}
