import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, JwtPayload } from '@rncp/types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: JwtPayload = request.user;

        if (!user) {
            return false;
        }

        // Admins have access to everything
        if (user.role === UserRole.ADMIN) {
            return true;
        }

        return requiredRoles.some((role) => user.role === role);
    }
}
