// This is a wrapper script that can be added to package.json
// Usage: npm run import-data <path-to-json-file>

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataImportPath = join(__dirname, '../utils/dataImport.js');
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide the path to the JSON file');
  console.log('Usage: npm run import-data <path-to-json-file>');
  process.exit(1);
}

const child = spawn('node', [dataImportPath, filePath], {
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  process.exit(code);
});

