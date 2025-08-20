import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponse, TokenPair } from '@rncp/types';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
        return this.authService.register(registerDto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Body() refreshTokenDto: RefreshTokenDto,
    ): Promise<TokenPair> {
        return this.authService.refresh(refreshTokenDto);
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
        return this.authService.logout(refreshTokenDto.refreshToken);
    }

    @Get('profile')
    getProfile(@Request() req) {
        return {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            createdAt: req.user.createdAt,
            updatedAt: req.user.updatedAt,
        };
    }

    @Public()
    @Get('health')
    getHealth(): { status: string; service: string; timestamp: string } {
        return {
            status: 'ok',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
        };
    }
}
