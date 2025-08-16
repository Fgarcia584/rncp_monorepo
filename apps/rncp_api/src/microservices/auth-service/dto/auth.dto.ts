import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { LoginRequest, RegisterRequest } from '@rncp/types';

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
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
