const fs = require('fs');
const path = require('path');

// Chemins source et destination
const typesSourceDir = path.resolve(__dirname, '../../tools/types');
const typesDestDir = path.resolve(__dirname, 'src/types');

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(typesDestDir)) {
    fs.mkdirSync(typesDestDir, { recursive: true });
}

// Fonction pour copier récursivement
function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`Source directory ${src} does not exist`);
        return;
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
        } else {
            // Skip test files in frontend
            if (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.test.ts')) {
                console.log(`Skipped test file: ${entry.name}`);
                return;
            }
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${entry.name}`);
        }
    }
}

console.log('Copying types from tools to Frontend...');
copyDir(typesSourceDir, typesDestDir);
console.log('Types copied successfully!');