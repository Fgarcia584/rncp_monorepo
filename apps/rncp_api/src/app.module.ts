import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './microservices/auth-service/auth.module';
import { UserModule } from './microservices/user-service/user.module';
import { OrderModule } from './microservices/order-service/order.module';
import { GeoModule } from './microservices/geo-service/geo.module';
import { User, RefreshToken, Order } from './entities';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER || 'rncp_user',
            password: process.env.DB_PASSWORD || 'rncp_password',
            database: process.env.DB_NAME || 'rncp_db',
            entities: [User, RefreshToken, Order],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
        }),
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
        AuthModule,
        UserModule,
        OrderModule,
        GeoModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
