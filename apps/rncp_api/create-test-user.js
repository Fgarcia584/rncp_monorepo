// Script pour créer un utilisateur de test valide
const fetch = require('node-fetch');

const API_URL = 'https://back-staging-2eb0.up.railway.app'; // Remplacez par la vraie URL

async function createTestUser() {
    try {
        console.log('🚀 Création d\'un utilisateur de test...');
        
        const userData = {
            name: "Test Merchant",
            email: "testmerchant@example.com",
            password: "TestPassword123!", // 16 caractères, sécurisé
            role: "MERCHANT"
        };

        console.log('📤 Envoi de la requête d\'inscription...');
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Utilisateur créé avec succès !');
            console.log('📧 Email:', userData.email);
            console.log('🔑 Mot de passe:', userData.password);
            console.log('👤 Rôle:', userData.role);
            console.log('🆔 User ID:', result.user?.id);
        } else {
            console.error('❌ Erreur lors de la création:', result);
        }
    } catch (error) {
        console.error('💥 Erreur:', error.message);
    }
}

createTestUser();