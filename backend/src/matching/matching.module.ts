import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingRepository } from './matching.repository';

@Module({
  providers: [MatchingService, MatchingRepository],
  exports: [MatchingService]
})
export class MatchingModule {}
