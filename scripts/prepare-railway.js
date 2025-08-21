#!/usr/bin/env node

/**
 * Railway Preparation Script
 * Resolves workspace: protocol issues for Railway deployment
 */

const fs = require('fs');
const path = require('path');

function log(message) {
    console.log(`🚂 [Railway] ${message}`);
}

function updatePackageJson(filePath, appName) {
    log(`Processing ${appName} package.json...`);
    
    if (!fs.existsSync(filePath)) {
        log(`⚠️  ${filePath} not found, skipping...`);
        return;
    }

    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Replace workspace: protocol with file: path
    if (packageJson.dependencies && packageJson.dependencies['@rncp/types']) {
        if (packageJson.dependencies['@rncp/types'].startsWith('workspace:')) {
            log(`  Replacing workspace: protocol for @rncp/types`);
            packageJson.dependencies['@rncp/types'] = 'file:../../tools';
        }
    }
    
    // Write back the modified package.json
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
    log(`  ✅ Updated ${appName} package.json`);
}

function main() {
    log('Starting Railway preparation...');
    
    // Get the root directory (should be monorepo root)
    const rootDir = process.cwd();
    log(`Working directory: ${rootDir}`);
    
    // Update API package.json
    updatePackageJson(path.join(rootDir, 'apps', 'rncp_api', 'package.json'), 'API');
    
    // Update Frontend package.json  
    updatePackageJson(path.join(rootDir, 'apps', 'rncp_PWA_front', 'package.json'), 'Frontend');
    
    log('Railway preparation completed! 🎉');
}

if (require.main === module) {
    main();
}

module.exports = { updatePackageJson };