import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(registerDto: SignupDto): Promise<AuthResponseDto> {
    // Проверяем совпадение паролей
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Пароли не совпадают');
    }

    // Создаем пользователя
    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      phone: registerDto.phone,
      password: registerDto.password,
      referralCode: registerDto.referralCode,
    });

    // TODO: Отправить email подтверждение через Postmark

    // Генерируем JWT токен
    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await this.usersService.validatePassword(user, password))) {
      return user;
    }

    return null;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
