import { Injectable } from '@nestjs/common';
import { PostStatus, PostType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPostById(id: string) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  findCandidates(type: PostType, since?: Date, limit = 200) {
    return this.prisma.post.findMany({
      where: {
        type,
        status: PostStatus.ACTIVE,
        event_datetime: since ? { gte: since } : undefined
      },
      take: limit
    });
  }

  async replaceSuggestionsForPost(postId: string, suggestions: { lost_post_id: string; found_post_id: string; score: number; reasons: any }[]) {
    await this.prisma.matchSuggestion.deleteMany({
      where: {
        OR: [{ lost_post_id: postId }, { found_post_id: postId }]
      }
    });

    if (suggestions.length === 0) {
      return [];
    }

    return this.prisma.matchSuggestion.createMany({ data: suggestions });
  }
}
