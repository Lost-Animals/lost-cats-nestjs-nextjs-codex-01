import { Injectable } from '@nestjs/common';
import { Prisma, ContactPreference } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateById(
    id: string,
    data: Prisma.UserUpdateInput & { contact_preference?: ContactPreference }
  ) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
