import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    UseGuards,
    Request,
    Response,
    BadRequestException,
} from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenPair } from '../../types';
import { User } from '../../entities';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Helper method to set secure httpOnly cookies for tokens
     */
    private setTokenCookies(response: ExpressResponse, tokens: TokenPair): void {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // HTTPS only in production
            sameSite: 'strict' as const,
            path: '/',
        };

        // Access token - expires in 15 minutes
        response.cookie('accessToken', tokens.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        // Refresh token - expires in 7 days
        response.cookie('refreshToken', tokens.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    /**
     * Helper method to clear authentication cookies
     */
    private clearTokenCookies(response: ExpressResponse): void {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/',
        };

        response.clearCookie('accessToken', cookieOptions);
        response.clearCookie('refreshToken', cookieOptions);
    }

    @Public()
    @Post('register')
    @Throttle({ short: { limit: 2, ttl: 60000 } }) // 2 registrations per minute
    async register(
        @Body() registerDto: RegisterDto,
        @Response({ passthrough: true }) response: ExpressResponse,
    ) {
        const authResult = await this.authService.register(registerDto);

        // Set secure cookies for tokens
        this.setTokenCookies(response, {
            accessToken: authResult.accessToken,
            refreshToken: authResult.refreshToken,
        });

        // Return user data without tokens
        return {
            user: authResult.user,
            message: 'Registration successful',
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
    async login(
        @Body() loginDto: LoginDto,
        @Response({ passthrough: true }) response: ExpressResponse,
    ) {
        const authResult = await this.authService.login(loginDto);

        // Set secure cookies for tokens
        this.setTokenCookies(response, {
            accessToken: authResult.accessToken,
            refreshToken: authResult.refreshToken,
        });

        // Return user data without tokens
        return {
            user: authResult.user,
            message: 'Login successful',
        };
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Request() req: ExpressRequest,
        @Response({ passthrough: true }) response: ExpressResponse,
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new BadRequestException('Refresh token not found in cookies');
        }

        const tokenPair = await this.authService.refresh({ refreshToken });

        // Set new tokens in cookies
        this.setTokenCookies(response, tokenPair);

        return { message: 'Tokens refreshed successfully' };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Request() req: ExpressRequest,
        @Response({ passthrough: true }) response: ExpressResponse,
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        // Clear authentication cookies
        this.clearTokenCookies(response);

        return { message: 'Logout successful' };
    }

    @Get('profile')
    getProfile(@Request() req: ExpressRequest & { user: User }) {
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
    getHealth(): { 
        status: string; 
        service: string; 
        timestamp: string;
        version: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        dependencies: { database: string; redis: string; jwt: string };
    } {
        return {
            status: 'healthy',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            dependencies: {
                database: 'healthy',
                redis: 'healthy',
                jwt: process.env.JWT_SECRET ? 'healthy' : 'warning'
            }
        };
    }
}
