import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
        AuthModule,
        UserModule,
        OrderModule,
        GeoModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
