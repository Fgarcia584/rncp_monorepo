/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing API for Railway deployment...');

// Copy package-railway.json to package.json
const railwayPackageJsonPath = path.join(__dirname, 'package-railway.json');
const packageJsonPath = path.join(__dirname, 'package.json');

if (fs.existsSync(railwayPackageJsonPath)) {
    console.log('📦 Using package-railway.json for Railway deployment...');
    const railwayPackageJson = fs.readFileSync(railwayPackageJsonPath, 'utf8');
    fs.writeFileSync(packageJsonPath, railwayPackageJson);
    console.log('✅ Package.json updated for Railway deployment');
} else {
    console.log(
        '⚠️ package-railway.json not found, using existing package.json',
    );
}

console.log('🎯 Railway preparation complete!');
