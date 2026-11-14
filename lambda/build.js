/**
 * Bundles each Lambda handler (lambda/functions/<name>/index.js) into
 * lambda/functions/<name>/dist/index.js, which template.yaml uses as CodeUri.
 * Run with: npm run build:lambda
 */
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const functionsDir = path.join(__dirname, 'functions');
const names = fs
  .readdirSync(functionsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(functionsDir, d.name, 'index.js')))
  .map((d) => d.name);

(async () => {
  for (const name of names) {
    const dir = path.join(functionsDir, name);
    await esbuild.build({
      entryPoints: [path.join(dir, 'index.js')],
      outfile: path.join(dir, 'dist', 'index.js'),
      bundle: true,
      platform: 'node',
      target: 'node22',
      format: 'cjs',
      minify: true,
      logLevel: 'warning',
    });
    console.log(`built ${name}`);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
