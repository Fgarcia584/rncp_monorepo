import {
    IsEmail,
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { LoginRequest, RegisterRequest, UserRole } from '../../../types';
import { IsStrongPassword } from '../../../common/validators/password.validator';

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
    @IsStrongPassword({
        message:
            'Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
    })
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
