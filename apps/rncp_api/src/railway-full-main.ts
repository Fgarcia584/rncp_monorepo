import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { RailwayFullModule } from './railway-full.module';

async function bootstrap() {
    const app = await NestFactory.create(RailwayFullModule);

    // Configure cookie parser for secure token storage
    app.use(cookieParser());

    // Enable CORS for cross-origin requests
    const corsOptions = {
        origin: (
            origin: string | undefined,
            callback: (err: Error | null, allow?: boolean) => void,
        ) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) {
                return callback(null, true);
            }

            // List of allowed origins
            const allowedOrigins = [
                'http://localhost:5174',
                'http://localhost:3000',
                'http://192.168.1.14:3000',
                'http://rncp-pwa-front',
                'http://localhost:80',
                process.env.FRONTEND_URL,
            ].filter(Boolean);

            // Check if origin is in allowed list
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Check if origin is a Railway app
            if (origin.match(/https:\/\/.*\.up\.railway\.app$/)) {
                console.log(`✅ CORS: Allowing Railway origin: ${origin}`);
                return callback(null, true);
            }

            console.warn(`⚠️ CORS: Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders:
            'Content-Type, Authorization, X-Requested-With, Origin, Accept',
        credentials: true,
        exposedHeaders: ['Authorization'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    };

    app.enableCors(corsOptions);

    const port = process.env.PORT ?? 3001;
    const host = process.env.HOST ?? '0.0.0.0';

    console.log(`Starting Railway Full API on ${host}:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    await app.listen(port, host);

    console.log(`🚀 Railway Full API is running on port ${port}`);
    console.log(`🏥 Health check available at: http://${host}:${port}/health`);
    console.log(`📡 All microservices endpoints available directly:`);
    console.log(`  - Auth: /auth/*`);
    console.log(`  - Users: /users/*`);
    console.log(`  - Orders: /orders/*`);
    console.log(`  - Geo: /geo/*`);
    console.log(`  - Tracking: /tracking/*`);
}
bootstrap();
