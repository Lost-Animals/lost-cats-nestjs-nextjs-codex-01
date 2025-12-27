import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportStatus, UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { HidePostDto } from './dto/hide-post.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { BanUserDto } from './dto/ban-user.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('posts/:id/hide')
  hidePost(
    @Param('id') postId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: HidePostDto
  ) {
    return this.adminService.hidePost(user.id, postId, dto.reason);
  }

  @Get('reports')
  listReports(@Query('status') status?: ReportStatus) {
    return this.adminService.listReports(status);
  }

  @Patch('reports/:id')
  updateReportStatus(
    @Param('id') reportId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateReportStatusDto
  ) {
    return this.adminService.updateReportStatus(user.id, reportId, dto.status);
  }

  @Post('users/:id/ban')
  banUser(
    @Param('id') userId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: BanUserDto
  ) {
    return this.adminService.banUser(user.id, userId, dto.reason);
  }

  @Post('users/:id/unban')
  unbanUser(
    @Param('id') userId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: BanUserDto
  ) {
    return this.adminService.unbanUser(user.id, userId, dto.reason);
  }
}
