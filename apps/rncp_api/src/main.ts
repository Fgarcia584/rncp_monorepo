import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { GatewayModule } from './gateway/gateway.module';
import { initSentry } from './sentry/sentry.config';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';

// Initialize Sentry as early as possible
initSentry();

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule);

    // Cookie parsing middleware
    app.use(cookieParser());

    // Security middleware - must be applied early
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://maps.googleapis.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.sentry.io", "https://maps.googleapis.com"]
            },
        },
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        },
        frameguard: { action: 'sameorigin' },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            disableErrorMessages: false,
        }),
    );

    // Global Sentry exception filter
    app.useGlobalFilters(new SentryExceptionFilter());

    // Global Sentry interceptor for performance monitoring
    app.useGlobalInterceptors(new SentryInterceptor());

    // Enable CORS for cross-origin requests
    app.enableCors({
        origin: [
            'http://localhost:5174', // Frontend dev (alternative port)
            'http://localhost:3000', // Frontend dev (Vite dev server)
            'http://192.168.1.14:3000', // Network access for mobile testing
            'http://rncp-pwa-front', // Docker internal
            'http://localhost:80', // Docker compose frontend
            process.env.FRONTEND_URL,
        ].filter(Boolean), // Remove undefined/null values
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders:
            'Content-Type, Authorization, X-Requested-With, Origin, Accept',
        credentials: true,
        exposedHeaders: ['Authorization'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    const port = process.env.PORT ?? 3001;
    const host = process.env.HOST ?? '0.0.0.0';

    console.log(`Starting API Gateway on ${host}:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    await app.listen(port, host);

    console.log(`🚀 API Gateway is running on port ${port}`);
    console.log(`🏥 Health check available at: http://${host}:${port}/health`);
    console.log(`📡 Proxying requests to microservices:`);
    console.log(
        `  - Auth: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3002'}`,
    );
    console.log(
        `  - Users: ${process.env.USER_SERVICE_URL || 'http://localhost:3002'}`,
    );
    console.log(
        `  - Orders: ${process.env.ORDER_SERVICE_URL || 'http://localhost:3003'}`,
    );
    console.log(
        `  - Geo: ${process.env.GEO_SERVICE_URL || 'http://localhost:3004'}`,
    );
}
bootstrap();
