import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readJson, root } from './lib.mjs';
import { planVersionUpdate } from './release-version.mjs';

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: pnpm release <x.y.z>');
  process.exit(1);
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))));
  });
}

function capture(command, args) {
  return new Promise((resolvePromise, reject) => {
    let output = '';
    const child = spawn(command, args, { cwd: root });
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.on('exit', (code) => (code === 0 ? resolvePromise(output) : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))));
  });
}

async function bumpVersionField(path, oldVersion, newVersion) {
  const absolute = resolve(root, path);
  const content = await readFile(absolute, 'utf8');
  const updated = content.replace(`"version": "${oldVersion}"`, `"version": "${newVersion}"`);
  if (updated === content) throw new Error(`Could not find "version": "${oldVersion}" in ${path}`);
  await writeFile(absolute, updated);
}

const status = await capture('git', ['status', '--porcelain']);
if (status.trim()) {
  console.error('Working tree is not clean. Commit or stash changes before releasing.');
  process.exit(1);
}

const packageDocument = await readJson('package.json');
const config = await readJson('brand.config.json');
let versionUpdate;
try {
  versionUpdate = planVersionUpdate(packageDocument.version, config.brand.version, version);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const changelogPath = resolve(root, 'CHANGELOG.md');
const changelog = await readFile(changelogPath, 'utf8');
if (!changelog.includes('## [Unreleased]')) {
  console.error('CHANGELOG.md has no [Unreleased] section to release.');
  process.exit(1);
}
const releaseDate = new Date().toISOString().slice(0, 10);
await writeFile(changelogPath, changelog.replace(
  '## [Unreleased]',
  `## [Unreleased]\n\n## [${version}] - ${releaseDate}`
));

if (versionUpdate.updatePackage) await bumpVersionField('package.json', versionUpdate.packageVersion, version);
if (versionUpdate.updateBrand) await bumpVersionField('brand.config.json', versionUpdate.brandVersion, version);

console.log(`Building and validating v${version}...`);
await run('pnpm', ['verify']);

console.log('Committing release...');
await run('git', ['add', '-A']);
await run('git', ['commit', '-m', `chore(release): v${version}`]);
await run('git', ['tag', '-a', `v${version}`, '-m', `v${version}`]);

console.log(`\n✓ Release v${version} committed and tagged locally.`);
console.log(`  Review with: git show HEAD`);
console.log(`  Publish with: git push && git push origin v${version}`);
