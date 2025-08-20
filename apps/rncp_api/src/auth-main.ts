import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthModule } from './microservices/auth-service/auth.module';
import { User, RefreshToken } from './entities';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER || 'rncp_user',
            password: process.env.DB_PASSWORD || 'rncp_password',
            database: process.env.DB_NAME || 'rncp_db',
            entities: [User, RefreshToken],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
        }),
        AuthModule,
    ],
})
class AuthServiceModule {}

async function bootstrap() {
    const app = await NestFactory.create(AuthServiceModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });

    const port = process.env.PORT || process.env.SERVICE_INTERNAL_PORT || 3001;
    await app.listen(port);

    console.log(`🔐 Auth Service is running on port ${port}`);
}

bootstrap();
