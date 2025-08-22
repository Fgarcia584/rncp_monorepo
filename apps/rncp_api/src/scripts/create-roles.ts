import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Order } from '../entities/order.entity';
import { UserRole } from '../types';

// Configuration de la connexion à la base de données
const AppDataSource = new DataSource(
    process.env.DATABASE_URL
        ? {
              type: 'postgres',
              url: process.env.DATABASE_URL,
              entities: [User, RefreshToken, Order],
              synchronize: false,
              logging: true,
              ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          }
        : {
              type: 'postgres',
              host: process.env.DB_HOST || 'localhost',
              port: parseInt(process.env.DB_PORT || '5432', 10),
              username: process.env.DB_USER || 'rncp_user',
              password: process.env.DB_PASSWORD || 'rncp_password',
              database: process.env.DB_NAME || 'rncp_db',
              entities: [User, RefreshToken, Order],
              synchronize: false,
              logging: true,
          },
);

async function createRoleAccounts() {
    try {
        console.log('🚀 Création des comptes pour chaque rôle...');

        // Connexion à la base de données
        await AppDataSource.initialize();
        console.log('✅ Connexion établie avec la base de données');

        const userRepository = AppDataSource.getRepository(User);

        // Mot de passe commun pour tous les comptes
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Définir les comptes à créer
        const accounts = [
            {
                email: 'admin@rncp.com',
                name: 'Administrateur',
                role: UserRole.ADMIN,
            },
            {
                email: 'merchant@rncp.com', 
                name: 'Commerçant',
                role: UserRole.MERCHANT,
            },
            {
                email: 'livreur@rncp.com',
                name: 'Livreur',
                role: UserRole.DELIVERY_PERSON,
            },
            {
                email: 'technicien@rncp.com',
                name: 'Technicien Logistique', 
                role: UserRole.LOGISTICS_TECHNICIAN,
            },
        ];

        console.log('👥 Création des comptes utilisateurs...');

        for (const accountData of accounts) {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await userRepository.findOne({
                where: { email: accountData.email }
            });

            if (existingUser) {
                console.log(`  ⚠️  ${accountData.email} existe déjà`);
                continue;
            }

            // Créer le nouvel utilisateur
            const user = userRepository.create({
                email: accountData.email,
                name: accountData.name,
                password: hashedPassword,
                role: accountData.role,
            });

            await userRepository.save(user);
            console.log(`  ✅ ${accountData.email} créé (${accountData.role})`);
        }

        console.log('\n🎉 Comptes créés avec succès !');
        console.log('\n🔐 Informations de connexion :');
        console.log('  Email: admin@rncp.com | Mot de passe: password123');
        console.log('  Email: merchant@rncp.com | Mot de passe: password123');
        console.log('  Email: livreur@rncp.com | Mot de passe: password123');
        console.log('  Email: technicien@rncp.com | Mot de passe: password123');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création des comptes :', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
        console.log('\n👋 Connexion fermée');
    }
}

// Lancer la création des comptes
createRoleAccounts().catch(console.error);