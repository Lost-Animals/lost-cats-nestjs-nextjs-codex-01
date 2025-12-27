import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Post, PostType } from '@prisma/client';
import { haversineDistanceKm } from '../common/helpers/geo';
import { MatchingRepository } from './matching.repository';

@Injectable()
export class MatchingService {
  constructor(
    private readonly matchingRepository: MatchingRepository,
    private readonly configService: ConfigService
  ) {}

  async generateForPost(postId: string) {
    const post = await this.matchingRepository.findPostById(postId);
    if (!post) {
      return [];
    }

    const maxCandidates = this.configService.get<number>('MATCH_MAX_CANDIDATES') || 200;
    const maxDistanceKm = this.configService.get<number>('MATCH_MAX_DISTANCE_KM') || 50;
    const maxDaysDiff = this.configService.get<number>('MATCH_MAX_DAYS_DIFF') || 60;

    const since = new Date();
    since.setDate(since.getDate() - maxDaysDiff);

    const candidateType = post.type === PostType.LOST ? PostType.FOUND : PostType.LOST;
    const candidates = await this.matchingRepository.findCandidates(candidateType, since, maxCandidates);

    const suggestions = candidates
      .map((candidate) => this.scorePair(post, candidate, maxDistanceKm, maxDaysDiff))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((entry) => ({
        lost_post_id: post.type === PostType.LOST ? post.id : entry.candidate.id,
        found_post_id: post.type === PostType.FOUND ? post.id : entry.candidate.id,
        score: entry.score,
        reasons: entry.reasons
      }));

    await this.matchingRepository.replaceSuggestionsForPost(postId, suggestions);

    return suggestions;
  }

  private scorePair(post: Post, candidate: Post, maxDistanceKm: number, maxDaysDiff: number) {
    const distance = haversineDistanceKm(post.latitude, post.longitude, candidate.latitude, candidate.longitude);
    const daysDiff = Math.abs(post.event_datetime.getTime() - candidate.event_datetime.getTime()) / (1000 * 60 * 60 * 24);

    const distanceScore = 1 - Math.min(distance / maxDistanceKm, 1);
    const timeScore = 1 - Math.min(daysDiff / maxDaysDiff, 1);
    const attributeScore = this.attributeScore(post, candidate);

    const score = 0.45 * distanceScore + 0.35 * timeScore + 0.2 * attributeScore;

    const reasons = {
      distance_km: Number(distance.toFixed(2)),
      days_diff: Number(daysDiff.toFixed(1)),
      color_match: post.primary_color && candidate.primary_color && post.primary_color === candidate.primary_color,
      pattern_match: post.pattern === candidate.pattern
    };

    return { candidate, score, reasons };
  }

  private attributeScore(post: Post, candidate: Post) {
    let score = 0;
    let max = 0;

    if (post.primary_color && candidate.primary_color) {
      max += 1;
      if (post.primary_color === candidate.primary_color) {
        score += 1;
      }
    }

    if (post.pattern && candidate.pattern) {
      max += 1;
      if (post.pattern === candidate.pattern) {
        score += 1;
      }
    }

    if (post.cat_age_group && candidate.cat_age_group) {
      max += 1;
      if (post.cat_age_group === candidate.cat_age_group) {
        score += 1;
      }
    }

    if (max === 0) {
      return 0;
    }

    return score / max;
  }
}
