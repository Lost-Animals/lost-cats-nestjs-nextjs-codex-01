import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateById(id: string, data: Partial<{ display_name: string; avatar_url: string; phone: string | null; contact_preference: string }>) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
