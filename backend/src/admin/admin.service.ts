import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async hidePost(actorId: string, postId: string, reason?: string) {
    const post = await this.adminRepository.hidePost(postId);

    await this.adminRepository.createAuditLog({
      actor_user_id: actorId,
      action: 'HIDE_POST',
      target_type: 'POST',
      target_id: postId,
      metadata: { reason }
    });

    return post;
  }

  listReports(status?: ReportStatus) {
    return this.adminRepository.listReports(status);
  }

  async updateReportStatus(actorId: string, reportId: string, status: ReportStatus) {
    const report = await this.adminRepository.updateReportStatus(reportId, status);

    await this.adminRepository.createAuditLog({
      actor_user_id: actorId,
      action: 'UPDATE_REPORT',
      target_type: 'REPORT',
      target_id: reportId,
      metadata: { status }
    });

    return report;
  }

  async banUser(actorId: string, userId: string, reason?: string) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.adminRepository.createAuditLog({
      actor_user_id: actorId,
      action: 'BAN_USER',
      target_type: 'USER',
      target_id: userId,
      metadata: { reason }
    });

    return { success: true };
  }

  async unbanUser(actorId: string, userId: string, reason?: string) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.adminRepository.createUnbanLog(userId, actorId, { reason });

    return { success: true };
  }

  async assertNotBanned(userId: string) {
    const latest = await this.adminRepository.findLatestBanState(userId);
    if (latest?.action === 'BAN_USER') {
      throw new BadRequestException('Account is banned');
    }
  }
}
