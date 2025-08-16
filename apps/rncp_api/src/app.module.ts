import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './microservices/auth-service/auth.module';
import { UserModule } from './microservices/user-service/user.module';
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
        HttpModule,
        AuthModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
