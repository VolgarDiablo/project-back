// src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(userData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    referralCode?: string;
  }): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email address already exists.',
      );
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    let referrerUserId: number | null = null;
    let level2UserId: number | null = null;

    if (userData.referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { affiliate_id: userData.referralCode },
        include: { referralRecord: true },
      });

      if (referrer) {
        referrerUserId = referrer.id;

        if (referrer.referralRecord?.level1_id) {
          level2UserId = referrer.referralRecord.level1_id;
        }
      }
    }

    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        referred_by: userData.referralCode,
      },
    });

    await this.prisma.userReferral.create({
      data: {
        user_id: user.id,
        level1_id: referrerUserId,
        level2_id: level2UserId,
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async saveActiveToken(userId: number, token: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        metaData: {
          token,
          last_activity: Date.now(),
        },
      },
    });
  }

  async sendVerificationEmail(user: User): Promise<void> {
    // Генерируем токен для подтверждения email
    const verificationToken = this.generateEmailVerificationToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 часа

    // Сохраняем токен в metaData
    const currentMetaData = (user.metaData as any) || {};
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        metaData: {
          ...currentMetaData,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: expiresAt,
        },
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email.html?token=${verificationToken}`;
    console.log(`📧 Email verification link for ${user.email}:`);
    console.log(`🔗 ${verificationLink}`);

    // TODO: Когда будет готов email сервис
  }

  async verifyEmailToken(token: string): Promise<boolean> {
    const users = await this.prisma.user.findMany({
      where: {
        metaData: {
          path: ['emailVerificationToken'],
          equals: token,
        },
      },
    });

    const user = users[0];
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    const metaData = user.metaData as any;
    if (
      !metaData?.emailVerificationExpires ||
      Date.now() > metaData.emailVerificationExpires
    ) {
      throw new BadRequestException('Verification token expired');
    }

    // Подтверждаем email и очищаем токен
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        metaData: {
          ...metaData,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      },
    });

    return true;
  }

  private generateEmailVerificationToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}
