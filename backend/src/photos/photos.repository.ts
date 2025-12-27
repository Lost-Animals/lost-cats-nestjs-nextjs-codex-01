import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotosRepository {
  constructor(private readonly prisma: PrismaService) {}

  countByPostId(postId: string) {
    return this.prisma.postPhoto.count({ where: { post_id: postId } });
  }

  create(postId: string, storageKey: string, position: number) {
    return this.prisma.postPhoto.create({
      data: {
        post_id: postId,
        storage_key: storageKey,
        position
      }
    });
  }

  findById(photoId: string) {
    return this.prisma.postPhoto.findUnique({ where: { id: photoId } });
  }

  deleteById(photoId: string) {
    return this.prisma.postPhoto.delete({ where: { id: photoId } });
  }

  findByPostId(postId: string) {
    return this.prisma.postPhoto.findMany({ where: { post_id: postId }, orderBy: { position: 'asc' } });
  }

  async reorder(postId: string, photoIds: string[]) {
    const updates = photoIds.map((id, index) =>
      this.prisma.postPhoto.update({
        where: { id },
        data: { position: index }
      })
    );

    return this.prisma.$transaction(updates);
  }
}
