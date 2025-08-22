import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000, // 1 second
                limit: 3,  // 3 requests per second
            },
            {
                name: 'medium',
                ttl: 60000, // 1 minute
                limit: 20,  // 20 requests per minute
            },
            {
                name: 'long',
                ttl: 900000, // 15 minutes
                limit: 100,  // 100 requests per 15 minutes
            }
        ]),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}