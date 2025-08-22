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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenPair } from '../../types';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Helper method to set secure httpOnly cookies for tokens
     */
    private setTokenCookies(response: Response, tokens: TokenPair): void {
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
    private clearTokenCookies(response: Response): void {
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
    async register(
        @Body() registerDto: RegisterDto,
        @Response({ passthrough: true }) response: Response,
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
    async login(
        @Body() loginDto: LoginDto,
        @Response({ passthrough: true }) response: Response,
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
        @Request() req: Request,
        @Response({ passthrough: true }) response: Response,
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new Error('Refresh token not found in cookies');
        }

        const tokenPair = await this.authService.refresh({ refreshToken });

        // Set new tokens in cookies
        this.setTokenCookies(response, tokenPair);

        return { message: 'Tokens refreshed successfully' };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Request() req: Request,
        @Response({ passthrough: true }) response: Response,
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
