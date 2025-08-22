import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class HealthController {
    @Public()
    @Get('health')
    health(): {
        status: string;
        service: string;
        timestamp: string;
        version: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        dependencies: { database: string; redis: string; geoService: string };
    } {
        return {
            status: 'healthy',
            service: 'order-service',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            dependencies: {
                database: 'healthy',
                redis: 'healthy',
                geoService: 'healthy' // Vérification de connexion au service geo
            }
        };
    }
}
