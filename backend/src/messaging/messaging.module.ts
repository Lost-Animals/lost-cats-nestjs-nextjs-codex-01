import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingRepository } from './messaging.repository';
import { MessagingController } from './messaging.controller';

@Module({
  providers: [MessagingService, MessagingRepository],
  controllers: [MessagingController]
})
export class MessagingModule {}
