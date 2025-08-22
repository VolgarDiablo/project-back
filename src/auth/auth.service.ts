// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ITokenResponse, IJwtPayload } from './interfaces/user.interface';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<void> {
    if (signupDto.password !== signupDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.usersService.create({
      name: signupDto.name,
      email: signupDto.email,
      phone: signupDto.phone,
      password: signupDto.password,
      referralCode: signupDto.referralCode,
    });

    // Отправляем email для подтверждения (пока только логируем)
    await this.usersService.sendVerificationEmail(user);

    throw new UnauthorizedException(
      'Registration successful. Please check your email to verify your account.',
    );
  }

  async login(loginDto: LoginDto): Promise<ITokenResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatched = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );

    if (!isMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.email_verified) {
      await this.usersService.sendVerificationEmail(user);
      throw new UnauthorizedException(
        'Email not verified. Verification link sent.',
      );
    }

    const token = this.generateTokenActive({ id: user.id });
    await this.usersService.saveActiveToken(user.id, token);

    return { token };
  }
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await this.usersService.validatePassword(user, password))) {
      return user;
    }

    return null;
  }

  verifyToken(token: string): IJwtPayload {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }

    try {
      const decoded = jwt.verify(token, secret);

      if (typeof decoded !== 'object' || decoded === null) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const payload = decoded as unknown as IJwtPayload;

      if (!payload.sub || !payload.email || !payload.role) {
        throw new UnauthorizedException('Token payload is incomplete');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    return this.usersService.verifyEmailToken(token);
  }

  private generateTokenActive(payload: { id: number }): string {
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }

    return jwt.sign(payload, secret, { expiresIn: '30d' });
  }
}
