import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

// Configuration de la connexion à la base de données
const AppDataSource = new DataSource(
    process.env.DATABASE_URL
        ? {
              type: 'postgres',
              url: process.env.DATABASE_URL,
              entities: [User, RefreshToken, Order],
              synchronize: true, // Crée automatiquement les tables
              logging: true,
              ssl:
                  process.env.NODE_ENV === 'production'
                      ? { rejectUnauthorized: false }
                      : false,
          }
        : {
              type: 'postgres',
              host: process.env.DB_HOST || 'localhost',
              port: parseInt(process.env.DB_PORT || '5432', 10),
              username: process.env.DB_USER || 'rncp_user',
              password: process.env.DB_PASSWORD || 'rncp_password',
              database: process.env.DB_NAME || 'rncp_db',
              entities: [User, RefreshToken, Order],
              synchronize: true, // Crée automatiquement les tables
              logging: true,
          },
);

async function initSchema() {
    try {
        console.log('🚀 Initialisation du schéma de base de données...'); // v2

        // Connexion à la base de données
        await AppDataSource.initialize();
        console.log('✅ Connexion établie avec la base de données');

        console.log('📝 Création des tables et relations...');
        // synchronize: true dans la config va créer automatiquement les tables

        console.log('✅ Schéma de base de données créé avec succès !');
        console.log('\n📊 Tables créées :');
        console.log('  - users (utilisateurs)');
        console.log('  - refresh_tokens (jetons de rafraîchissement)');
        console.log('  - orders (commandes)');
    } catch (error) {
        console.error('❌ Erreur lors de la création du schéma :', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
        console.log('\n👋 Connexion fermée');
    }
}

// Lancer l'initialisation du schéma
initSchema().catch(console.error);
