#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read package.json to get the version
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Read the version template file
const versionTemplatePath = join('src', 'version.ts');
const versionTemplate = readFileSync(versionTemplatePath, 'utf8');

// Replace the version placeholder with the actual version
const versionFile = versionTemplate.replace("'1.0.0'", `'${version}'`);

// Write the updated version file
writeFileSync(versionTemplatePath, versionFile);

console.log(`Version updated to: ${version}`);
