import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { AdminController } from './admin.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  providers: [AdminService, AdminRepository, RolesGuard],
  controllers: [AdminController],
  exports: [AdminService]
})
export class AdminModule {}
