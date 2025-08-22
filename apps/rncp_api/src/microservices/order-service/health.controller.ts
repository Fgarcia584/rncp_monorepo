import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class HealthController {
    @Public()
    @Get('health')
    health() {
        return {
            status: 'ok',
            service: 'order-service',
            timestamp: new Date().toISOString(),
        };
    }
}
