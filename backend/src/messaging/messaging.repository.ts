import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findThreadByPostAndUser(postId: string, userId: string) {
    return this.prisma.messageThread.findFirst({
      where: {
        post_id: postId,
        created_by_user_id: userId
      }
    });
  }

  createThread(postId: string, userId: string) {
    return this.prisma.messageThread.create({
      data: {
        post_id: postId,
        created_by_user_id: userId
      }
    });
  }

  listThreadsForUser(userId: string) {
    return this.prisma.messageThread.findMany({
      where: {
        OR: [{ created_by_user_id: userId }, { post: { author_user_id: userId } }]
      },
      include: {
        post: true,
        messages: { orderBy: { created_at: 'desc' }, take: 1 }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  findThreadById(threadId: string) {
    return this.prisma.messageThread.findUnique({
      where: { id: threadId },
      include: { post: true }
    });
  }

  listMessages(threadId: string) {
    return this.prisma.message.findMany({
      where: { thread_id: threadId },
      orderBy: { created_at: 'asc' }
    });
  }

  createMessage(threadId: string, senderId: string, body: string) {
    return this.prisma.message.create({
      data: {
        thread_id: threadId,
        sender_user_id: senderId,
        body
      }
    });
  }
}
