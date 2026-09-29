// Installs the HyperFrames skills pinned in upstream-skills.lock.json into .devin/skills/
// and verifies each bundle against the upstream skills-manifest hash for that tag.
// Usage: node install-upstream-skills.mjs [--verify-only]
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const skillsRoot = join(here, '..', '..');
const lock = JSON.parse(readFileSync(join(here, 'upstream-skills.lock.json'), 'utf8'));
const verifyOnly = process.argv.includes('--verify-only');

// Mirrors hashSkillBundle() in hyperframes packages/cli/src/utils/skillsManifest.ts at the pinned tag.
const TEXT_EXT = new Set(['.md', '.txt', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json', '.svg', '.csv', '.yml', '.yaml']);
function listFilesSorted(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      if (name === '.DS_Store') continue;
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(p);
    }
  };
  walk(dir);
  return out.sort();
}
function hashSkillBundle(dir) {
  const files = listFilesSorted(dir);
  const h = createHash('sha256');
  for (const f of files) {
    const rel = relative(dir, f).split(sep).join('/');
    h.update(rel);
    h.update('\0');
    const ext = rel.slice(rel.lastIndexOf('.'));
    const buf = readFileSync(f);
    if (TEXT_EXT.has(ext)) h.update(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
    else h.update(buf);
    h.update('\0');
  }
  return { hash: h.digest('hex').slice(0, 16), files: files.length };
}

if (!verifyOnly) {
  const tmp = mkdtempSync(join(tmpdir(), 'hyperframes-skills-'));
  try {
    execFileSync('git', ['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--depth', '1', '--branch', lock.tag, lock.source, tmp], { stdio: 'inherit', env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' } });
    const commit = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (commit !== lock.commit) throw new Error(`Tag ${lock.tag} resolved to ${commit}, expected ${lock.commit}`);
    for (const name of Object.keys(lock.skills)) {
      const dest = join(skillsRoot, name);
      rmSync(dest, { recursive: true, force: true });
      cpSync(join(tmp, 'skills', name), dest, { recursive: true });
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

let failed = false;
for (const [name, expected] of Object.entries(lock.skills)) {
  const dir = join(skillsRoot, name);
  const actual = existsSync(dir) ? hashSkillBundle(dir) : { hash: 'missing', files: 0 };
  const ok = actual.hash === expected.hash && actual.files === expected.files;
  failed ||= !ok;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} ${actual.hash} (${actual.files} files)`);
}
if (failed) process.exit(1);
