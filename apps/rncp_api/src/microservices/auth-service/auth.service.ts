import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, RefreshToken } from '../../entities';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthResponse, JwtPayload, TokenPair, UserRole } from '@rncp/types';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        private jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const { email, password, name, role } = registerDto;

        const existingUser = await this.userRepository.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = this.userRepository.create({
            email,
            name,
            password: hashedPassword,
            role: role || UserRole.DELIVERY_PERSON,
        });

        const savedUser = await this.userRepository.save(user);

        const tokens = await this.generateTokenPair(savedUser);

        return {
            user: {
                id: savedUser.id,
                email: savedUser.email,
                name: savedUser.name,
                role: savedUser.role,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokenPair(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async refresh(refreshTokenDto: RefreshTokenDto): Promise<TokenPair> {
        const { refreshToken } = refreshTokenDto;

        const tokenRecord = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, isRevoked: false },
            relations: ['user'],
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (tokenRecord.expiresAt < new Date()) {
            await this.refreshTokenRepository.remove(tokenRecord);
            throw new UnauthorizedException('Refresh token expired');
        }

        const tokens = await this.generateTokenPair(tokenRecord.user);

        await this.refreshTokenRepository.remove(tokenRecord);

        return tokens;
    }

    async logout(refreshToken: string): Promise<void> {
        const tokenRecord = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken },
        });

        if (tokenRecord) {
            await this.refreshTokenRepository.remove(tokenRecord);
        }
    }

    async validateUser(payload: JwtPayload): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
        });

        return user || null;
    }

    private async generateTokenPair(user: User): Promise<TokenPair> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            expiresIn: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(
            { sub: user.id },
            { expiresIn: '7d' },
        );

        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        await this.refreshTokenRepository.save(refreshTokenEntity);

        return {
            accessToken,
            refreshToken,
        };
    }
}
