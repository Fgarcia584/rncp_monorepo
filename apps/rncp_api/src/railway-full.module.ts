import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import all microservice controllers directly
import { AuthController } from './microservices/auth-service/auth.controller';
import { AuthService } from './microservices/auth-service/auth.service';
import { UserController } from './microservices/user-service/user.controller';
import { UserService } from './microservices/user-service/user.service';
import { OrderController } from './microservices/order-service/order.controller';
import { OrderService } from './microservices/order-service/order.service';
import { GeoController } from './microservices/geo-service/geo.controller';
import { TrackingController } from './microservices/geo-service/tracking.controller';
import { GeoService } from './microservices/geo-service/geo.service';
import { HealthController } from './microservices/order-service/health.controller';

// Import shared services and guards
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './microservices/auth-service/guards/jwt-auth.guard';
import { JwtStrategy } from './microservices/auth-service/strategies/jwt.strategy';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-default-secret-key',
            signOptions: { expiresIn: '1h' },
        }),
        // Note: Pas de TypeORM pour éviter les problèmes de DB sur Railway
        // Si vous voulez ajouter la DB, décommentez AppModule complet
    ],
    controllers: [
        AppController,     // /health endpoint principal
        AuthController,    // /auth/* endpoints
        UserController,    // /users/* endpoints  
        OrderController,   // /orders/* endpoints
        GeoController,     // /geo/* endpoints
        TrackingController,// /tracking/* endpoints
        HealthController,  // /orders/health endpoint supplémentaire
    ],
    providers: [
        AppService,
        AuthService,
        UserService,
        OrderService,
        GeoService,
        JwtAuthGuard,
        JwtStrategy,
    ],
})
export class RailwayFullModule {}