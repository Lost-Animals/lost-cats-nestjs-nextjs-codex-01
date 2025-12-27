import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostStatus, PostType, Prisma } from '@prisma/client';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { ResolvePostDto } from './dto/resolve-post.dto';
import { boundingBox, haversineDistanceKm } from '../common/helpers/geo';
import { MatchingService } from '../matching/matching.service';
import { GcsService } from '../photos/gcs.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly configService: ConfigService,
    private readonly matchingService: MatchingService,
    private readonly gcsService: GcsService
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    if (dto.type === PostType.LOST && dto.found_care_info) {
      throw new BadRequestException('found_care_info is only allowed for FOUND posts');
    }

    const chipNumber = this.normalizeChipNumber(dto.chip_number);

    const post = await this.postsRepository.create({
      type: dto.type,
      title: dto.title,
      description: dto.description,
      event_datetime: new Date(dto.event_datetime),
      event_datetime_precision: dto.event_datetime_precision,
      latitude: dto.location.latitude,
      longitude: dto.location.longitude,
      location_label: dto.location.location_label,
      accuracy_radius_m: dto.location.accuracy_radius_m ?? 500,
      cat_name: dto.cat_profile.name,
      cat_sex: dto.cat_profile.sex,
      cat_age_group: dto.cat_profile.age_group,
      cat_size: dto.cat_profile.size,
      cat_fur_length: dto.cat_profile.fur_length,
      primary_color: dto.cat_profile.primary_color,
      secondary_color: dto.cat_profile.secondary_color,
      pattern: dto.cat_profile.pattern,
      distinctive_marks: dto.cat_profile.distinctive_marks,
      chip_number: chipNumber,
      passport_number: dto.passport_number,
      is_neutered: dto.is_neutered,
      health_notes: dto.health_notes,
      found_is_sheltered: dto.found_care_info?.is_sheltered,
      found_needs_vet: dto.found_care_info?.needs_vet,
      author: { connect: { id: authorId } }
    });

    await this.matchingService.generateForPost(post.id);

    return post;
  }

  async getById(id: string) {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postsRepository.updateById(id, { views_count: { increment: 1 } });
    return this.attachSignedUrls(post);
  }

  async update(id: string, userId: string, role: string, dto: UpdatePostDto) {
    const existing = await this.postsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (existing.author_user_id !== userId && role !== 'ADMIN' && role !== 'MODERATOR') {
      throw new ForbiddenException('Not allowed to edit this post');
    }

    if (existing.type === PostType.LOST && dto.found_care_info) {
      throw new BadRequestException('found_care_info is only allowed for FOUND posts');
    }

    const chipNumber = this.normalizeChipNumber(dto.chip_number ?? undefined);

    const data: Prisma.PostUpdateInput = {
      title: dto.title,
      description: dto.description,
      event_datetime: dto.event_datetime ? new Date(dto.event_datetime) : undefined,
      event_datetime_precision: dto.event_datetime_precision,
      latitude: dto.location?.latitude,
      longitude: dto.location?.longitude,
      location_label: dto.location?.location_label,
      accuracy_radius_m: dto.location?.accuracy_radius_m,
      cat_name: dto.cat_profile?.name,
      cat_sex: dto.cat_profile?.sex,
      cat_age_group: dto.cat_profile?.age_group,
      cat_size: dto.cat_profile?.size,
      cat_fur_length: dto.cat_profile?.fur_length,
      primary_color: dto.cat_profile?.primary_color,
      secondary_color: dto.cat_profile?.secondary_color,
      pattern: dto.cat_profile?.pattern,
      distinctive_marks: dto.cat_profile?.distinctive_marks,
      chip_number: chipNumber,
      passport_number: dto.passport_number ?? undefined,
      is_neutered: dto.is_neutered ?? undefined,
      health_notes: dto.health_notes ?? undefined,
      found_is_sheltered: dto.found_care_info?.is_sheltered,
      found_needs_vet: dto.found_care_info?.needs_vet
    };

    return this.postsRepository.updateById(id, data);
  }

  async resolve(id: string, userId: string, role: string, dto: ResolvePostDto) {
    const existing = await this.postsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (existing.author_user_id !== userId && role !== 'ADMIN' && role !== 'MODERATOR') {
      throw new ForbiddenException('Not allowed to resolve this post');
    }

    return this.postsRepository.updateById(id, {
      status: PostStatus.RESOLVED,
      resolved_at: dto.resolved_at ? new Date(dto.resolved_at) : new Date()
    });
  }

  async archive(id: string, userId: string, role: string) {
    const existing = await this.postsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (existing.author_user_id !== userId && role !== 'ADMIN' && role !== 'MODERATOR') {
      throw new ForbiddenException('Not allowed to archive this post');
    }

    return this.postsRepository.updateById(id, { status: PostStatus.ARCHIVED });
  }

  async list(query: ListPostsDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.page_size ?? 20));

    const where: Prisma.PostWhereInput = {
      status: query.status ?? PostStatus.ACTIVE
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.location_label) {
      where.location_label = { contains: query.location_label, mode: 'insensitive' };
    }

    if (query.primary_color) {
      where.primary_color = { equals: query.primary_color, mode: 'insensitive' };
    }

    if (query.fur_length) {
      where.cat_fur_length = query.fur_length;
    }

    if (query.has_chip) {
      if (query.has_chip === 'true') {
        where.chip_number = { not: null };
      } else if (query.has_chip === 'false') {
        where.chip_number = null;
      }
    }

    if (query.date_from || query.date_to) {
      where.event_datetime = {
        gte: query.date_from ? new Date(query.date_from) : undefined,
        lte: query.date_to ? new Date(query.date_to) : undefined
      };
    }

    const orderBy = this.getOrderBy(query.sort);

    if (query.lat != null && query.lng != null && query.radius_km != null) {
      const box = boundingBox(query.lat, query.lng, query.radius_km);
      where.latitude = { gte: box.minLat, lte: box.maxLat } as any;
      where.longitude = { gte: box.minLng, lte: box.maxLng } as any;
    }

    const { items, total } = await this.postsRepository.list(where, orderBy, (page - 1) * pageSize, pageSize);

    if (query.sort === 'nearest' && query.lat != null && query.lng != null) {
      const radius = query.radius_km ?? 20;
      const sorted = items
        .map((item) => ({
          item,
          distance: haversineDistanceKm(query.lat!, query.lng!, item.latitude, item.longitude)
        }))
        .filter((entry) => entry.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .map((entry) => entry.item);

      const start = (page - 1) * pageSize;
      const paged = sorted.slice(start, start + pageSize);

      const withUrls = await this.attachSignedUrlsForList(paged);

      return {
        items: withUrls,
        page,
        page_size: pageSize,
        total: sorted.length
      };
    }

    const withUrls = await this.attachSignedUrlsForList(items);
    return { items: withUrls, page, page_size: pageSize, total };
  }

  private normalizeChipNumber(chipNumber?: string) {
    if (!chipNumber) {
      return undefined;
    }

    const normalized = chipNumber.replace(/\s+/g, '');
    const regex = this.configService.get<string>('CHIP_NUMBER_REGEX') || '^[0-9]{8,20}$';
    const pattern = new RegExp(regex);

    if (!pattern.test(normalized)) {
      throw new BadRequestException('Invalid chip number');
    }

    return normalized;
  }

  private getOrderBy(sort?: string): Prisma.PostOrderByWithRelationInput {
    if (sort === 'updated') {
      return { updated_at: 'desc' };
    }

    return { created_at: 'desc' };
  }

  private async attachSignedUrls(post: Prisma.PostGetPayload<{ include: { photos: true } }>) {
    const photos = await Promise.all(
      post.photos.map(async (photo) => ({
        ...photo,
        url: await this.gcsService.getSignedUrl(photo.storage_key),
        thumb_url: photo.thumb_url ? await this.gcsService.getSignedUrl(photo.thumb_url) : null
      }))
    );

    return { ...post, photos };
  }

  private async attachSignedUrlsForList(posts: Prisma.PostGetPayload<{ include: { photos: true } }>[]) {
    return Promise.all(posts.map((post) => this.attachSignedUrls(post)));
  }
}
