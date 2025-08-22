import {
    Controller,
    Get,
    Post,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Sentry } from './sentry/sentry.config';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('health')
    getHealth() {
        return { status: 'ok' };
    }

    @Get('health/detailed')
    getDetailedHealth(): { status: string; timestamp: string; service: string; environment: string } {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'rncp-api-gateway',
            environment: process.env.NODE_ENV || 'development',
        };
    }

    // Development-only endpoints for testing Sentry
    @Get('sentry/test-message')
    testSentryMessage() {
        if (process.env.NODE_ENV === 'production') {
            throw new HttpException(
                'Not available in production',
                HttpStatus.NOT_FOUND,
            );
        }

        Sentry.captureMessage('Test message from NestJS endpoint', 'info');
        return {
            message: 'Sentry test message sent',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('sentry/test-error')
    testSentryError() {
        if (process.env.NODE_ENV === 'production') {
            throw new HttpException(
                'Not available in production',
                HttpStatus.NOT_FOUND,
            );
        }

        const testError = new Error('Test error from NestJS endpoint');
        Sentry.captureException(testError);

        return {
            message: 'Sentry test error sent',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('sentry/test-exception')
    testSentryException() {
        if (process.env.NODE_ENV === 'production') {
            throw new HttpException(
                'Not available in production',
                HttpStatus.NOT_FOUND,
            );
        }

        // This will be caught by our global exception filter
        throw new HttpException(
            'Test HTTP exception for Sentry',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    @Post('sentry/test-async-error')
    async testAsyncError() {
        if (process.env.NODE_ENV === 'production') {
            throw new HttpException(
                'Not available in production',
                HttpStatus.NOT_FOUND,
            );
        }

        // Simulate an async operation that fails
        await new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Test async error from NestJS'));
            }, 100);
        });

        return { message: 'This should not be reached' };
    }

    @Get('sentry/test-breadcrumb')
    testSentryBreadcrumb() {
        if (process.env.NODE_ENV === 'production') {
            throw new HttpException(
                'Not available in production',
                HttpStatus.NOT_FOUND,
            );
        }

        Sentry.addBreadcrumb({
            message: 'Test breadcrumb from NestJS endpoint',
            level: 'info',
            category: 'test',
            data: {
                endpoint: '/sentry/test-breadcrumb',
                timestamp: new Date().toISOString(),
            },
        });

        return {
            message: 'Sentry breadcrumb added',
            timestamp: new Date().toISOString(),
        };
    }
}
