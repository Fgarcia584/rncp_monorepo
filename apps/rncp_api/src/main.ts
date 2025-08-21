import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway/gateway.module';

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule);

    // Enable CORS for cross-origin requests
    app.enableCors({
        origin: [
            'http://localhost:5174', // Frontend dev (alternative port)
            'http://localhost:3000', // Frontend dev (Vite dev server)
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
    await app.listen(port);
    console.log(`🚀 API Gateway is running on port ${port}`);
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
