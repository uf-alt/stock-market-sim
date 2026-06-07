import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) throw new ConflictException('Email or username already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        portfolio: {
          create: {
            cashBalance: 100_000,
            totalValue: 100_000,
          },
        },
      },
    });

    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueToken(user);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
      xp: user.xp,
      xpToNext: user.xpToNext,
      streak: user.streak,
      joinedAt: user.createdAt,
    };
  }

  private issueToken(user: { id: string; email: string; username: string; level: number; xp: number }) {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        xp: user.xp,
      },
    };
  }
}
