-- Script d'initialisation de la base de données RNCP
-- ====================================================

-- Création de l'enum pour les rôles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'MERCHANT', 'DELIVERY_PERSON', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Création de l'enum pour les statuts de commande
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Création de l'enum pour les priorités de commande
DO $$ BEGIN
    CREATE TYPE order_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL,
    delivery_person_id INTEGER,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    delivery_address TEXT NOT NULL,
    delivery_coordinates JSONB,
    scheduled_delivery_time TIMESTAMP NOT NULL,
    status order_status DEFAULT 'PENDING',
    priority order_priority DEFAULT 'NORMAL',
    notes TEXT,
    estimated_delivery_duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES users(id),
    FOREIGN KEY (delivery_person_id) REFERENCES users(id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_person_id ON orders(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_delivery ON orders(scheduled_delivery_time);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour auto-update du timestamp
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertion des données de test
-- ===============================

-- Note: Le mot de passe est 'password123' hashé avec bcrypt (10 rounds)
-- Hash: $2b$10$YOUR_ACTUAL_HASH_HERE
-- Pour générer un vrai hash, utilisez le script TypeScript

-- Admin
INSERT INTO users (email, name, password, role) VALUES
('admin@rncp.com', 'Admin RNCP', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Marchands
INSERT INTO users (email, name, password, role) VALUES
('merchant1@rncp.com', 'Marchand 1', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'MERCHANT'),
('merchant2@rncp.com', 'Marchand 2', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'MERCHANT'),
('merchant3@rncp.com', 'Marchand 3', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'MERCHANT')
ON CONFLICT (email) DO NOTHING;

-- Livreurs
INSERT INTO users (email, name, password, role) VALUES
('livreur1@rncp.com', 'Livreur 1', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'DELIVERY_PERSON'),
('livreur2@rncp.com', 'Livreur 2', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'DELIVERY_PERSON'),
('livreur3@rncp.com', 'Livreur 3', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'DELIVERY_PERSON'),
('livreur4@rncp.com', 'Livreur 4', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'DELIVERY_PERSON'),
('livreur5@rncp.com', 'Livreur 5', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'DELIVERY_PERSON')
ON CONFLICT (email) DO NOTHING;

-- Clients
INSERT INTO users (email, name, password, role) VALUES
('client1@rncp.com', 'Client 1', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'CUSTOMER'),
('client2@rncp.com', 'Client 2', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'CUSTOMER'),
('client3@rncp.com', 'Client 3', '$2b$10$K7L1OJ0TfPATxQ5Jx1vb5eNjI2BbqH3k4x2E4/X3.ywK.GymlPH3y', 'CUSTOMER')
ON CONFLICT (email) DO NOTHING;

-- Commandes de test (après avoir les IDs des utilisateurs)
WITH merchant_ids AS (
    SELECT id FROM users WHERE role = 'MERCHANT' LIMIT 3
),
delivery_ids AS (
    SELECT id FROM users WHERE role = 'DELIVERY_PERSON' LIMIT 5
)
INSERT INTO orders (
    merchant_id, 
    delivery_person_id,
    customer_name, 
    customer_phone, 
    delivery_address, 
    delivery_coordinates,
    scheduled_delivery_time, 
    status, 
    priority, 
    notes,
    estimated_delivery_duration
)
SELECT 
    (SELECT id FROM merchant_ids ORDER BY RANDOM() LIMIT 1),
    CASE WHEN RANDOM() > 0.3 THEN (SELECT id FROM delivery_ids ORDER BY RANDOM() LIMIT 1) ELSE NULL END,
    'Client ' || generate_series,
    '+336' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0'),
    CASE (FLOOR(RANDOM() * 5)::INT)
        WHEN 0 THEN '123 Rue de la République, 75001 Paris'
        WHEN 1 THEN '456 Avenue des Champs-Élysées, 75008 Paris'
        WHEN 2 THEN '789 Boulevard Saint-Germain, 75006 Paris'
        WHEN 3 THEN '321 Rue de Rivoli, 75001 Paris'
        ELSE '654 Rue du Faubourg Saint-Honoré, 75008 Paris'
    END,
    jsonb_build_object(
        'latitude', 48.8566 + (RANDOM() - 0.5) * 0.1,
        'longitude', 2.3522 + (RANDOM() - 0.5) * 0.1
    ),
    CURRENT_TIMESTAMP + (INTERVAL '1 day' * FLOOR(RANDOM() * 7)),
    CASE (FLOOR(RANDOM() * 5)::INT)
        WHEN 0 THEN 'PENDING'::order_status
        WHEN 1 THEN 'ASSIGNED'::order_status
        WHEN 2 THEN 'PICKED_UP'::order_status
        WHEN 3 THEN 'IN_TRANSIT'::order_status
        ELSE 'DELIVERED'::order_status
    END,
    CASE (FLOOR(RANDOM() * 4)::INT)
        WHEN 0 THEN 'LOW'::order_priority
        WHEN 1 THEN 'NORMAL'::order_priority
        WHEN 2 THEN 'HIGH'::order_priority
        ELSE 'URGENT'::order_priority
    END,
    'Commande de test ' || generate_series,
    FLOOR(RANDOM() * 60 + 15)
FROM generate_series(1, 20);

-- Afficher les statistiques
SELECT 
    'Statistiques de la base de données:' AS info
UNION ALL
SELECT 
    '- Utilisateurs: ' || COUNT(*) || ' (Admin: ' || 
    SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) || ', Marchands: ' ||
    SUM(CASE WHEN role = 'MERCHANT' THEN 1 ELSE 0 END) || ', Livreurs: ' ||
    SUM(CASE WHEN role = 'DELIVERY_PERSON' THEN 1 ELSE 0 END) || ', Clients: ' ||
    SUM(CASE WHEN role = 'CUSTOMER' THEN 1 ELSE 0 END) || ')'
FROM users
UNION ALL
SELECT 
    '- Commandes: ' || COUNT(*) || ' (En attente: ' ||
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) || ', Assignées: ' ||
    SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) || ', En livraison: ' ||
    SUM(CASE WHEN status IN ('PICKED_UP', 'IN_TRANSIT') THEN 1 ELSE 0 END) || ', Livrées: ' ||
    SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) || ')'
FROM orders;

-- Message de fin
SELECT '✅ Base de données initialisée avec succès !' AS message;
SELECT '📧 Connexion: admin@rncp.com / password123' AS info;
SELECT '📧 Connexion: merchant1@rncp.com / password123' AS info;
SELECT '📧 Connexion: livreur1@rncp.com / password123' AS info;