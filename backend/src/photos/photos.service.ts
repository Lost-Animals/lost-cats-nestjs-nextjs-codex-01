import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PhotosRepository } from './photos.repository';
import { GcsService } from './gcs.service';
import sharp from 'sharp';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly photosRepository: PhotosRepository,
    private readonly gcsService: GcsService
  ) {}

  async upload(postId: string, userId: string, file: Express.Multer.File) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_user_id !== userId) {
      throw new ForbiddenException('Not allowed to upload photo for this post');
    }

    const count = await this.photosRepository.countByPostId(postId);
    if (count >= 5) {
      throw new BadRequestException('Maximum 5 photos per post');
    }

    const cleaned = await sharp(file.buffer).rotate().toBuffer();
    const metadata = await sharp(cleaned).metadata();
    const thumbBuffer = await sharp(cleaned).resize({ width: 400 }).toBuffer();

    const storageKey = await this.gcsService.upload(cleaned, file.mimetype);
    const thumbKey = await this.gcsService.upload(thumbBuffer, file.mimetype, `thumbs/${storageKey}`);

    const photo = await this.prisma.postPhoto.create({
      data: {
        post_id: postId,
        storage_key: storageKey,
        thumb_url: thumbKey,
        position: count,
        width: metadata.width,
        height: metadata.height
      }
    });

    const signedUrl = await this.gcsService.getSignedUrl(storageKey);
    const signedThumb = await this.gcsService.getSignedUrl(thumbKey);

    return {
      ...photo,
      url: signedUrl,
      thumb_url: signedThumb
    };
  }

  async delete(photoId: string, userId: string) {
    const photo = await this.photosRepository.findById(photoId);
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    const post = await this.prisma.post.findUnique({ where: { id: photo.post_id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_user_id !== userId) {
      throw new ForbiddenException('Not allowed to delete this photo');
    }

    await this.gcsService.deleteObject(photo.storage_key);
    if (photo.thumb_url) {
      await this.gcsService.deleteObject(photo.thumb_url);
    }

    return this.photosRepository.deleteById(photoId);
  }

  async reorder(postId: string, userId: string, photoIds: string[]) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_user_id !== userId) {
      throw new ForbiddenException('Not allowed to reorder photos for this post');
    }

    const photos = await this.photosRepository.findByPostId(postId);
    const existingIds = new Set(photos.map((photo) => photo.id));
    for (const id of photoIds) {
      if (!existingIds.has(id)) {
        throw new BadRequestException('Photo does not belong to post');
      }
    }

    return this.photosRepository.reorder(postId, photoIds);
  }
}
