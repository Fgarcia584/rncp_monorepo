/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing API for Railway deployment...');

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove workspace dependencies that Railway can't handle
if (packageJson.dependencies && packageJson.dependencies['@rncp/types']) {
    console.log('📦 Removing workspace dependency @rncp/types...');
    delete packageJson.dependencies['@rncp/types'];
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json updated for Railway deployment');

console.log('🎯 Railway preparation complete!');
