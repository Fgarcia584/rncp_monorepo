import { UserRole } from './role.types';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
}
