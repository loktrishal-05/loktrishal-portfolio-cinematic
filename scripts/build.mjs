import { cp, mkdir, rm, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
for (const source of ['index.html', 'styles.css', 'app.js', 'public', 'data/copy.en.json']) {
  await access(resolve(root, source));
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const source of ['index.html', 'styles.css', 'refinements.css']) {
  await cp(resolve(root, source), resolve(output, source));
}
await cp(resolve(root, 'public'), output, { recursive: true });
await cp(resolve(root, 'Resume.pdf'), resolve(output, 'Resume.pdf')).catch(error => { if (error.code !== 'ENOENT') throw error; });
await cp(resolve(root, 'data'), resolve(output, 'data'), { recursive: true });
await build({ entryPoints: [resolve(root, 'app.js')], outdir: resolve(output, 'assets'), bundle: true, splitting: true, format: 'esm', minify: true, sourcemap: false, target: 'es2022', chunkNames: '[name]-[hash]' });
console.log('Built static portfolio in dist/');
