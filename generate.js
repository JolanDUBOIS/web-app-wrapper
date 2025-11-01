#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// now you can use __dirname safely
const templateDir = path.join(__dirname, 'template');
const outputDir = path.join(__dirname, 'dist');

// Ask user for app info
const answers = await inquirer.prompt([
  { name: 'name', message: 'App name:' },
  { name: 'url', message: 'URL to wrap:' },
  { name: 'iconPath', message: 'Full path to icon.png:' }
]);

// Destination folder for the generated app
const appDir = path.join(outputDir, answers.name);

// Copy the entire template folder into the new app folder
await fs.copy(templateDir, appDir);

// ----------------------
// 1. Update main.js
// ----------------------
const mainPath = path.join(appDir, 'main.js');
let mainContent = await fs.readFile(mainPath, 'utf-8');
mainContent = mainContent.replace('__URL__', answers.url);
await fs.writeFile(mainPath, mainContent);

// ----------------------
// 2. Copy user-selected icon
// ----------------------
const iconDest = path.join(appDir, 'icon.png');
await fs.copy(answers.iconPath, iconDest);

// ----------------------
// 3. Generate run.sh from template
// ----------------------
const runTemplatePath = path.join(templateDir, 'run.sh.template');
let runContent = await fs.readFile(runTemplatePath, 'utf-8');
// Replace placeholder with app name
runContent = runContent.replace(/__APPNAME__/g, answers.name);
const runShPath = path.join(appDir, 'run.sh');
await fs.writeFile(runShPath, runContent);
// Make it executable
execSync(`chmod +x "${runShPath}"`);

// ----------------------
// 4. Generate .desktop file from template
// ----------------------
const desktopTemplatePath = path.join(templateDir, 'app.desktop.template');
let desktopContent = await fs.readFile(desktopTemplatePath, 'utf-8');
desktopContent = desktopContent
  .replace(/__APPNAME__/g, answers.name)
  .replace(/__URL__/g, answers.url)
  .replace(/__APPDIR__/g, appDir)
  .replace(/__ICON__/g, iconDest);

const desktopPath = path.join(appDir, `${answers.name}.desktop`);
await fs.writeFile(desktopPath, desktopContent);

// ----------------------
// 5. Install dependencies automatically
// ----------------------
// This ensures Electron is installed inside the generated app folder
console.log('Installing dependencies...');
execSync('npm install', { cwd: appDir, stdio: 'inherit' });

// ----------------------
// 6. Fix chrome-sandbox permissions
// ----------------------

try {
  const chromeSandboxPath = path.join(appDir, 'node_modules', 'electron', 'dist', 'chrome-sandbox');
  // Change owner to root
  execSync(`sudo chown root:root "${chromeSandboxPath}"`);
  // Set setuid bit
  execSync(`sudo chmod 4755 "${chromeSandboxPath}"`);

  console.log('chrome-sandbox permissions fixed');
} catch (err) {
  console.warn('Failed to fix chrome-sandbox permissions automatically. You may need to run manually:', err.message);
}

// ----------------------
// Done
// ----------------------
console.log(`\nApp "${answers.name}" created successfully in ${appDir}`);
console.log(`Move the folder to your preferred location and place the .desktop file in ~/.local/share/applications/`);
console.log(`Then you can launch it via the run.sh script or the .desktop file.`);
