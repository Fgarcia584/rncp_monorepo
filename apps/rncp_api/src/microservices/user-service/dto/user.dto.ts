import {
    IsEmail,
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { CreateUserDto, UpdateUserDto, UserRole } from '../../../types';

export class CreateUserRequestDto implements CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class UpdateUserRequestDto implements UpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class UpdateUserRoleDto {
    @IsEnum(UserRole)
    role: UserRole;
}
