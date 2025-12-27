import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PostsController } from './posts.controller';
import { MatchingModule } from '../matching/matching.module';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [MatchingModule, PhotosModule],
  providers: [PostsService, PostsRepository],
  controllers: [PostsController],
  exports: [PostsService, PostsRepository]
})
export class PostsModule {}
