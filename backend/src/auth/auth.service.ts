import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface JwtPayload {
  sub: string;
  role: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() }
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password_hash: passwordHash,
        display_name: dto.display_name
      }
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.assertNotBanned(user.id);

    const valid = await argon2.verify(user.password_hash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });

      await this.assertNotBanned(payload.sub);

      return this.issueTokens(payload.sub, payload.email, payload.role, false);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET')
      });

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { is_email_verified: true }
      });

      return { success: true };
    } catch {
      throw new UnauthorizedException('Invalid verification token');
    }
  }

  async createEmailVerificationToken(userId: string, email: string, role: string) {
    const ttlMinutes = this.configService.get<number>('ACCESS_TOKEN_TTL_MIN') || 20;

    return this.jwtService.signAsync(
      { sub: userId, email, role },
      { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: `${ttlMinutes}m` }
    );
  }

  private async issueTokens(userId: string, email: string, role: string, includeRefresh = true) {
    const accessTtl = this.configService.get<number>('ACCESS_TOKEN_TTL_MIN') || 20;
    const refreshTtl = this.configService.get<number>('REFRESH_TOKEN_TTL_DAYS') || 14;

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role },
      { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: `${accessTtl}m` }
    );

    if (!includeRefresh) {
      return { access_token: accessToken };
    }

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email, role },
      { secret: this.configService.get<string>('JWT_REFRESH_SECRET'), expiresIn: `${refreshTtl}d` }
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private async assertNotBanned(userId: string) {
    const latest = await this.prisma.auditLog.findFirst({
      where: {
        target_type: 'USER',
        target_id: userId,
        action: { in: ['BAN_USER', 'UNBAN_USER'] }
      },
      orderBy: { created_at: 'desc' }
    });

    if (latest?.action === 'BAN_USER') {
      throw new UnauthorizedException('Account is banned');
    }
  }
}
