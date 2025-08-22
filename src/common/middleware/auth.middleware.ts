// src/common/middleware/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // src/common/middleware/auth.middleware.ts
  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    console.log('🔗 Token extracted:', token ? 'Found' : 'Not found');

    if (token) {
      try {
        // Проверяем JWT токен
        const decoded: any = this.authService.verifyToken(token);
        console.log('🔐 Decoded token:', decoded);

        // Получаем пользователя из БД
        const user = await this.usersService.findById(decoded.id);
        console.log(
          '👤 User found:',
          user ? `ID: ${user.id}, Email: ${user.email}` : 'Not found',
        );

        if (user) {
          req['user'] = user; // Добавляем user в request
          console.log('✅ User added to request');
        }
      } catch (error) {
        console.log('❌ Auth error:', error.message);
      }
    }

    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
