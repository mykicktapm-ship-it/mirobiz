import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
mkdirSync('dist/assets', { recursive: true });
const html = readFileSync('index.html','utf8').replace('/src/styles/app.css','/assets/app.css').replace('/src/main.js','/assets/main.js');
writeFileSync('dist/index.html', html);
copyFileSync('src/styles/app.css', 'dist/assets/app.css');
console.log('Built static Business OS MVP into dist/');
