import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['app.js'],
  outfile: 'dist/app.js',
  bundle: true,
  platform: 'browser',
  format: 'esm',
  minify: true,
  plugins: [{
    name: 'hosted-sharing',
    setup(build) {
      build.onResolve({ filter: /^\.\/sharing\.js$/ }, () => ({
        path: fileURLToPath(new URL('./sharing-hosted.js', import.meta.url)),
      }));
    },
  }],
});
for (const name of ['index.html', 'style.css', 'favicon.svg']) {
  await copyFile(new URL(name, import.meta.url), new URL(`dist/${name}`, import.meta.url));
}
console.log('Static site built in dist/');
