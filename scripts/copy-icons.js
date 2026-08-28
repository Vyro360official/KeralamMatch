const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\2506782a-b15a-49f3-a56c-c9831eed0d39\\km_logo_1787866314881.jpg';
const rootDir = path.resolve(__dirname, '..');

const destinations = [
  path.join(rootDir, 'public', 'KM LOGO.png'),
  path.join(rootDir, 'public', 'assets', 'icon-192.png'),
  path.join(rootDir, 'public', 'assets', 'icon-512.png'),
  path.join(rootDir, 'public', 'icons', 'icon-192.png')
];

// Ensure target directories exist
const dirsToCreate = [
  path.join(rootDir, 'public', 'assets'),
  path.join(rootDir, 'public', 'icons')
];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

destinations.forEach(dest => {
  try {
    fs.copyFileSync(srcPath, dest);
    console.log(`Copied logo to: ${dest}`);
  } catch (err) {
    console.error(`Error copying to ${dest}:`, err.message);
  }
});
