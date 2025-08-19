import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useGetUsersQuery } from '../store/api/userApi';

// Temporary workaround for CommonJS import issue in Vite build
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

const isValidRole = (role: string): role is UserRole => {
    return Object.values(UserRole).includes(role as UserRole);
};

export function AdminDashboard() {
    const { data: users, isLoading, error } = useGetUsersQuery();

    if (isLoading) {
        return (
            <DashboardLayout title="Administration" description="Gestion globale de la plateforme">
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-3">
                        <div className="loading-spinner"></div>
                        <span className="text-gray-600">Chargement...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Administration" description="Gestion globale de la plateforme">
                <div className="text-center py-8">
                    <div className="text-red-500 mb-2">Erreur lors du chargement des utilisateurs</div>
                </div>
            </DashboardLayout>
        );
    }

    const getUserRoleColor = (role: UserRole) => {
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

    const roleStats =
        users?.reduce(
            (acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            },
            {} as Record<UserRole, number>,
        ) || {};

    return (
        <DashboardLayout title="Administration" description="Gestion globale de la plateforme">
            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500">Total Utilisateurs</div>
                                <div className="text-2xl font-bold text-gray-900">{users?.length || 0}</div>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {Object.entries(roleStats).map(([role, count]) => {
                        if (!isValidRole(role)) return null;
                        return (
                            <div key={role} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-500">
                                            {getRoleDisplayName(role)}
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{count as number}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Users Table */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Gestion des Utilisateurs</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Utilisateur
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rôle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Créé le
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users?.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserRoleColor(user.role)}`}
                                            >
                                                {getRoleDisplayName(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.createdAt && new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                Modifier
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">Supprimer</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
