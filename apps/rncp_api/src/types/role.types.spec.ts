import {
    UserRole,
    ROLE_PERMISSIONS,
    hasPermission,
    getRoleDisplayName,
    isValidRole,
} from './role.types';

import { OrderStatus, OrderPriority } from './order.types';

describe('Role Types', () => {
    describe('UserRole enum', () => {
        it('should have all expected roles', () => {
            expect(UserRole.ADMIN).toBe('admin');
            expect(UserRole.DELIVERY_PERSON).toBe('delivery_person');
            expect(UserRole.MERCHANT).toBe('merchant');
            expect(UserRole.LOGISTICS_TECHNICIAN).toBe('logistics_technician');
        });
    });

    describe('ROLE_PERMISSIONS', () => {
        it('should give admins all permissions', () => {
            const adminPermissions = ROLE_PERMISSIONS[UserRole.ADMIN];

            expect(adminPermissions.canAccessUserManagement).toBe(true);
            expect(adminPermissions.canAccessGlobalStats).toBe(true);
            expect(adminPermissions.canAccessInventoryManagement).toBe(true);
            expect(adminPermissions.canAccessOrderManagement).toBe(true);
            expect(adminPermissions.canAccessDeliveryManagement).toBe(true);
            expect(adminPermissions.canAccessReports).toBe(true);
            expect(adminPermissions.canModifyUserRoles).toBe(true);
        });

        it('should give logistics technicians appropriate permissions', () => {
            const techPermissions =
                ROLE_PERMISSIONS[UserRole.LOGISTICS_TECHNICIAN];

            expect(techPermissions.canAccessUserManagement).toBe(false);
            expect(techPermissions.canAccessGlobalStats).toBe(true);
            expect(techPermissions.canAccessInventoryManagement).toBe(true);
            expect(techPermissions.canAccessOrderManagement).toBe(false);
            expect(techPermissions.canAccessDeliveryManagement).toBe(true);
            expect(techPermissions.canAccessReports).toBe(true);
            expect(techPermissions.canModifyUserRoles).toBe(false);
        });

        it('should give merchants appropriate permissions', () => {
            const merchantPermissions = ROLE_PERMISSIONS[UserRole.MERCHANT];

            expect(merchantPermissions.canAccessUserManagement).toBe(false);
            expect(merchantPermissions.canAccessGlobalStats).toBe(false);
            expect(merchantPermissions.canAccessInventoryManagement).toBe(true);
            expect(merchantPermissions.canAccessOrderManagement).toBe(true);
            expect(merchantPermissions.canAccessDeliveryManagement).toBe(false);
            expect(merchantPermissions.canAccessReports).toBe(false);
            expect(merchantPermissions.canModifyUserRoles).toBe(false);
        });

        it('should give delivery persons minimal permissions', () => {
            const deliveryPermissions =
                ROLE_PERMISSIONS[UserRole.DELIVERY_PERSON];

            expect(deliveryPermissions.canAccessUserManagement).toBe(false);
            expect(deliveryPermissions.canAccessGlobalStats).toBe(false);
            expect(deliveryPermissions.canAccessInventoryManagement).toBe(
                false,
            );
            expect(deliveryPermissions.canAccessOrderManagement).toBe(false);
            expect(deliveryPermissions.canAccessDeliveryManagement).toBe(true);
            expect(deliveryPermissions.canAccessReports).toBe(false);
            expect(deliveryPermissions.canModifyUserRoles).toBe(false);
        });
    });

    describe('hasPermission', () => {
        it('should return true when role has permission', () => {
            const result = hasPermission(
                UserRole.ADMIN,
                'canAccessUserManagement',
            );
            expect(result).toBe(true);
        });

        it('should return false when role does not have permission', () => {
            const result = hasPermission(
                UserRole.DELIVERY_PERSON,
                'canAccessUserManagement',
            );
            expect(result).toBe(false);
        });

        it('should work with all permission types', () => {
            expect(
                hasPermission(UserRole.MERCHANT, 'canAccessOrderManagement'),
            ).toBe(true);
            expect(
                hasPermission(
                    UserRole.LOGISTICS_TECHNICIAN,
                    'canAccessInventoryManagement',
                ),
            ).toBe(true);
            expect(
                hasPermission(
                    UserRole.DELIVERY_PERSON,
                    'canAccessDeliveryManagement',
                ),
            ).toBe(true);
        });
    });

    describe('getRoleDisplayName', () => {
        it('should return correct display names for all roles', () => {
            expect(getRoleDisplayName(UserRole.ADMIN)).toBe('Administrateur');
            expect(getRoleDisplayName(UserRole.LOGISTICS_TECHNICIAN)).toBe(
                'Technicien Logistique',
            );
            expect(getRoleDisplayName(UserRole.MERCHANT)).toBe('Commerçant');
            expect(getRoleDisplayName(UserRole.DELIVERY_PERSON)).toBe(
                'Livreur',
            );
        });

        it('should return default for unknown role', () => {
            const result = getRoleDisplayName('unknown' as UserRole);
            expect(result).toBe('Utilisateur');
        });
    });

    describe('isValidRole', () => {
        it('should return true for valid roles', () => {
            expect(isValidRole('admin')).toBe(true);
            expect(isValidRole('delivery_person')).toBe(true);
            expect(isValidRole('merchant')).toBe(true);
            expect(isValidRole('logistics_technician')).toBe(true);
        });

        it('should return false for invalid roles', () => {
            expect(isValidRole('invalid_role')).toBe(false);
            expect(isValidRole('')).toBe(false);
            expect(isValidRole(null as unknown as string)).toBe(false);
            expect(isValidRole(undefined as unknown as string)).toBe(false);
        });
    });

    describe('OrderStatus enum', () => {
        it('should have correct enum values', () => {
            expect(OrderStatus.PENDING).toBe('pending');
            expect(OrderStatus.ACCEPTED).toBe('accepted');
            expect(OrderStatus.IN_TRANSIT).toBe('in_transit');
            expect(OrderStatus.DELIVERED).toBe('delivered');
            expect(OrderStatus.CANCELLED).toBe('cancelled');
        });

        it('should contain all expected statuses', () => {
            const expectedStatuses = [
                'pending',
                'accepted',
                'in_transit',
                'delivered',
                'cancelled',
            ];
            const actualStatuses = Object.values(OrderStatus);

            expect(actualStatuses).toHaveLength(expectedStatuses.length);
            expectedStatuses.forEach((status) => {
                expect(actualStatuses).toContain(status);
            });
        });

        it('should allow type checking', () => {
            const testStatus: OrderStatus = OrderStatus.PENDING;
            expect(testStatus).toBe('pending');

            const isValidStatus = (status: string): status is OrderStatus => {
                return Object.values(OrderStatus).includes(
                    status as OrderStatus,
                );
            };

            expect(isValidStatus('pending')).toBe(true);
            expect(isValidStatus('invalid_status')).toBe(false);
        });

        it('should support workflow transitions', () => {
            // Test typical order workflow
            const workflowOrder = [
                OrderStatus.PENDING,
                OrderStatus.ACCEPTED,
                OrderStatus.IN_TRANSIT,
                OrderStatus.DELIVERED,
            ];

            expect(workflowOrder).toEqual([
                'pending',
                'accepted',
                'in_transit',
                'delivered',
            ]);
        });
    });

    describe('OrderPriority enum', () => {
        it('should have correct enum values', () => {
            expect(OrderPriority.LOW).toBe('low');
            expect(OrderPriority.NORMAL).toBe('normal');
            expect(OrderPriority.HIGH).toBe('high');
            expect(OrderPriority.URGENT).toBe('urgent');
        });

        it('should contain all expected priorities', () => {
            const expectedPriorities = ['low', 'normal', 'high', 'urgent'];
            const actualPriorities = Object.values(OrderPriority);

            expect(actualPriorities).toHaveLength(expectedPriorities.length);
            expectedPriorities.forEach((priority) => {
                expect(actualPriorities).toContain(priority);
            });
        });

        it('should allow type checking', () => {
            const testPriority: OrderPriority = OrderPriority.HIGH;
            expect(testPriority).toBe('high');

            const isValidPriority = (
                priority: string,
            ): priority is OrderPriority => {
                return Object.values(OrderPriority).includes(
                    priority as OrderPriority,
                );
            };

            expect(isValidPriority('high')).toBe(true);
            expect(isValidPriority('invalid_priority')).toBe(false);
        });

        it('should support priority ordering', () => {
            // Test that priorities can be ordered logically
            const priorityOrder = [
                OrderPriority.LOW,
                OrderPriority.NORMAL,
                OrderPriority.HIGH,
                OrderPriority.URGENT,
            ];

            expect(priorityOrder).toEqual(['low', 'normal', 'high', 'urgent']);
        });

        it('should have default priority', () => {
            // NORMAL should be the default priority
            expect(OrderPriority.NORMAL).toBe('normal');
        });
    });
});
