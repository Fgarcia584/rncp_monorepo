export enum UserRole {
    ADMIN = 'admin',
    DELIVERY_PERSON = 'delivery_person',
    MERCHANT = 'merchant',
    LOGISTICS_TECHNICIAN = 'logistics_technician',
}

export interface RolePermissions {
    canAccessUserManagement: boolean;
    canAccessGlobalStats: boolean;
    canAccessInventoryManagement: boolean;
    canAccessOrderManagement: boolean;
    canAccessDeliveryManagement: boolean;
    canAccessReports: boolean;
    canModifyUserRoles: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    [UserRole.ADMIN]: {
        canAccessUserManagement: true,
        canAccessGlobalStats: true,
        canAccessInventoryManagement: true,
        canAccessOrderManagement: true,
        canAccessDeliveryManagement: true,
        canAccessReports: true,
        canModifyUserRoles: true,
    },
    [UserRole.LOGISTICS_TECHNICIAN]: {
        canAccessUserManagement: false,
        canAccessGlobalStats: true,
        canAccessInventoryManagement: true,
        canAccessOrderManagement: false,
        canAccessDeliveryManagement: true,
        canAccessReports: true,
        canModifyUserRoles: false,
    },
    [UserRole.MERCHANT]: {
        canAccessUserManagement: false,
        canAccessGlobalStats: false,
        canAccessInventoryManagement: true,
        canAccessOrderManagement: true,
        canAccessDeliveryManagement: false,
        canAccessReports: false,
        canModifyUserRoles: false,
    },
    [UserRole.DELIVERY_PERSON]: {
        canAccessUserManagement: false,
        canAccessGlobalStats: false,
        canAccessInventoryManagement: false,
        canAccessOrderManagement: false,
        canAccessDeliveryManagement: true,
        canAccessReports: false,
        canModifyUserRoles: false,
    },
};

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
    return ROLE_PERMISSIONS[role][permission];
}

export function getRoleDisplayName(role: UserRole): string {
    switch (role) {
        case UserRole.ADMIN:
            return 'Administrateur';
        case UserRole.LOGISTICS_TECHNICIAN:
            return 'Technicien Logistique';
        case UserRole.MERCHANT:
            return 'Commerçant';
        case UserRole.DELIVERY_PERSON:
            return 'Livreur';
        default:
            return 'Utilisateur';
    }
}

export function isValidRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
}
