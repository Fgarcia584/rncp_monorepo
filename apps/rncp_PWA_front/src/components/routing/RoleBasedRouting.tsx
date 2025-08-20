import { useAuth } from '../../hooks/useAuth';
import { AdminDashboard } from '../../pages/AdminDashboard';
import { LogisticsTechnicianDashboard } from '../../pages/LogisticsTechnicianDashboard';
import { MerchantDashboard } from '../../pages/MerchantDashboard';
import { DeliveryPersonDashboard } from '../../pages/DeliveryPersonDashboard';

const UserRole = {
    ADMIN: 'admin' as const,
    DELIVERY_PERSON: 'delivery_person' as const,
    MERCHANT: 'merchant' as const,
    LOGISTICS_TECHNICIAN: 'logistics_technician' as const,
};

export function RoleBasedRouting() {
    const { user, isLoading } = useAuth();
    console.log('User role:', user?.role);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center space-x-3">
                    <div className="loading-spinner"></div>
                    <span className="text-lg text-gray-600">Chargement...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // This should be handled by the parent component
    }

    switch (user.role) {
        case UserRole.ADMIN:
            return <AdminDashboard />;
        case UserRole.LOGISTICS_TECHNICIAN:
            return <LogisticsTechnicianDashboard />;
        case UserRole.MERCHANT:
            return <MerchantDashboard />;
        case UserRole.DELIVERY_PERSON:
            return <DeliveryPersonDashboard />;
        default:
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="text-red-500 mb-2">Rôle non reconnu</div>
                        <div className="text-gray-600">Veuillez contacter l&apos;administrateur</div>
                    </div>
                </div>
            );
    }
}
