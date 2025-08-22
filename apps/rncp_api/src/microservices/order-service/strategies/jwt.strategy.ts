import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, UserRole } from '../../../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        });
    }

    async validate(
        payload: JwtPayload,
    ): Promise<{ userId: number; email: string; role: UserRole }> {
        // Dans un microservice, on fait confiance au JWT déjà validé
        // On retourne simplement le payload adapté pour l'utiliser dans les controllers
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
