import {
  Injectable,
  ConflictException,
  NotFoundException,
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
    // Проверяем существует ли пользователь
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Обрабатываем реферальную систему
    let referrerUserId: bigint | null = null;
    let level2UserId: bigint | null = null;

    if (userData.referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { affiliate_id: userData.referralCode },
        include: { referralRecord: true },
      });

      if (referrer) {
        referrerUserId = referrer.id;

        // Если у реферера есть свой реферер - это level2
        if (referrer.referralRecord?.level1_id) {
          level2UserId = referrer.referralRecord.level1_id;
        }
      }
    }

    // Создаем пользователя
    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        referred_by: userData.referralCode,
      },
    });

    // Создаем запись в реферальной системе
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

  async findById(id: bigint): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async verifyEmail(userId: bigint): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { email_verified: true },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
