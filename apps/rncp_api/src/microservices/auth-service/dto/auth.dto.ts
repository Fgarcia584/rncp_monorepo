import {
    IsEmail,
    IsString,
    MinLength,
    IsNotEmpty,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { LoginRequest, RegisterRequest, UserRole } from '@rncp/types';

export class LoginDto implements LoginRequest {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RegisterDto implements RegisterRequest {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
