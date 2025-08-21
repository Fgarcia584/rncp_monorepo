import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './microservices/order-service/order.module';
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
        OrderModule,
    ],
})
class OrderServiceModule {}

async function bootstrap() {
    const app = await NestFactory.create(OrderServiceModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Conditional CORS: Strict for frontend, permissive for inter-services
    app.enableCors((req, callback) => {
        console.log('🔐 CORS Request - Origin:', req.header('Origin'));
        console.log('🔐 CORS Request - Host:', req.header('Host'));
        console.log('🔐 CORS Request - User-Agent:', req.header('User-Agent'));

        // Detect inter-service communication
        const origin = req.header('Origin');
        const userAgent = req.header('User-Agent') || '';
        const host = req.header('Host') || '';

        // Inter-service indicators
        const isInterService =
            !origin || // No origin (server-to-server)
            userAgent.includes('axios') || // Axios requests (Gateway)
            origin.includes('rncp-api-gateway') || // Docker internal Gateway
            host.includes('rncp-order-service') || // Direct service access
            req.ip?.includes('172.') || // Docker network IP range
            process.env.NODE_ENV === 'production'; // Production environment

        if (isInterService) {
            console.log(
                '✅ CORS - Inter-service communication detected, allowing all origins',
            );
            // Permissive CORS for inter-services
            callback(null, {
                origin: true, // Allow any origin
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                allowedHeaders: '*',
                credentials: false, // No credentials for inter-service
                exposedHeaders: ['*'],
                preflightContinue: false,
                optionsSuccessStatus: 200,
            });
        } else {
            console.log(
                '🔒 CORS - Frontend request detected, applying strict CORS',
            );
            // Strict CORS for frontend
            callback(null, {
                origin: [
                    'http://localhost:3000', // Frontend dev
                    'http://localhost:3001', // Dev Gateway
                    'http://rncp-pwa-front', // Docker frontend
                    process.env.FRONTEND_URL,
                ].filter(Boolean),
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                allowedHeaders:
                    'Content-Type, Authorization, X-Requested-With, Origin, Accept',
                credentials: true, // Credentials for frontend auth
                exposedHeaders: ['Authorization'],
                preflightContinue: false,
                optionsSuccessStatus: 200,
            });
        }
    });

    // In development, use dedicated port for Order service
    // In Docker/production, use SERVICE_INTERNAL_PORT (3001)
    const port =
        process.env.PORT ||
        (process.env.NODE_ENV === 'development'
            ? process.env.ORDER_SERVICE_PORT || 3003
            : process.env.SERVICE_INTERNAL_PORT || 3001);
    await app.listen(port);

    console.log(`📦 Order Service is running on port ${port}`);
}

bootstrap();
