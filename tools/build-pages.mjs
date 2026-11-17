import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, '_site');
const basePath = '/Pindeck/';
const publicEntries = [
  'index.html',
  '_next',
  'emulator',
  'apple-icon.png',
  'icon.svg',
  'icon1.png',
  'icon2.png',
  'icon3.png',
  'opengraph-image.png',
  'twitter-image.png',
  'pindeck-logo.png',
  'pindeck-brand.js',
];
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.webmanifest']);
const rootAsset = /(["'`(])\/(?!\/|Pindeck\/)(_next\/|emulator\/|apple-icon\.png|icon\.svg|icon[123]\.png|opengraph-image\.png|twitter-image\.png|pindeck-logo\.png|pindeck-brand\.js)/g;

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of publicEntries) {
  await cp(path.join(root, entry), path.join(output, entry), { recursive: true });
}

async function rewrite(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewrite(target);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    const original = await readFile(target, 'utf8');
    const updated = original.replace(rootAsset, `$1${basePath}$2`);
    if (updated !== original) await writeFile(target, updated);
  }
}

await rewrite(output);
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`GitHub Pages bundle created at ${output}`);
