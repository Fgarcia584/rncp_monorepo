import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './microservices/user-service/user.module';
import { User, RefreshToken, Order } from './entities';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.development', '.env.local', '.env'],
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
        UserModule,
    ],
})
class UserServiceModule {}

async function bootstrap() {
    const app = await NestFactory.create(UserServiceModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: [
            'http://localhost:5174', // Frontend dev (alternative port)
            'http://localhost:3000', // Frontend dev (Vite dev server)
            'http://192.168.1.14:3000', // Network access for mobile testing
            'http://rncp-pwa-front', // Docker internal
            'http://localhost:80', // Docker compose frontend
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders:
            'Content-Type, Authorization, X-Requested-With, Origin, Accept',
        credentials: true,
        exposedHeaders: ['Authorization'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    const port = process.env.PORT || process.env.SERVICE_INTERNAL_PORT || 3001;
    await app.listen(port);

    console.log(`👤 User Service is running on port ${port}`);
}

bootstrap();
