import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

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
}
