import { Module } from '@nestjs/common';
import { ChipLookupService } from './chip-lookup.service';
import { ChipLookupController } from './chip-lookup.controller';
import { PostsModule } from '../posts/posts.module';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [PostsModule, PhotosModule],
  providers: [ChipLookupService],
  controllers: [ChipLookupController]
})
export class ChipLookupModule {}
