import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '@rncp/types';
import { User } from '../../../entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
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
