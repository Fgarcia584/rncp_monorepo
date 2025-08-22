import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, RefreshToken, Order } from './entities';

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
import { TrackingService } from './microservices/geo-service/tracking.service';
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
        TypeOrmModule.forRoot(
            process.env.DATABASE_URL
                ? {
                      type: 'postgres',
                      url: process.env.DATABASE_URL,
                      entities: [User, RefreshToken, Order],
                      synchronize: true, // Crée automatiquement les tables
                      logging: process.env.NODE_ENV !== 'production',
                      ssl:
                          process.env.NODE_ENV === 'production'
                              ? { rejectUnauthorized: false }
                              : false,
                  }
                : {
                      type: 'postgres',
                      host: process.env.DB_HOST || 'localhost',
                      port: parseInt(process.env.DB_PORT || '5432', 10),
                      username: process.env.DB_USER || 'rncp_user',
                      password: process.env.DB_PASSWORD || 'rncp_password',
                      database: process.env.DB_NAME || 'rncp_db',
                      entities: [User, RefreshToken, Order],
                      synchronize: process.env.NODE_ENV !== 'production',
                      logging: process.env.NODE_ENV !== 'production',
                  },
        ),
        TypeOrmModule.forFeature([User, RefreshToken, Order]),
        JwtModule.register({
            secret:
                process.env.JWT_SECRET ||
                (() => {
                    throw new Error(
                        'JWT_SECRET environment variable is required for Railway deployment. ' +
                            'Set it via Railway dashboard or CLI.',
                    );
                })(),
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [
        AppController, // /health endpoint principal
        AuthController, // /auth/* endpoints
        UserController, // /users/* endpoints
        OrderController, // /orders/* endpoints
        GeoController, // /geo/* endpoints
        TrackingController, // /tracking/* endpoints
        HealthController, // /orders/health endpoint supplémentaire
    ],
    providers: [
        AppService,
        AuthService,
        UserService,
        OrderService,
        GeoService,
        TrackingService,
        JwtAuthGuard,
        JwtStrategy,
    ],
})
export class RailwayFullModule {}
