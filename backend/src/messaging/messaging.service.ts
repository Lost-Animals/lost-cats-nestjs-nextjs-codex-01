import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingRepository } from './messaging.repository';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingRepository: MessagingRepository
  ) {}

  async contactPost(postId: string, userId: string, message: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_user_id === userId) {
      throw new BadRequestException('Cannot contact your own post');
    }

    let thread = await this.messagingRepository.findThreadByPostAndUser(postId, userId);
    if (!thread) {
      thread = await this.messagingRepository.createThread(postId, userId);
    }

    const messageRecord = await this.messagingRepository.createMessage(thread.id, userId, message);

    return { thread, message: messageRecord };
  }

  async listThreads(userId: string) {
    return this.messagingRepository.listThreadsForUser(userId);
  }

  async listMessages(threadId: string, userId: string) {
    const thread = await this.messagingRepository.findThreadById(threadId);
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.created_by_user_id !== userId && thread.post.author_user_id !== userId) {
      throw new ForbiddenException('Not allowed to access this thread');
    }

    return this.messagingRepository.listMessages(threadId);
  }

  async createMessage(threadId: string, userId: string, body: string) {
    const thread = await this.messagingRepository.findThreadById(threadId);
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.created_by_user_id !== userId && thread.post.author_user_id !== userId) {
      throw new ForbiddenException('Not allowed to send in this thread');
    }

    return this.messagingRepository.createMessage(threadId, userId, body);
  }
}
