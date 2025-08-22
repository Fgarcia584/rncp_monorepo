import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../../../types';
import { User } from '../../../entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error(
                'JWT_SECRET environment variable is required. ' +
                    "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
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

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.authService.validateUser(payload);

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
