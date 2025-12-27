import { Injectable } from '@nestjs/common';
import { PostStatus, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  hidePost(postId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.HIDDEN_BY_MODERATION }
    });
  }

  listReports(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' }
    });
  }

  updateReportStatus(id: string, status: ReportStatus) {
    return this.prisma.report.update({
      where: { id },
      data: { status, resolved_at: status === ReportStatus.RESOLVED ? new Date() : undefined }
    });
  }

  createAuditLog(data: { actor_user_id: string; action: string; target_type: string; target_id: string; metadata: any }) {
    return this.prisma.auditLog.create({ data });
  }

  findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  findLatestBanState(userId: string) {
    return this.prisma.auditLog.findFirst({
      where: {
        target_type: 'USER',
        target_id: userId,
        action: { in: ['BAN_USER', 'UNBAN_USER'] }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  createUnbanLog(userId: string, actorUserId: string, metadata: any) {
    return this.prisma.auditLog.create({
      data: {
        actor_user_id: actorUserId,
        action: 'UNBAN_USER',
        target_type: 'USER',
        target_id: userId,
        metadata
      }
    });
  }
}
