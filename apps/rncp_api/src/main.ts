import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for cross-origin requests
    app.enableCors({
        origin: [
            'http://localhost:3000', // Frontend dev
            'http://rncp-pwa-front', // Docker internal
            process.env.FRONTEND_URL || '*',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
        credentials: true,
    });

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
