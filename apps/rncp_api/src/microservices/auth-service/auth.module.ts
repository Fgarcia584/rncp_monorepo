import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User, RefreshToken } from '../../entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, RefreshToken]),
        PassportModule,
        JwtModule.register({
            secret:
                process.env.JWT_SECRET ||
                (() => {
                    throw new Error(
                        'JWT_SECRET environment variable is required. ' +
                            "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
                    );
                })(),
            signOptions: { expiresIn: '15m' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtAuthGuard],
    exports: [
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
        JwtModule,
        PassportModule,
    ],
})
export class AuthModule {}
