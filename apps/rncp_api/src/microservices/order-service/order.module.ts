import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { HealthController } from './health.controller';
import { Order } from '../../entities';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ResponseLoggingInterceptor } from './interceptors/response-logging.interceptor';
import { HeadersInterceptor } from './interceptors/headers.interceptor';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
        }),
    ],
    controllers: [OrderController, HealthController],
    providers: [
        OrderService,
        JwtStrategy,
        {
            provide: APP_INTERCEPTOR,
            useClass: HeadersInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseLoggingInterceptor,
        },
    ],
    exports: [OrderService],
})
export class OrderModule {}
