import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDTO } from './dto/token-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<void> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDTO> {
    return this.authService.login(loginDto);
  }

  @Get('email/verify')
  async verifyEmail(@Query('token') token: string): Promise<any> {
    const result = await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully!' };
  }
}
