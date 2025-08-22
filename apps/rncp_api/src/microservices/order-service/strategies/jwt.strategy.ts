import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload, UserRole } from '../../../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error(
                'JWT_SECRET environment variable is required for order service JWT strategy. ' +
                    'This must match the secret used in auth service.',
            );
        }

        super({
            jwtFromRequest: (req: Request) => {
                // Priority: Cookie first, then Authorization header
                return (
                    req.cookies?.accessToken ||
                    ExtractJwt.fromAuthHeaderAsBearerToken()(req)
                );
            },
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
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
