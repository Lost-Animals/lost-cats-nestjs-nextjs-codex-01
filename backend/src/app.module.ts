import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { PhotosModule } from './photos/photos.module';
import { ChipLookupModule } from './chip-lookup/chip-lookup.module';
import { MessagingModule } from './messaging/messaging.module';
import { ReportsModule } from './reports/reports.module';
import { MatchingModule } from './matching/matching.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 60
      }
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    PhotosModule,
    ChipLookupModule,
    MessagingModule,
    ReportsModule,
    MatchingModule,
    AdminModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
