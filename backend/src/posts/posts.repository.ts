import { Injectable } from '@nestjs/common';
import { Prisma, Post, PostStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PostCreateInput) {
    return this.prisma.post.create({ data });
  }

  findById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { photos: { orderBy: { position: 'asc' } } }
    });
  }

  updateById(id: string, data: Prisma.PostUpdateInput) {
    return this.prisma.post.update({ where: { id }, data });
  }

  async list(where: Prisma.PostWhereInput, orderBy: Prisma.PostOrderByWithRelationInput, skip: number, take: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { photos: { orderBy: { position: 'asc' } } }
      }),
      this.prisma.post.count({ where })
    ]);

    return { items, total };
  }

  listActiveByChip(chipNumber: string) {
    return this.prisma.post.findMany({
      where: {
        chip_number: chipNumber,
        status: PostStatus.ACTIVE
      },
      include: { photos: { orderBy: { position: 'asc' } } }
    });
  }
}
