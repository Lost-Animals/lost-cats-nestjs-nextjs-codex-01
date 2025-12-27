import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsRepository } from './reports.repository';
import { ReportsController } from './reports.controller';

@Module({
  providers: [ReportsService, ReportsRepository],
  controllers: [ReportsController],
  exports: [ReportsService]
})
export class ReportsModule {}
