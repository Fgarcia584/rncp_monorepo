import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

const UserRole = {
    ADMIN: 'admin' as const,
    DELIVERY_PERSON: 'delivery_person' as const,
    MERCHANT: 'merchant' as const,
    LOGISTICS_TECHNICIAN: 'logistics_technician' as const,
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];

const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
        case 'admin':
            return 'Administrateur';
        case 'logistics_technician':
            return 'Technicien Logistique';
        case 'merchant':
            return 'Commerçant';
        case 'delivery_person':
            return 'Livreur';
        default:
            return 'Utilisateur';
    }
};

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
    const { user } = useAuth();

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'bg-red-100 text-red-800';
            case UserRole.LOGISTICS_TECHNICIAN:
                return 'bg-blue-100 text-blue-800';
            case UserRole.MERCHANT:
                return 'bg-green-100 text-green-800';
            case UserRole.DELIVERY_PERSON:
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                            {description && <p className="mt-1 text-gray-600">{description}</p>}
                        </div>
                        {user && (
                            <div className="flex items-center space-x-4">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                                >
                                    {getRoleDisplayName(user.role)}
                                </span>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
