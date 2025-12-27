import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PhotosRepository } from './photos.repository';
import { PhotosController } from './photos.controller';
import { GcsService } from './gcs.service';

@Module({
  providers: [PhotosService, PhotosRepository, GcsService],
  controllers: [PhotosController],
  exports: [GcsService]
})
export class PhotosModule {}
