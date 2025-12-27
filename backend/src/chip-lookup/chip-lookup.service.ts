import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostsRepository } from '../posts/posts.repository';
import { GcsService } from '../photos/gcs.service';

@Injectable()
export class ChipLookupService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly configService: ConfigService,
    private readonly gcsService: GcsService
  ) {}

  async lookup(chipNumber: string) {
    const normalized = chipNumber.replace(/\s+/g, '');
    const regex = this.configService.get<string>('CHIP_NUMBER_REGEX') || '^[0-9]{8,20}$';
    const pattern = new RegExp(regex);

    if (!pattern.test(normalized)) {
      throw new BadRequestException('Invalid chip number');
    }

    const posts = await this.postsRepository.listActiveByChip(normalized);

    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        photos: await Promise.all(
          post.photos.map(async (photo) => ({
            ...photo,
            url: await this.gcsService.getSignedUrl(photo.storage_key),
            thumb_url: photo.thumb_url ? await this.gcsService.getSignedUrl(photo.thumb_url) : null
          }))
        )
      }))
    );
  }
}
