import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UserRole, OrderStatus, OrderPriority } from '../types';

// Configuration de la connexion à la base de données
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'rncp_user',
    password: process.env.DB_PASSWORD || 'rncp_password',
    database: process.env.DB_NAME || 'rncp_db',
    entities: [User, RefreshToken, Order],
    synchronize: false,
    logging: true,
});

async function initDatabase() {
    try {
        console.log('🚀 Initialisation de la base de données...');

        // Connexion à la base de données
        await AppDataSource.initialize();
        console.log('✅ Connexion établie avec la base de données');

        // Récupération des repositories
        const userRepository = AppDataSource.getRepository(User);
        const orderRepository = AppDataSource.getRepository(Order);
        // const refreshTokenRepository = AppDataSource.getRepository(RefreshToken); // Pour usage futur

        // Vérifier si des données existent déjà
        const existingUsers = await userRepository.count();
        if (existingUsers > 0) {
            console.log(
                '⚠️  Des utilisateurs existent déjà. Voulez-vous réinitialiser ? (commentez le return pour forcer)',
            );
            return;
        }

        console.log('📝 Vérification que les tables existent...');
        // Note: Les tables doivent déjà exister (créées par migrations ou init-schema)

        console.log('👥 Création des utilisateurs de test...');

        // Créer un mot de passe hashé pour tous les utilisateurs de test
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Créer un admin
        const admin = userRepository.create({
            email: 'admin@rncp.com',
            name: 'Admin RNCP',
            password: hashedPassword,
            role: UserRole.ADMIN,
        });
        await userRepository.save(admin);
        console.log('  ✅ Admin créé: admin@rncp.com');

        // Créer des marchands
        const merchants: User[] = [];
        for (let i = 1; i <= 3; i++) {
            const merchant = userRepository.create({
                email: `merchant${i}@rncp.com`,
                name: `Marchand ${i}`,
                password: hashedPassword,
                role: UserRole.MERCHANT,
            });
            merchants.push(await userRepository.save(merchant));
            console.log(`  ✅ Marchand créé: merchant${i}@rncp.com`);
        }

        // Créer des livreurs
        const deliveryPersons: User[] = [];
        for (let i = 1; i <= 5; i++) {
            const deliveryPerson = userRepository.create({
                email: `livreur${i}@rncp.com`,
                name: `Livreur ${i}`,
                password: hashedPassword,
                role: UserRole.DELIVERY_PERSON,
            });
            deliveryPersons.push(await userRepository.save(deliveryPerson));
            console.log(`  ✅ Livreur créé: livreur${i}@rncp.com`);
        }

        // Créer des techniciens logistiques (clients)
        const customers: User[] = [];
        for (let i = 1; i <= 10; i++) {
            const customer = userRepository.create({
                email: `client${i}@rncp.com`,
                name: `Client ${i}`,
                password: hashedPassword,
                role: UserRole.LOGISTICS_TECHNICIAN,
            });
            customers.push(await userRepository.save(customer));
            console.log(`  ✅ Client créé: client${i}@rncp.com`);
        }

        console.log('📦 Création des commandes de test...');

        // Créer des commandes pour chaque marchand
        const orderStatuses = [
            OrderStatus.PENDING,
            OrderStatus.ACCEPTED,
            OrderStatus.IN_TRANSIT,
            OrderStatus.DELIVERED,
        ];
        const orderPriorities = [
            OrderPriority.LOW,
            OrderPriority.NORMAL,
            OrderPriority.HIGH,
            OrderPriority.URGENT,
        ];
        const addresses = [
            '123 Rue de la République, 75001 Paris',
            '456 Avenue des Champs-Élysées, 75008 Paris',
            '789 Boulevard Saint-Germain, 75006 Paris',
            '321 Rue de Rivoli, 75001 Paris',
            '654 Rue du Faubourg Saint-Honoré, 75008 Paris',
            '987 Rue de Vaugirard, 75015 Paris',
            '147 Avenue Victor Hugo, 75016 Paris',
            '258 Rue de la Convention, 75015 Paris',
            '369 Boulevard Haussmann, 75009 Paris',
            '741 Rue Lafayette, 75010 Paris',
        ];

        let orderCount = 0;
        for (const merchant of merchants) {
            // Créer 5-10 commandes par marchand
            const numOrders = Math.floor(Math.random() * 6) + 5;

            for (let i = 0; i < numOrders; i++) {
                const randomStatus =
                    orderStatuses[
                        Math.floor(Math.random() * orderStatuses.length)
                    ];
                const randomPriority =
                    orderPriorities[
                        Math.floor(Math.random() * orderPriorities.length)
                    ];
                const randomAddress =
                    addresses[Math.floor(Math.random() * addresses.length)];

                // Date de livraison dans les prochains 7 jours
                const deliveryDate = new Date();
                deliveryDate.setDate(
                    deliveryDate.getDate() + Math.floor(Math.random() * 7),
                );
                deliveryDate.setHours(Math.floor(Math.random() * 12) + 8); // Entre 8h et 20h
                deliveryDate.setMinutes(Math.random() > 0.5 ? 0 : 30);

                const order = orderRepository.create({
                    merchantId: merchant.id,
                    customerName: `Client ${Math.floor(Math.random() * 100)}`,
                    customerPhone: `+336${Math.floor(Math.random() * 100000000)
                        .toString()
                        .padStart(8, '0')}`,
                    deliveryAddress: randomAddress,
                    deliveryCoordinates: {
                        latitude: 48.8566 + (Math.random() - 0.5) * 0.1, // Autour de Paris
                        longitude: 2.3522 + (Math.random() - 0.5) * 0.1,
                    },
                    scheduledDeliveryTime: deliveryDate,
                    status: randomStatus,
                    priority: randomPriority,
                    deliveryPersonId:
                        randomStatus !== OrderStatus.PENDING
                            ? deliveryPersons[
                                  Math.floor(
                                      Math.random() * deliveryPersons.length,
                                  )
                              ].id
                            : undefined,
                    notes: `Commande test ${++orderCount}`,
                    estimatedDeliveryDuration:
                        Math.floor(Math.random() * 60) + 15, // Entre 15 et 75 minutes
                });

                await orderRepository.save(order);
            }
        }
        console.log(`  ✅ ${orderCount} commandes créées`);

        console.log('\n🎉 Base de données initialisée avec succès !');
        console.log('\n📊 Résumé :');
        console.log(`  - 1 Admin`);
        console.log(`  - ${merchants.length} Marchands`);
        console.log(`  - ${deliveryPersons.length} Livreurs`);
        console.log(`  - ${customers.length} Clients`);
        console.log(`  - ${orderCount} Commandes`);

        console.log('\n🔐 Informations de connexion :');
        console.log('  Email: admin@rncp.com | Mot de passe: password123');
        console.log('  Email: merchant1@rncp.com | Mot de passe: password123');
        console.log('  Email: livreur1@rncp.com | Mot de passe: password123');
        console.log('  Email: client1@rncp.com | Mot de passe: password123');
    } catch (error) {
        console.error(
            "❌ Erreur lors de l'initialisation de la base de données:",
            error,
        );
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
        console.log('\n👋 Connexion fermée');
    }
}

// Lancer l'initialisation
initDatabase().catch(console.error);
